const pool = require("./server/db");

async function checkDrift() {
  try {
    const res = await pool.query(`
      SELECT
        d.dependency_name,
        d.current_version,
        d.latest_version,
        COUNT(dv.dep_vul_id) AS vuln_count,
        CASE 
          WHEN COUNT(dv.dep_vul_id) > 0 THEN 'Vulnerable'
          WHEN d.current_version IS NOT NULL 
               AND d.latest_version IS NOT NULL 
               AND d.current_version <> d.latest_version THEN 'Version Drift'
          ELSE 'Up to Date'
        END AS status
      FROM dependencies d
      LEFT JOIN dependency_vul dv ON d.dependency_id = dv.dependency_id
      GROUP BY d.dependency_id, d.dependency_name, d.current_version, d.latest_version
      LIMIT 10
    `);
    
    console.log("DB Status Check:");
    console.table(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

checkDrift();
