const express = require("express"); // 웹서버 프레임워크
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const chatRouter = require("./src/routes/chat");
const chatSocket = require("./src/sockets/chatSocket");
const { checkConnection } = require("./src/models/chatModel");

const CLIENT_ORIGIN = "http://localhost:3000";

// 서버 및 소켓 초기화
const app = express();
app.use(  // CORS 설정
  cors({
    origin: CLIENT_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true,
  })
);// CORS 설정

const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// JSON 요청 본문 파싱을 위한 미들웨어
app.use(express.json());

checkConnection(); // DB 연동 확인용
app.use("/chat", chatRouter); // 채팅 라우터
chatSocket(io); // Socket 설정

// 서버 연결 확인용
app.get("/", (req, res) => {
  res.send("Server is running");
});

// 서버 연결
const PORT = process.env.PORT || 5009;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
