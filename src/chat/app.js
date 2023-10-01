const express = require("express"); // 웹서버 프레임워크
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const chatRouter = require("./routes/chat");
const chatSocket = require("./sockets/chatSocket");

// 서버 및 소켓 초기화
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3004",
  },
});

// JSON 요청 본문 파싱을 위한 미들웨어
app.use(express.json());
app.use(cors()); // CORS 설정

// 채팅 서버
app.use("/chatHistory", chatRouter);

// Socket 설정
chatSocket(io);

// 서버 연결
const PORT = process.env.PORT || 5009;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
