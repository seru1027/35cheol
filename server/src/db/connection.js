const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  timezone: 'Z', // DATETIME 값을 JS Date로 주고받을 때 UTC로 해석
});

// 새 연결마다 세션 시간대를 UTC로 맞춘다 → CURRENT_TIMESTAMP·NOW()도 UTC로 저장 (DB 설계 D6)
pool.on('connection', (connection) => {
  connection.query("SET time_zone = '+00:00'");
});

module.exports = pool;
