const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '', // default XAMPP/WAMP password
    });

    console.log("Connected to MySQL successfully.");
    
    const [databases] = await connection.query("SHOW DATABASES LIKE 'smartbin_db'");
    if (databases.length === 0) {
      console.log("Database 'smartbin_db' does not exist.");
    } else {
      console.log("Database 'smartbin_db' exists.");
      await connection.query("USE smartbin_db");
      
      const [tables] = await connection.query("SHOW TABLES");
      console.log("Tables in smartbin_db:");
      tables.forEach(row => {
        console.log("- " + Object.values(row)[0]);
      });
    }

    await connection.end();
  } catch (error) {
    console.error("Error connecting to MySQL:", error.message);
  }
}

testConnection();
