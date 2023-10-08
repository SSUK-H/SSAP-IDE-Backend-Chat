const { pool } = require("../models/chatModel");
const { saveMessageToDB } = require("../services/messageService.js");

// 소켓 연결 설정
const chatSocket = (io) => {
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
    });

    // 컨테이너 고유의 room에 조인
    socket.on("joinRoom", async (roomId, email) => {
      socket.join(roomId);
      console.log(`${roomId}룸에 ${email}님이 입장하셨습니다`);
    });

    // 메세지 수신 및 해당 room에 보내기
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
          io.to(roomId).emit("receiveMessage", { ...message, socketId });
          console.log("메세지가 저장되고 다른 클라이언트에게 전송되었습니다");
        }
      } catch (error) {
        console.log("메세지 저장 중 오류 발생: ", error);
      }
    });

    // 연결 종료 시 처리
    socket.on("disconnect", () => {
      console.log(`소켓 ID가 ${socket.id}인 사용자가 연결을 해제하였습니다`);
    });
  });
};

module.exports = chatSocket;
