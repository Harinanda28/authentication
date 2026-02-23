const pool = require("../db");
const { sendAlertEmail } = require("../utils/emailsend");
const { scanDependency } = require("../services/vulnerabilityService");

// 1️⃣ GET /api/projects/dashboard
const getDashboard = async (req, res) => {
  try {
    const userId = req.userData.userId;

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

// 2️⃣ GET /api/projects
const getAllProjects = async (req, res) => {
  try {
    const userId = req.userData.userId;

    const result = await pool.query(
      `
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
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching projects:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 3️⃣ GET /api/projects/:id/details
const getProjectDetails = async (req, res) => {
  try {
    const userId = req.userData.userId;
    const projectId = req.params.id;

    const projectCheck = await pool.query(
      "SELECT * FROM projects WHERE project_id = $1 AND user_id = $2",
      [projectId, userId]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ message: "Project not found or unauthorized" });
    }

    const project = projectCheck.rows[0];

    const depsResult = await pool.query(
      "SELECT dependency_name, current_version as version FROM dependencies WHERE project_id = $1",
      [projectId]
    );

    const vulResult = await pool.query(
      `
      SELECT dv.severity, dv.summary as description, d.dependency_name 
      FROM dependency_vul dv
      JOIN dependencies d ON dv.dependency_id = d.dependency_id
      WHERE dv.project_id = $1
      `,
      [projectId]
    );

    res.json({
      project: {
        project_id: project.project_id,
        project_name: project.project_name,
        description: project.description,
        last_scanned: project.created_at
      },
      dependencies: depsResult.rows,
      vulnerabilities: vulResult.rows
    });

  } catch (err) {
    console.error("Error fetching project details:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 4️⃣ POST /api/projects
const createProject = async (req, res) => {
  const client = await pool.connect();

  try {
    const userId = req.userData.userId;
    const { project_name, description } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "Dependency file is required" });
    }

    let dependencies = [];
    const fileContent = file.buffer.toString("utf-8");

    if (file.originalname !== "package.json") {
      return res.status(400).json({ message: "Unsupported file format. Use package.json" });
    }

    const json = JSON.parse(fileContent);
    const allDeps = {
      ...(json.dependencies || {}),
      ...(json.devDependencies || {})
    };

    for (const [name, version] of Object.entries(allDeps)) {
      dependencies.push({
        name,
        version: version.replace(/[^0-9.]/g, ""),
        manager: "npm"
      });
    }

    await client.query("BEGIN");

    const userResult = await client.query(
      "SELECT email FROM users WHERE user_id = $1",
      [userId]
    );

    const userEmail = userResult.rows[0].email;

    const projectResult = await client.query(
      `
      INSERT INTO projects (user_id, project_name, description)
      VALUES ($1, $2, $3)
      RETURNING project_id
      `,
      [userId, project_name, description]
    );

    const projectId = projectResult.rows[0].project_id;

    // Store email alerts to send AFTER commit
    const emailAlerts = [];

    for (const dep of dependencies) {

      const scanResult = await scanDependency(dep.name, dep.version);
      const vulnerabilities = scanResult.vulnerabilities || [];

      const depInsert = await client.query(
        `
        INSERT INTO dependencies
        (project_id, dependency_name, current_version, latest_version, package_manager)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING dependency_id
        `,
        [
          projectId,
          dep.name,
          dep.version,
          scanResult.safeVersion || dep.version,
          dep.manager
        ]
      );

      const dependencyId = depInsert.rows[0].dependency_id;

      for (const vuln of vulnerabilities) {
        await client.query(
          `
          INSERT INTO dependency_vul
          (dependency_id, project_id, cve_id, severity, summary)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (dependency_id, cve_id)
          DO NOTHING
          `,
          [
            dependencyId,
            projectId,
            vuln.id,
            vuln.severity || "UNKNOWN",
            vuln.summary || "No description available"
          ]
        );
      }

      // Prepare email content (but DO NOT send yet)
      if (vulnerabilities.length > 0) {
        emailAlerts.push({
          dependency: dep.name,
          vulnerabilities
        });
      }
    }

    await client.query("COMMIT");

    // 🔥 SEND EMAILS AFTER COMMIT
    for (const alert of emailAlerts) {
      const subject = "⚠️ New Vulnerability Detected!";
      const text =
        `Dear User,\n\n` +
        `${alert.vulnerabilities.length} vulnerabilities were detected in dependency "${alert.dependency}".\n\n` +
        alert.vulnerabilities
          .map(v =>
            `• ${v.id} | ${v.severity || "UNKNOWN"} | ${v.summary || "No summary"}`
          )
          .join("\n") +
        `\n\nPlease take action.`;

      try {
        await sendAlertEmail(userEmail, subject, text);
      } catch (emailErr) {
        console.error("Email sending failed:", emailErr);
      }
    }

    res.status(201).json({
      message: "Project created and scanned successfully",
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

// 5️⃣ DELETE /api/projects/:id
const deleteProject = async (req, res) => {
  const client = await pool.connect();

  try {
   const userId = req.userData.userId;
    const projectId = req.params.id;

    const projectCheck = await pool.query(
      "SELECT * FROM projects WHERE project_id = $1 AND user_id = $2",
      [projectId, userId]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ message: "Project not found or unauthorized" });
    }

    await client.query("BEGIN");

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