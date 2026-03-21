const pool = require("./server/db");

async function checkDependencies() {
  try {
    const res = await pool.query("SELECT * FROM dependencies LIMIT 10");
    console.log("Dependencies in DB:", res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

checkDependencies();
