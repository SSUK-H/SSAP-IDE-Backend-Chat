const express = require("express"); // 웹서버 프레임워크
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const chatRouter = require("./src/routes/chat").router;
const chatSocket = require("./src/sockets/chatSocket");
const { checkConnection } = require("./src/models/chatModel");

const crypto = require("crypto"); // 랜덤 문자열 생성
const expressSession = require("express-session");
const sharedsession = require("express-socket.io-session");

const CLIENT_ORIGIN = "http://localhost:3000";
const secretKey = crypto.randomBytes(32).toString("hex");
const session = expressSession({
  secret: secretKey, // 세션 데이터 암호화 키
  resave: false, // 세션 데이터 변경 시 다시 저장 여부
  saveUninitialized: true, // 초기화되지 않은 데이터 저장 여부
});

// 서버 및 소켓 초기화
const app = express();
app.use(session);
app.use(
  // CORS 설정
  cors({
    origin: CLIENT_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true,
  }),
);

const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true,
  },
});
io.use(
  // Socket.IO와 Express 세션 공유 설정
  sharedsession(session, {
    autoSave: true,
  }),
);

// JSON 요청 본문 파싱을 위한 미들웨어
app.use(express.json());

checkConnection(); // DB 연동 확인용
app.use("/chat", chatRouter); // 채팅 라우터
chatSocket(io); // Socket 설정

// 서버 연결 확인용
app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use((err, req, res, next) => {
  console.error(err.stack);

  const { email, name } = req.headers; // 헤더에서 필요한 정보를 읽어오기
  req.session.email = email; // req.session에 세션 정보를 저장
  req.session.name = name;

  // 세션 데이터를 저장하려면 반드시 다음 미들웨어로 이동해야 함
  next();

  res.status(500).send("Something broke!");
});

// 서버 연결
const PORT = process.env.PORT || 5012;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
