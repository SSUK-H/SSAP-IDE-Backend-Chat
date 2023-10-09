const { messageEvents } = require("../routes/chat");
const { saveMessageToDB } = require("../services/messageService");

// 소켓 연결 설정
const chatSocket = (io) => {
  // chatRouter에서 발생한 새 메시지 이벤트를 감지
  messageEvents.on("newMessage", (message) => {
    io.to(message.roomId).emit("receiveMessage", {
      email: message.email,
      name: message.name,
      message: message.content,
      socketId: message.socketId,
    });
  });

  io.on("connection", (socket) => {
    console.log("새로운 클라이언트가 연결되었습니다");

    // 접속자 인증 맟 접속자 설정
    socket.on("setUserInfo", ({ email, name }) => {
      if (!socket) console.error("소켓이 정의되지 않았습니다!");
      if (typeof name === "undefined" && typeof email === "undefined")
        console.error("사용자 이름 또는 이메일이 정의되지 않았습니다!");

      socket.name = name;
      socket.email = email;
      console.log(`유저 정보 설정:  이메일 - ${email}, 이름 - ${name}`);

      // 세션에 사용자 정보 저장
      socket.handshake.session.email = email;
      socket.handshake.session.name = name;
      // 첫 접속 시간 설정
      if (!socket.handshake.session.joinTime) {
        socket.handshake.session.joinTime = new Date().toISOString();
      }
      socket.handshake.session.save((err) => {
        if (err) {
          console.error("세션 저장 중 오류:", err);
        } else {
          console.log("세션 정보가 저장되었습니다");
        }
      });
    });

    // 컨테이너 고유의 room에 조인
    socket.on("joinRoom", async (roomId, email) => {
      socket.join(roomId);
      socket.roomId = roomId;
      console.log(`${roomId}룸에 ${email}님이 입장하셨습니다`);
    });

    // 메세지 전송
    socket.on("sendMessage", async (roomId, msg) => {
      const socketId = socket.id;
      const email = msg.email;
      const name = msg.name;
      const message = msg.message;
      console.log("메세지를 수신하였습니다: ", roomId, socketId, email, name, message);

      // 메세지를 저장하고 브로드캐스팅
      try {
        // DB 저장 호출
        const result = await saveMessageToDB(roomId, socketId, email, name, message);

        if (result.success) {
          // 저장된 메시지를 감지하여 브로드캐스팅
          messageEvents.emit("newMessage", {
            roomId: roomId,
            email: email,
            name: name,
            message: message,
            socketId: socketId,
          });
        }
      } catch (error) {
        console.log("메세지 저장 중 오류 발생: ", error);
      }
    });

    // 연결 종료 시 처리
    socket.on("disconnect", () => {
      console.log(`소켓 ID가 ${socket.email}인 사용자가 연결을 해제하였습니다`);
    });
  });
};

module.exports = chatSocket;
