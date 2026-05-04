const mysql = require('mysql2/promise');
async function getBin() {
  const connection = await mysql.createConnection({ host: 'localhost', user: 'root', password: '', database: 'smartbin_db' });
  const [bins] = await connection.query("SELECT id FROM bins LIMIT 1");
  console.log(bins[0].id);
  await connection.end();
}
getBin();
