const express = require("express");
const { WebSocketServer } = require("ws");
const crypto = require("crypto");
const app = express();
const port = 3000;

app.use(express.static("public"));
// HTTP 서버 설정
app.get("/", (req, res) => {
  res.send("Hello World!");
});

const server = app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

// WebSocket 서버 설정
const wss = new WebSocketServer({ server });

// 연결된 모든 클라이언트를 저장할 배열
const clients = new Set();

wss.on("connection", (ws) => {
  // 각 클라이언트에게 고유 ID 부여
  ws.id = crypto.randomUUID();
  clients.add(ws);
  console.log(`New client connected (현재 접속자 수: ${clients.size}명)`);

  // 클라이언트로부터 메시지를 받았을 때
  ws.on("message", (message) => {
    // 메시지를 JSON 형식으로 변환하여 발신자 ID 포함
    const messageData = {
      type: "message",
      senderId: ws.id,
      content: message.toString(),
    };

    // 모든 클라이언트에게 전송
    clients.forEach((client) => {
      if (client.readyState === ws.OPEN) {
        client.send(JSON.stringify(messageData));
      }
    });
  });

  // 새 접속자 알림
  const connectMessage = {
    type: "system",
    content: "New client connected!",
  };
  clients.forEach((client) => {
    if (client.readyState === ws.OPEN) {
      client.send(JSON.stringify(connectMessage));
    }
  });

  // 클라이언트 연결이 끊어졌을 때
  ws.on("close", () => {
    clients.delete(ws);
    console.log(`Client disconnected (현재 접속자 수: ${clients.size}명)`);
  });
});
