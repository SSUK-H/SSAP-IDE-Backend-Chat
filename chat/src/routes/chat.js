const express = require("express");
const { pool } = require("../models/chatModel");
const router = express.Router();

router.get("/getMessages", async (req, res) => {
  const { roomId } = req.query;

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
