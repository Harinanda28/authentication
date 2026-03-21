const pool = require("./server/db");

async function forceDrift() {
  try {
    const res = await pool.query(`
      UPDATE dependencies
      SET latest_version = '99.9.9'
      WHERE dependency_name = 'eslint' AND current_version = '9.30.1'
    `);
    
    console.log("Forced 'eslint' to have version drift. Rows updated:", res.rowCount);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

forceDrift();
