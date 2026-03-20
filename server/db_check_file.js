const fs = require('fs');
const pool = require('./db');
async function check() {
  try {
    const res = await pool.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name IN ('dependencies', 'dependency_vul', 'projects', 'alerts')
      ORDER BY table_name, ordinal_position
    `);
    fs.writeFileSync('schema_out.txt', JSON.stringify(res.rows, null, 2));
    console.log('Done - wrote to schema_out.txt');
  } catch (e) {
    fs.writeFileSync('schema_out.txt', e.toString());
    console.error(e);
  } finally {
    await pool.end();
  }
}
check();
