const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

async function seedDB() {
  try {
    const connection = await mysql.createConnection({ host: 'localhost', user: 'root', password: '', database: 'smartbin_db' });
    
    // 1. Create User
    const userId = uuidv4();
    const hash = await bcrypt.hash('password123', 10);
    
    // Check if demo user already exists
    const [existing] = await connection.query("SELECT id FROM users WHERE email = 'demo@test.com'");
    let finalUserId = userId;
    
    if (existing.length === 0) {
      await connection.query("INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)", [userId, "Test User", "demo@test.com", hash]);
      console.log("Created User: demo@test.com / password123");
    } else {
      finalUserId = existing[0].id;
      console.log("Demo user already exists");
    }

    // 2. Create Bins
    const bin1Id = uuidv4();
    const bin2Id = uuidv4();
    
    await connection.query("INSERT INTO bins (id, user_id, name, location, capacity_cm) VALUES (?, ?, ?, ?, ?)", [bin1Id, finalUserId, "Kitchen Bin", "1st Floor Kitchen", 100]);
    await connection.query("INSERT INTO bins (id, user_id, name, location, capacity_cm) VALUES (?, ?, ?, ?, ?)", [bin2Id, finalUserId, "Office Bin", "2nd Floor Office", 50]);
    console.log("Created 2 Bins");

    // 3. Create Logs for Bin 1 (Kitchen) -> Make it Full
    await connection.query("INSERT INTO bin_logs (bin_id, fill_level_percent, status, distance_cm) VALUES (?, ?, ?, ?)", [bin1Id, 92, "Full", 8]);
    
    // Create Logs for Bin 2 (Office) -> Make it Half-Full
    await connection.query("INSERT INTO bin_logs (bin_id, fill_level_percent, status, distance_cm, recorded_at) VALUES (?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL 5 MINUTE))", [bin2Id, 45, "Half-Full", 27.5]);
    await connection.query("INSERT INTO bin_logs (bin_id, fill_level_percent, status, distance_cm) VALUES (?, ?, ?, ?)", [bin2Id, 60, "Half-Full", 20]);
    console.log("Created sample logs");

    await connection.end();
  } catch (error) {
    console.error(error);
  }
}
seedDB();
