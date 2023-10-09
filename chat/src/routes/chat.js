const express = require("express");
const { pool } = require("../models/chatModel");
const router = express.Router();

router.get("/getMessages", async (req, res) => {
  const { roomId } = req.query;
  const { email, joinTime } = req.session;

  console.log("현재 세션 상태:", req.session);

  if (!email && !joinTime) {
    console.error("클라이언트 정보를 찾을 수 없습니다.");
    res.status(400).send("클라이언트 정보를 찾을 수 없습니다.");
    return;
  }

  try {
    const [rows] = await pool.query(
      "SELECT * FROM chat WHERE roomId = ? AND sendTime > ?",
      [roomId, joinTime],
    );
    res.status(200).send(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("서버 오류");
  }
});

module.exports = router;