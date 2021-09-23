import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import express from 'express';

const port = 8080;
const app = express();
app.use(express.static('./'));
const server = createServer(app);
const wss = new WebSocketServer({ server });

server.listen(port, () => {
  console.log(`Listen to port ${port}`);
});
