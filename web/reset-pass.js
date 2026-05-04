const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function resetPass() {
  const conn = await mysql.createConnection({ host: 'localhost', user: 'root', password: '', database: 'smartbin_db' });
  const hash = await bcrypt.hash('password123', 10);
  await conn.query("UPDATE users SET password_hash = ? WHERE email = 'demo@test.com'", [hash]);
  console.log("Password reset!");
  await conn.end();
}
resetPass();
