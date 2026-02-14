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
        p.created_at as last_scanned,
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
      "SELECT * FROM projects WHERE project_id = $1 AND user_id = $2",
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
      SELECT dv.severity, 'Vulnerability description placeholder' as description, d.dependency_name 
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
        last_scanned: project.created_at // Assuming created_at is proxy for last_scanned
      },
      dependencies: depsResult.rows,
      vulnerabilities: vulResult.rows,
    });
  } catch (err) {
    console.error("Error fetching project details:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 4) POST /api/projects
const createProject = async (req, res) => {
  const client = await pool.connect();
  try {
    const userId = req.user.id;
    const { project_name, description } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "Dependency file is required" });
    }

    let dependencies = [];
    const fileContent = file.buffer.toString("utf-8");

    // Detect format and parse
    if (file.originalname === "package.json") {
      try {
        const json = JSON.parse(fileContent);
        const allDeps = { ...(json.dependencies || {}), ...(json.devDependencies || {}) };
        for (const [name, version] of Object.entries(allDeps)) {
          dependencies.push({
            name,
            version: version.replace(/[^0-9.]/g, ""), // Simple cleanup
            manager: "npm"
          });
        }
      } catch (e) {
        return res.status(400).json({ message: "Invalid package.json format" });
      }
    } else if (file.originalname.endsWith(".txt")) {
      // Assume requirements.txt
      const lines = fileContent.split(/\r?\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
          // Simple split by ==, >=, <=, etc.
          const parts = trimmed.split(/[=<>~]+/);
          if (parts.length >= 1) {
            dependencies.push({
              name: parts[0].trim(),
              version: parts[1] ? parts[1].trim() : "latest", // Default if no version
              manager: "pip"
            });
          }
        }
      }
    } else {
      return res.status(400).json({ message: "Unsupported file format. Use package.json or requirements.txt" });
    }

    await client.query("BEGIN");

    // Insert Project
    const projectResult = await client.query(
      "INSERT INTO projects (user_id, project_name, description) VALUES ($1, $2, $3) RETURNING project_id",
      [userId, project_name, description]
    );
    const projectId = projectResult.rows[0].project_id;

    // Insert Dependencies
    for (const dep of dependencies) {
      await client.query(
        "INSERT INTO dependencies (project_id, dependency_name, current_version, latest_version, package_manager) VALUES ($1, $2, $3, $4, $5)",
        [projectId, dep.name, dep.version, dep.version, dep.manager] // Setting latest=current for now
      );
    }

    await client.query("COMMIT");
    res.status(201).json({ message: "Project created successfully", projectId });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error creating project:", err);
    res.status(500).json({ message: "Server error" });
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
  deleteProject
};