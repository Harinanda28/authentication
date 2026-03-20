const pool = require('./db');
async function check() {
  try {
    const res1 = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'dependencies'");
    console.log("dependencies cols:", res1.rows);
    const res2 = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'dependency_vul'");
    console.log("dependency_vul cols:", res2.rows);
  } catch (e) {
    console.error(e);
  } finally {
    await pool.end();
  }
}
check();
