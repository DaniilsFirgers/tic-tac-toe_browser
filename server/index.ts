import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { URL } from 'url';

const PORT = 3006;
const app = express();

const server = app.listen(PORT, () => {
  console.log(`Started on port ${PORT}`);
});

let connectedClients: any = [];
let waitingQueue: any = [];
let count = 0;

// create a websocket server without creating HTTP server (attach it to existing http server)
const wss = new WebSocketServer({
  noServer: true,
});

server.on('upgrade', (req, socket, head) => {
  const pathname = req.url!;

  if (pathname !== '/game') return socket.destroy();

  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit('connection', ws, req);
  });
});

wss.on('connection', (ws) => {
  // Limit the number of connections to two
  if (count < 2) {
    connectedClients.push(ws);
    count++;

    console.log('New client connected.');
    ws.send(`You are player ${count}`);

    ws.on('message', (data) => {
      connectedClients.forEach((client: any) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(data);
        }
      });
    });

    ws.on('close', () => {
      connectedClients = connectedClients.filter(
        (client: any) => client !== ws
      );
      count--;
      console.log('A client disconnected.');
    });
  } else {
    ws.close(1001, 'Game lobby is full. Please try again later.');
    console.log('Additional client rejected or closed.');
  }
});
