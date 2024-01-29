const express = require("express");
const { pool } = require("../models/chatModel");
const { EventEmitter } = require("events");
const { saveMessageToDB } = require("../services/messageService");

const router = express.Router();
const messageEvents = new EventEmitter();

router.post("/sendMessage", async (req, res) => {
  const { roomId, socketId, email, name, content } = req.body;

  try {
    const result = await saveMessageToDB(roomId, socketId, email, name, content);
    if (result.success) {
      const newMessage = { roomId, socketId, email, name, content };
      messageEvents.emit("newMessage", newMessage); // 새 메시지 이벤트 발생
    }
    res.status(200).send(result);
  } catch (error) {
    console.error("메시지 저장 중 오류 발생: ", error);
    res.status(500).send("서버 오류");
  }
});

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

module.exports = { router, messageEvents };
