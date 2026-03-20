/**
 * Adds a unique constraint on (dependency_id, dep_vul_id) to the alerts table.
 * This is required for the ON CONFLICT clause in alertHelper.js to prevent
 * duplicate alerts for the same vulnerability.
 *
 * Run once: node scripts/add_alerts_unique_constraint.js
 */
const pool = require("../db");

async function migrate() {
    try {
        await pool.query(`
      ALTER TABLE alerts
      ADD CONSTRAINT unique_alert_dependency_vul
      UNIQUE (dependency_id, dep_vul_id);
    `);
        console.log("Unique constraint added to alerts (dependency_id, dep_vul_id).");
    } catch (err) {
        if (err.code === "42710") {
            // constraint already exists
            console.log("Constraint already exists, skipping.");
        } else {
            console.error("Error adding constraint:", err);
        }
    } finally {
        await pool.end();
    }
}

migrate();
