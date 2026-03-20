const pool = require("../db");

// GET /api/dashboard/stats
const getStats = async (req, res) => {
  try {
    const userId = req.userData.userId;

    const [projRes, depRes, vulRes, driftRes] = await Promise.all([
      // Total projects owned by the user
      pool.query("SELECT COUNT(*) FROM projects WHERE user_id = $1", [userId]),

      // Total dependencies across user's projects
      pool.query(
        `SELECT COUNT(*)
         FROM dependencies d
         JOIN projects p ON d.project_id = p.project_id
         WHERE p.user_id = $1`,
        [userId]
      ),

      // Count of distinct vulnerable dependencies
      pool.query(
        `SELECT COUNT(DISTINCT d.dependency_id)
         FROM dependency_vul dv
         JOIN dependencies d ON dv.dependency_id = d.dependency_id
         JOIN projects p ON p.project_id = d.project_id
         WHERE p.user_id = $1`,
        [userId]
      ),

      // Dependencies where current_version differs from latest_version (drift)
      pool.query(
        `SELECT COUNT(*)
         FROM dependencies d
         JOIN projects p ON d.project_id = p.project_id
         WHERE p.user_id = $1
           AND d.current_version IS NOT NULL
           AND d.latest_version IS NOT NULL
           AND d.current_version <> d.latest_version`,
        [userId]
      ),
    ]);

    res.json({
      totalProjects: parseInt(projRes.rows[0].count, 10),
      totalDependencies: parseInt(depRes.rows[0].count, 10),
      vulnerableDependencies: parseInt(vulRes.rows[0].count, 10),
      dependencyDrift: parseInt(driftRes.rows[0].count, 10),
    });
  } catch (err) {
    console.error("Error fetching dashboard stats:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/dashboard/trends
const getTrends = async (req, res) => {
  try {
    const userId = req.userData.userId;

    // Vulnerability trends: monthly counts per severity for the last 6 months
    // Uses alerts.created_at (guaranteed to exist) linked through dep_vul_id for severity
    const vulTrendsRes = await pool.query(
      `SELECT
         TO_CHAR(DATE_TRUNC('month', a.created_at), 'Mon YYYY') AS month,
         DATE_TRUNC('month', a.created_at) AS month_start,
         LOWER(dv.severity) AS severity,
         COUNT(*) AS count
       FROM alerts a
       JOIN dependency_vul dv ON a.dep_vul_id = dv.dep_vul_id
       JOIN projects p ON a.project_id = p.project_id
       WHERE p.user_id = $1
         AND a.created_at >= NOW() - INTERVAL '6 months'
       GROUP BY month_start, month, LOWER(dv.severity)
       ORDER BY month_start ASC`,
      [userId]
    );

    // Pivot vulnerability trend rows into { month, critical, high, medium, low }
    const vulByMonth = {};
    for (const row of vulTrendsRes.rows) {
      const key = row.month;
      if (!vulByMonth[key]) {
        vulByMonth[key] = { month: key, critical: 0, high: 0, medium: 0, low: 0 };
      }
      const sev = row.severity.toLowerCase();
      if (["critical", "high", "medium", "low"].includes(sev)) {
        vulByMonth[key][sev] += parseInt(row.count, 10);
      }
    }
    const vulnerabilityTrends = Object.values(vulByMonth);

    // Drift trends: monthly count of drifting dependencies grouped by project creation month
    // Uses projects.created_at since dependencies may not have a created_at column
    const driftTrendsRes = await pool.query(
      `SELECT
         TO_CHAR(DATE_TRUNC('month', p.created_at), 'Mon YYYY') AS month,
         DATE_TRUNC('month', p.created_at) AS month_start,
         COUNT(d.dependency_id) AS drift
       FROM dependencies d
       JOIN projects p ON d.project_id = p.project_id
       WHERE p.user_id = $1
         AND d.current_version IS NOT NULL
         AND d.latest_version IS NOT NULL
         AND d.current_version <> d.latest_version
         AND p.created_at >= NOW() - INTERVAL '6 months'
       GROUP BY month_start, month
       ORDER BY month_start ASC`,
      [userId]
    );

    const dependencyDriftTrends = driftTrendsRes.rows.map((r) => ({
      month: r.month,
      drift: parseInt(r.drift, 10),
    }));

    res.json({
      vulnerabilityTrends,
      dependencyDriftTrends,
    });
  } catch (err) {
    console.error("Error fetching dashboard trends:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getStats, getTrends };
