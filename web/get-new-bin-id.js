const mysql = require('mysql2/promise');
async function getID() {
  const conn = await mysql.createConnection({ host: 'localhost', user: 'root', password: '', database: 'smartbin_db' });
  const [rows] = await conn.query("SELECT id, name FROM bins");
  console.log(JSON.stringify(rows));
  await conn.end();
}
getID();
