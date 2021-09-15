import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import express from 'express';
import { GAME_DURATION, FREQUENCY_SENSOR, NB_MOCK_PLAYERS } from './scripts/constants.mjs';

const mock = true; // True if we want to generate mock players
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
        if (mock) {
          mockServer();
        }
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

/**
 * Mock Players
 */
function mockServer() {
  // Mandatory to only generate datas for a short time
  let startMockDatas = Date.now();

  /**
   * function call each time we send a bench of datas
   */
  function sendMockData() {
    for (let i = 0; i < NB_MOCK_PLAYERS; i++) {
      wsGame.send(
        JSON.stringify({
          type: 'data',
          user: { playerId: `mockPlayerId-${i}`, username: `mockPlayer-${i}` },
          datas: { x: Math.random() * 10, y: 0, z: 0 },
        }),
      );
    }
    if (Date.now() - startMockDatas < GAME_DURATION) {
      setTimeout(sendMockData, FREQUENCY_SENSOR);
    }
  }
  sendMockData();
}
