const mysql = require('mysql2/promise');

async function initDB() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
    });

    console.log("Connected to MySQL. Creating database...");
    
    await connection.query("CREATE DATABASE IF NOT EXISTS smartbin_db");
    console.log("Database 'smartbin_db' created.");
    
    await connection.query("USE smartbin_db");
    
    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(36) PRIMARY KEY,
          name VARCHAR(255),
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Table 'users' created.");

    // Create bins table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS bins (
          id VARCHAR(36) PRIMARY KEY,
          user_id VARCHAR(36) NOT NULL,
          name VARCHAR(255) NOT NULL,
          location VARCHAR(255),
          capacity_cm FLOAT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log("Table 'bins' created.");

    // Create bin_logs table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS bin_logs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          bin_id VARCHAR(36) NOT NULL,
          fill_level_percent INT NOT NULL,
          status ENUM('Empty', 'Half-Full', 'Full') NOT NULL,
          distance_cm FLOAT NOT NULL,
          recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (bin_id) REFERENCES bins(id) ON DELETE CASCADE
      )
    `);
    console.log("Table 'bin_logs' created.");

    console.log("Database initialization complete!");
    await connection.end();
  } catch (error) {
    console.error("Error initializing database:", error.message);
  }
}

initDB();
