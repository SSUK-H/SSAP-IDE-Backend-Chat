const express = require("express"); // 웹서버 프레임워크
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const chatRouter = require("./routes/chat");
const chatSocket = require("./sockets/chatSocket");
const { checkConnection } = require("./models/chatModel");

// 서버 및 소켓 초기화
const app = express();

// TODO: CORS 설정
app.use(cors());
// app.use(
//   cors({
//     origin: '*',
//     // methods: ["GET", "POST"],
//     // credentials: true,
//   }),
// );

const server = http.createServer(app);

const CLIENT_ORIGIN = "http://localhost:3000";

const io = socketIo(server, {
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// JSON 요청 본문 파싱을 위한 미들웨어
app.use(express.json());

// DB 연동 확인용
checkConnection();
// Socket 설정
chatSocket(io);

// 서버 연결 확인용
app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// 서버 연결
const PORT = process.env.PORT || 5012;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
