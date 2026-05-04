const mysql = require('mysql2/promise');
async function clearDB() {
  const conn = await mysql.createConnection({ host: 'localhost', user: 'root', password: '', database: 'smartbin_db' });
  await conn.query("DELETE FROM bin_logs");
  await conn.query("DELETE FROM bins");
  console.log("Data cleared!");
  await conn.end();
}
clearDB();
