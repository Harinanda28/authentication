const cron = require("node-cron");
const pool = require("./db");
const { scanDependency } = require("./services/vulnerabilityService");
const { createAlertAndNotify } = require("./utils/alertHelper");

async function scanAllProjects() {
  console.log("Running scheduled scan...");

  const projects = await pool.query(
    "SELECT p.project_id, p.project_name, u.email AS owner_email FROM projects p JOIN users u ON p.user_id = u.user_id"
  );

  for (const project of projects.rows) {
    const dependencies = await pool.query(
      "SELECT dependency_id, dependency_name, current_version FROM dependencies WHERE project_id = $1",
      [project.project_id]
    );

    for (const dep of dependencies.rows) {
      const result = await scanDependency(dep.dependency_name, dep.current_version);

      for (const vuln of result.vulnerabilities) {
        const vulResult = await pool.query(
          `INSERT INTO dependency_vul
           (dependency_id, project_id, cve_id, severity, summary)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (dependency_id, cve_id)
           DO NOTHING
           RETURNING dep_vul_id`,
          [
            dep.dependency_id,
            project.project_id,
            vuln.id,
            vuln.severity || "UNKNOWN",
            vuln.summary || "No summary available"
          ]
        );

        // If the vulnerability was newly inserted, create an alert and send email
        if (vulResult.rows.length > 0) {
          await createAlertAndNotify({
            client: pool,
            projectId: project.project_id,
            dependencyId: dep.dependency_id,
            depVulId: vulResult.rows[0].dep_vul_id,
            severity: vuln.severity || "UNKNOWN",
            projectName: project.project_name,
            dependencyName: dep.dependency_name,
            cveId: vuln.id,
            summary: vuln.summary || "No summary available",
            ownerEmail: project.owner_email,
          });
        }
      }
    }

    // Update last_scanned time after scanning this project
    await pool.query(
      "UPDATE projects SET last_scanned = NOW() WHERE project_id = $1",
      [project.project_id]
    );
  }

  console.log("Scheduled scan completed.");
}

/**cron.schedule("0 0 * * *", async () => {
  await scanAllProjects();
});*/
cron.schedule("* * * * *", async () => {
  await scanAllProjects();
});

