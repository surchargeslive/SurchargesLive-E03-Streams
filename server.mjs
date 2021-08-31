import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import express from 'express';

const app = express();
app.use(express.static('./'));

const server = createServer(app);
const wss = new WebSocketServer({ server });

let wsGame = undefined;
let wsPlayers = [];

wss.on('connection', (ws) => {
  console.log('connection', ws._protocol);
  if (ws._protocol === 'game') {
    wsGame = ws;
  } else {
    wsPlayers.push[{ id: ws._protocol, ws }];
  }
  ws.on('message', (message) => {
    console.log('received: %s', message);
    const json = JSON.parse(message);
    switch (json.type) {
      case 'data':
        wsGame.send(message);
        break;
      case 'start':
        for (let wsPlayer of wsPlayers) {
          wsPlayer.ws.send(message);
        }

        break;
    }
  });

  //ws.send(JSON.stringify({ data: 'something' }));

  ws.on('close', function () {
    if (ws._protocol === 'game') {
      wsGame = undefined;
    } else {
      const index = wsPlayers.find((item) => item.id === ws._protocol);
      wsPlayers.splice(index, 1);
    }
    console.log('stopping client interval', ws._protocol);
  });
});

server.listen(8080, () => {
  console.log('Listen to port 80');
});
