const mysql = require("mysql2/promise");

// TODO: DB 저장
// TODO: 새로고침시..? DB 불러오기 접속한 시점부터 현재 시점까지..?
// TODO: 자동으로 데이터 들어갈때 DB 시간 설정 가능??
// TODO: 룸 종료시 DB 삭제
const pool = mysql.createPool({
  host: "ssap-ide-db.cp6hsnofjfzx.ap-northeast-2.rds.amazonaws.com",
  user: "master",
  password: "ssap_rainbow0929",
  database: "ssap-ide-db",
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
