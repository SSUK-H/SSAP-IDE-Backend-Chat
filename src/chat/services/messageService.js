const { pool } = require("../models/chatModel");

const saveMessageToDB = async (roomId, socketId, email, name, message) => {
  try {
    await pool.query(
      "INSERT INTO chat (roomId, socketId, email, name, message) VALUES (?, ?, ?, ?, ?)",
      [roomId, socketId, email, name, message],
    );
    console.log("메시지를 DB에 저장 중: ", { roomId, socketId, email, name, message });
    return { success: true };
  } catch (error) {
    console.error("DB에 메시지 저장 중 오류 발생: ", error.message);
    throw new Error("서버 오류");
  }
};

module.exports = { saveMessageToDB };
