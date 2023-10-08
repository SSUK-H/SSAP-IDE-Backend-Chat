const mysql = require("mysql2/promise");
require("dotenv").config(); // 민감정보 보호

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function checkConnection() {
  try {
    const [rows] = await pool.query("SELECT 1 + 1 AS solution");
    console.log("Database Connection Successful! Solution: ", rows[0].solution);
  } catch (error) {
    console.error("Database Connection Error: ", error);
  }
}

module.exports = { pool, checkConnection };
