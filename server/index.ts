import express from "express";
import { WebSocketServer, WebSocket } from "ws";
import { URL } from "url";

const PORT = 3006;
const app = express();

const server = app.listen(PORT, () => {
  console.log(`Started on port ${PORT}`);
});

let connectedClients: any = [];

const shapes = [
  { shape: "X", taken: false },
  { shape: "O", taken: false },
];
let firstMove = true;

let count = 0;

// create a websocket server without creating HTTP server (attach it to existing http server)
const wss = new WebSocketServer({
  noServer: true,
});

server.on("upgrade", (req, socket, head) => {
  const pathname = req.url!;

  if (pathname !== "/game") return socket.destroy();

  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit("connection", ws, req);
  });
});

wss.on("connection", (ws) => {
  // Limit the number of connections to two
  if (count < 2) {
    connectedClients.push(ws);
    count++;

    console.log("New client connected.");

    let chosenShape = "";

    if (shapes.every((el) => el.taken === false)) {
      chosenShape = shapes[0].shape;
      shapes[0].taken = true;

      const infoMessage = {
        topic: "CONNECT",
        msg: `You are player ${count}`,
        shape: chosenShape,
        firstMove: firstMove,
      };

      ws.send(JSON.stringify(infoMessage));

      firstMove = false;
    } else {
      const availableShape = shapes.find((el) => el.taken === false);
      console.log(availableShape);
      chosenShape = availableShape!.shape;

      const infoMessage = {
        topic: "CONNECT",
        msg: `You are player ${count}`,
        shape: chosenShape,
        firstMove: firstMove,
      };

      ws.send(JSON.stringify(infoMessage));
    }
    console.log(shapes);

    ws.on("message", (data) => {
      const receivedData = data.toString();
      const parsedData = JSON.parse(receivedData);

      connectedClients.forEach((client: any) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(parsedData));
        }
      });
    });

    ws.on("close", () => {
      connectedClients = connectedClients.filter(
        (client: any) => client !== ws
      );
      count--;
      console.log("A client disconnected.");
    });
  } else {
    ws.close(1001, "Game lobby is full. Please try again later.");
    console.log("Additional client rejected or closed.");
  }
});
