const pool = require("../db");

// 1) GET /api/projects/dashboard
// Return latest 5 projects of logged-in user with counts
// 1) GET /api/projects/dashboard
// Return aggregate stats for the cards
const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Parallel queries for stats
    const [projRes, depRes, vulRes] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM projects WHERE user_id = $1", [userId]),
      pool.query(
        "SELECT COUNT(*) FROM dependencies d JOIN projects p ON d.project_id = p.project_id WHERE p.user_id = $1",
        [userId]
      ),
      pool.query(
        "SELECT COUNT(*) FROM dependency_vul dv JOIN projects p ON dv.project_id = p.project_id WHERE p.user_id = $1",
        [userId]
      )
    ]);

    res.json({
      totalProjects: parseInt(projRes.rows[0].count),
      totalDependencies: parseInt(depRes.rows[0].count),
      totalVulnerabilities: parseInt(vulRes.rows[0].count)
    });
  } catch (err) {
    console.error("Error fetching dashboard stats:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 2) GET /api/projects
// Return all projects for dropdown
// 2) GET /api/projects
// Return all projects for grid with stats
const getAllProjects = async (req, res) => {
  try {
    const userId = req.user.id;
    const query = `
      SELECT 
        p.project_id, 
        p.project_name, 
        p.description,
        p.last_scanned as last_scanned,
        (SELECT COUNT(*) FROM dependencies d WHERE d.project_id = p.project_id) AS total_dependencies,
        (SELECT COUNT(*) FROM dependency_vul dv WHERE dv.project_id = p.project_id) AS total_vulnerabilities
      FROM projects p
      WHERE p.user_id = $1
      ORDER BY p.created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching projects:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 3) GET /api/projects/:id/details
const getProjectDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const projectId = req.params.id;

    // Verify ownership
    const projectCheck = await pool.query(
      `SELECT 
        project_id, 
        project_name, 
        description, 
        last_scanned, 
        created_at 
       FROM projects 
       WHERE project_id = $1 AND user_id = $2`,
      [projectId, userId]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ message: "Project not found or unauthorized" });
    }

    const project = projectCheck.rows[0];

    // Get dependencies
    const depsQuery = `
      SELECT dependency_name, current_version as version FROM dependencies WHERE project_id = $1
    `;
    const depsResult = await pool.query(depsQuery, [projectId]);

    // Get vulnerabilities
    const vulQuery = `
      SELECT dv.severity, dv.summary as description, d.dependency_name 
      FROM dependency_vul dv
      JOIN dependencies d ON dv.dependency_id = d.dependency_id
      WHERE dv.project_id = $1
    `;
    const vulResult = await pool.query(vulQuery, [projectId]);

    res.json({
      project: {
        project_id: project.project_id,
        project_name: project.project_name,
        description: project.description,
        last_scanned: project.last_scanned || project.created_at
      },
      dependencies: depsResult.rows,
      vulnerabilities: vulResult.rows,
    });
  } catch (err) {
    console.error("Error fetching project details:", err);
    res.status(500).json({ message: "Server error" });
  }
};
const { scanRepo } = require("../services/repoScanService");
const { scanDependency } = require("../services/vulnerabilityService");

const createProject = async (req, res) => {
  const client = await pool.connect();

  try {
    const userId = req.user.id;
    const { project_name, description } = req.body;
    const file = req.file;

    await client.query("BEGIN");

    // ----------------------------
    // Insert Project
    // ----------------------------
    const projectResult = await client.query(
      `INSERT INTO projects (user_id, project_name, description)
       VALUES ($1, $2, $3)
       RETURNING project_id`,
      [userId, project_name, description]
    );

    const projectId = projectResult.rows[0].project_id;

    // ----------------------------
    // Handle File Upload Scan (Optional)
    // ----------------------------
    if (file) {
      let dependencies = [];
      const fileContent = file.buffer.toString("utf-8");

      if (file.originalname === "package.json") {
        try {
          const json = JSON.parse(fileContent);
          const allDeps = {
            ...(json.dependencies || {}),
            ...(json.devDependencies || {})
          };

          for (const [name, version] of Object.entries(allDeps)) {
            dependencies.push({
              name,
              version: version.replace(/[^0-9.]/g, ""), // Clean ^ ~ etc
              manager: "npm"
            });
          }
        } catch (e) {
          await client.query("ROLLBACK");
          return res.status(400).json({ message: "Invalid package.json format" });
        }
      } else {
        await client.query("ROLLBACK");
        return res.status(400).json({
          message: "Unsupported file format. Use package.json"
        });
      }

      // Scan + Insert Dependencies
      for (const dep of dependencies) {
        const scanResult = await scanDependency(dep.name, dep.version);
        const depInsert = await client.query(
          `INSERT INTO dependencies
           (project_id, dependency_name, current_version, latest_version, package_manager)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING dependency_id`,
          [projectId, dep.name, dep.version, scanResult.safeVersion || dep.version, dep.manager]
        );

        const dependencyId = depInsert.rows[0].dependency_id;

        for (const vuln of scanResult.vulnerabilities) {
          await client.query(
            `INSERT INTO dependency_vul
             (dependency_id, project_id, cve_id, severity, summary)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (dependency_id, cve_id) DO NOTHING`,
            [dependencyId, projectId, vuln.id, vuln.severity || "UNKNOWN", vuln.summary || "No description available"]
          );
        }
      }
    }

    await client.query("COMMIT");

    res.status(201).json({
      message: "Project created successfully",
      projectId
    });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error creating project:", err);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
};

const repoScan = async (req, res) => {
  const { id: projectId } = req.params;
  const { repoUrl } = req.body;
  const userId = req.user.id;

  if (!repoUrl || !repoUrl.startsWith("https://")) {
    return res.status(400).json({ message: "Valid Git HTTPS URL required" });
  }

  const client = await pool.connect();
  try {
    // Ownership check
    const projectRes = await client.query("SELECT * FROM projects WHERE project_id = $1 AND user_id = $2", [projectId, userId]);
    if (projectRes.rows.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    const dependenciesData = await scanRepo(repoUrl);

    await client.query("BEGIN");

    for (const dep of dependenciesData) {
      const scanResult = await scanDependency(dep.name, dep.version);

      const depInsert = await client.query(
        `INSERT INTO dependencies
         (project_id, dependency_name, current_version, latest_version, package_manager)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (project_id, dependency_name) DO UPDATE 
         SET current_version = $3, latest_version = $4
         RETURNING dependency_id`,
        [projectId, dep.name, dep.version, scanResult.safeVersion || dep.version, dep.manager]
      );

      const dependencyId = depInsert.rows[0].dependency_id;

      for (const vuln of scanResult.vulnerabilities) {
        await client.query(
          `INSERT INTO dependency_vul
           (dependency_id, project_id, cve_id, severity, summary)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (dependency_id, cve_id) DO NOTHING`,
          [dependencyId, projectId, vuln.id, vuln.severity || "UNKNOWN", vuln.summary || "No description available"]
        );
      }
    }

    await client.query("UPDATE projects SET last_scanned = NOW() WHERE project_id = $1", [projectId]);
    await client.query("COMMIT");

    res.json({ message: "Repository scanned successfully", count: dependenciesData.length });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error scanning repo:", err);
    res.status(500).json({ message: "Failed to scan repository" });
  } finally {
    client.release();
  }
};

// 5) DELETE /api/projects/:id
const deleteProject = async (req, res) => {
  const client = await pool.connect();
  try {
    const userId = req.user.id;
    const projectId = req.params.id;

    // Verify ownership inside transaction? Better before to fail fast, but let's do verify first.
    const projectCheck = await pool.query(
      "SELECT * FROM projects WHERE project_id = $1 AND user_id = $2",
      [projectId, userId]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ message: "Project not found or unauthorized" });
    }

    await client.query("BEGIN");

    // Manual Cascade Delete
    await client.query("DELETE FROM alerts WHERE project_id = $1", [projectId]);
    await client.query("DELETE FROM dependency_vul WHERE project_id = $1", [projectId]);
    await client.query("DELETE FROM dependencies WHERE project_id = $1", [projectId]);
    await client.query("DELETE FROM projects WHERE project_id = $1", [projectId]);

    await client.query("COMMIT");
    res.json({ message: "Project deleted successfully" });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error deleting project:", err);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
};

module.exports = {
  getDashboard,
  getAllProjects,
  getProjectDetails,
  createProject,
  deleteProject,
  repoScan
};