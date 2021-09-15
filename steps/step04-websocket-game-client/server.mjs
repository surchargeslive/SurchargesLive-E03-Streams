import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import express from 'express';

const port = 8080; // Port of application
let wsGame = undefined; // Websocket corresponding to game screen
const wsPlayers = []; // Array of Websockets players

/**
 * Initialization of static server
 */
const app = express();
app.use(express.static('./'));

const server = createServer(app);
const wss = new WebSocketServer({ server });

/**
 * Websocket logic
 */
wss.on('connection', (ws) => {
  console.log('connection', ws._protocol);
  if (ws._protocol === 'game') {
    wsGame = ws;
  } else {
    wsPlayers.push({ id: ws._protocol, ws });
  }
  // According to message, we route it to the correct channels
  ws.on('message', (message) => {
    const json = JSON.parse(message);
    switch (json.type) {
      case 'data':
        wsGame.send(JSON.stringify(json));
        break;
      case 'start':
        for (let wsPlayer of wsPlayers) {
          wsPlayer.ws.send(JSON.stringify(json));
        }

        break;
    }
  });

  // When a websocket is closed, we clean the memory
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

/*
 Start listening the port
*/
server.listen(port, () => {
  console.log(`Listen to port ${port}`);
});
