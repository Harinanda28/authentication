const { sendAlertEmail } = require("./emailsend");

/**
 * Maps vulnerability severity to risk_score and priority_level.
 */
function getRiskAndPriority(severity) {
    switch ((severity || "").toUpperCase()) {
        case "CRITICAL":
            return { risk_score: 9, priority_level: "CRITICAL" };
        case "HIGH":
            return { risk_score: 8, priority_level: "HIGH" };
        case "MEDIUM":
            return { risk_score: 6, priority_level: "MEDIUM" };
        case "LOW":
        default:
            return { risk_score: 4, priority_level: "LOW" };
    }
}

/**
 * Creates an alert in the alerts table (if not duplicate) and sends an email
 * notification to the project owner when a new alert is created.
 *
 * @param {object} opts
 * @param {object} opts.client       - pg client (transaction) or pool
 * @param {number} opts.projectId
 * @param {number} opts.dependencyId
 * @param {number} opts.depVulId
 * @param {string} opts.severity
 * @param {string} opts.projectName
 * @param {string} opts.dependencyName
 * @param {string} opts.cveId
 * @param {string} opts.summary
 * @param {string} opts.ownerEmail
 */
async function createAlertAndNotify({
    client,
    projectId,
    dependencyId,
    depVulId,
    severity,
    projectName,
    dependencyName,
    cveId,
    summary,
    ownerEmail,
}) {
    const { risk_score, priority_level } = getRiskAndPriority(severity);

    // Insert alert — skip if a duplicate (same dependency_id + dep_vul_id) exists
    const alertResult = await client.query(
        `INSERT INTO alerts
     (project_id, dependency_id, dep_vul_id, risk_score, priority_level, alert_status)
     VALUES ($1, $2, $3, $4, $5, 'OPEN')
     ON CONFLICT (dependency_id, dep_vul_id) DO NOTHING
     RETURNING alert_id`,
        [projectId, dependencyId, depVulId, risk_score, priority_level]
    );

    // Only send email if a new alert was actually created
    if (alertResult.rows.length > 0 && ownerEmail) {
        const subject = `⚠️ [${priority_level}] Vulnerability Detected in ${projectName}`;
        const text = [
            `Project: ${projectName}`,
            `Dependency: ${dependencyName}`,
            `CVE ID: ${cveId}`,
            `Severity: ${severity || "UNKNOWN"}`,
            `Risk Score: ${risk_score}`,
            ``,
            `Summary: ${summary}`,
            ``,
            `Please take immediate action to resolve this vulnerability.`,
        ].join("\n");

        await sendAlertEmail(ownerEmail, subject, text);
    }
}

module.exports = { getRiskAndPriority, createAlertAndNotify };
