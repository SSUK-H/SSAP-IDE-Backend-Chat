const { pool } = require("../models/chatModel");

// 소켓 연결 설정
const chatSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("New client connected");

    // 접속자 설정
    socket.on("setUsername", (userName) => {
      if (!socket) console.error("Socket is undefined!");
      if (typeof userName === "undefined") console.error("userName is undefined!");

      socket.userName = userName;
      console.log(`Username set to ${userName}`);
    });

    // 컨테이너 고유의 room에 조인
    socket.on("joinRoom", async (roomId, joinTime) => {
      try {
        socket.join(roomId);
        console.log(
          `User with socket ID ${socket.id} joined room: ${roomId} joinTime: ${joinTime}`,
        );

        // joinTime 이후의 메세지만 불러오기
        const [rows] = await pool.query(
          "SELECT * FROM chat WHERE roomId = ? AND sendTime > ?",
          [roomId, joinTime],
        );

        // 클라이언트에게 이전 메시지 보내기
        socket.emit("previousMessages", rows);
      } catch (error) {
        console.log("Error loading previous messages: ", error);
      }
    });

    // 메시지 수신 및 해당 room에 보내기
    socket.on("sendMessage", async (roomId, socketId, message) => {
      console.log("Received message:", roomId, socketId, message);

      try {
        // 메세지 DB에 저장
        await pool.query(
          "INSERT INTO chat (roomId, socketId, userName, content) VALUES (?, ?, ?, ?)",
          [roomId, socketId, message.userName, message.content],
        );

        // 다른 클라이언트에게 메세지 전송
        io.to(roomId).emit("receiveMessage", { ...message, socketId });
        console.log("Message saved and sent to other clients");
      } catch (error) {
        console.log("Error saving message: ", error);
      }
    });

    socket.on("disconnect", () => {
      console.log(`User with socket ID ${socket.id}`);
    });
  });
};

module.exports = chatSocket;
