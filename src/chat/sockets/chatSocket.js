const chatHistory = require("../data/chatHistory");

// 소켓 연결 설정
const chatSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("New client connected");

    // 접속자 설정
    socket.on("setUsername", (userName) => {
      if (!socket) console.error("Socket is undefined!");
      if (typeof userName === "undefined") console.error("userName is undefined!");

      socket.username = userName;
      console.log(`Username set to ${userName}`);
    });

    // 컨테이너 고유의 room에 조인
    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      console.log(`User with socket ID ${socket.id} joined room: ${roomId}`);
    });

    // 메시지 수신 및 해당 room에 보내기
    socket.on("sendMessage", (roomId, message) => {
      console.log("Received message:", message);
      chatHistory.push(message);

      io.to(roomId).emit("receiveMessage", message);
      console.log("Received chatHistory:", chatHistory);
    });

    socket.on("disconnect", () => {
      console.log(`User with socket ID ${socket.id}`);
    });
  });
};

module.exports = chatSocket;
