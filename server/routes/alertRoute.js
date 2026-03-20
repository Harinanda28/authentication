/**const express = require("express");
const router = express.Router();
const { sendAlertEmail } = require("../utils/emailsend");

// Example POST route when a new vulnerability is detected
router.post("/", async (req, res) => {
  const { userEmail, vulnerabilityDetails } = req.body;

  if (!userEmail || !vulnerabilityDetails) {
    return res.status(400).json({ message: "Missing fields" });
  }

  // Send alert email
  const subject = "⚠️ Vulnerability Alert Detected!";
  const text = `Dear User,\n\nA new vulnerability has been detected:\n${vulnerabilityDetails}\n\nPlease take immediate action.`;

  await sendAlertEmail(userEmail, subject, text);

  res.json({ message: "Alert email sent successfully!" });
});

module.exports = router;*/
const express = require("express");
const router = express.Router();
const pool = require("../db"); // database connection
const { sendAlertEmail } = require("../utils/emailsend");


// GET all alerts
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        a.alert_id, a.risk_score, a.priority_level, a.alert_status, a.created_at,
        p.project_name,
        d.dependency_name,
        dv.cve_id,
        dv.severity,
        dv.summary
      FROM alerts a
      JOIN projects p        ON a.project_id    = p.project_id
      JOIN dependencies d    ON a.dependency_id = d.dependency_id
      JOIN dependency_vul dv ON a.dep_vul_id    = dv.dep_vul_id
      ORDER BY a.created_at DESC`
    );

    res.json(result.rows);

  } catch (err) {
    console.error("Error fetching alerts:", err);
    res.status(500).json({ message: "Error fetching alerts" });
  }
});


// Resolve alert
router.put("/:id/resolve", async (req, res) => {
  try {
    const alertId = req.params.id;

    await pool.query(
      "UPDATE alerts SET alert_status = 'RESOLVED' WHERE alert_id = $1",
      [alertId]
    );

    res.json({ message: "Alert resolved successfully" });

  } catch (err) {
    console.error("Error resolving alert:", err);
    res.status(500).json({ message: "Error resolving alert" });
  }
});


// Send alert email (existing functionality)
router.post("/", async (req, res) => {
  const { userEmail, vulnerabilityDetails } = req.body;

  if (!userEmail || !vulnerabilityDetails) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const subject = "⚠️ Vulnerability Alert Detected!";
  const text = `Dear User,\n\nA new vulnerability has been detected:\n${vulnerabilityDetails}\n\nPlease take immediate action.`;

  await sendAlertEmail(userEmail, subject, text);

  res.json({ message: "Alert email sent successfully!" });
});

module.exports = router;