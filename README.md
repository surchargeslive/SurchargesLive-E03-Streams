# SurchargesLive-E03-Streams

Episode 3 using Streams and Acceleromter to create a game.

To start : `npm i` then `node server.mjs`

You should use at least Node 14 to run this project.

# Step 01 - JFG

## Création du Serveur.

**Choix technos :** Express pour aller vite, WS pour faire des webSockets "Standard".
**Et si on faisait du import**
Ecriture d'un fichier .mjs car utilisation de import au lieu de require \o/.

```javascript
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
```

# Step 02 - Horacio

## Création du fichier index.html & fichier app.mjs

On va servir uniquement 1 seul fichier mais on va feinter au sein du fichier pour n'afficher que ce qu'il faut
Utilisation de Emmet dans vscode pour générer la structure

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
    <title>Surchargés Live - EP 3</title>
  </head>
  <body>
    <main id="mobile-main" style="display: none">Hello Mobile</main>
    <main id="game-main" style="display: none">Hello Game</main>
    <script type="module" src="./scripts/app.mjs"></script>
  </body>
</html>
```

Fichier mjs pour gérer facilement les imports.

### Comment détecter mobile ou game ?

**window.matchMedia**. Spec présente depuis l'apparition des média queries dans le CSS !!! faisons donc un choix arbitraire mais logique
Un mobile a un largeur minimum inférieur à 600px;

```javascript
function isMobile() {
  return !window.matchMedia('(min-width: 600px)').matches;
}

document.addEventListener('DOMContentLoaded', () => {
  if (isMobile()) {
    document.getElementById('mobile-main').style.display = 'flex';
    console.log('Mobile way');
  } else {
    document.getElementById('game-main').style.display = 'flex';
    console.log('Game screen');
  }
});
```

# Step 03 - Horacio

## Mise en place de la logique websocket serveur

Simple et efficace, 2 channels principaux (utilisation des protocoles !) -> **Kesako le protocole**
Un joueur reçoit une instruction de départ par le jeu, et il envoie toutes ses données au jeu.
Le jeu envoie une instruction de départ et reçoit toutes les données

```javascript
// Ajout des variables
let wsGame = undefined;
const wsPlayers = [];

// Ajout de la logique websocket
wss.on('connection', (ws) => {
  console.log('connection', ws._protocol);
  if (ws._protocol === 'game') {
    wsGame = ws;
  } else {
    wsPlayers.push({ id: ws._protocol, ws });
  }
  ws.on('message', (message) => {
    console.log('received: %s', message);
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
```

# Step 04 - JFG

## Branchement des websockets côté game

On va créer 1 classe pour le game ainsi qu'un bout d'IHM pour au moins démarrer l'event

### index.html

```html
<main id="game-main" style="display: none">
  <button id="start-button">start</button>
</main>
```

### app.mjs

Prise en compte de l'appel maintenant dans l'app principale. Gestion de l'url de websocket

```javascript
// Ajout de l'import
import Game from './game.mjs';

// Ajout dans la méthode DOMContentLoaded

const schema = location.protocol === 'http:' ? 'ws' : 'wss';
const wsUrl = `${schema}://${location.host}`;

if (isMobile()) {
  document.getElementById('mobile-main').style.display = 'flex';
  console.log('Mobile way');
} else {
  new Game(wsUrl);
  document.getElementById('game-main').style.display = 'flex';
  console.log('Game screen');
}
```

### game.mjs

```javascript
export default class Game {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;

    this.initUI();
    this.initWS();
  }

  initUI() {
    document.getElementById('start-button').addEventListener('click', () => {
      this.ws.send(JSON.stringify({ type: 'start' }));
      this.listenWS(this.ws);
    });
  }

  initWS() {
    this.ws = new WebSocket(this.wsUrl, 'game');
  }

  listenWS(ws) {
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.processPlayerData(data);
      } catch (e) {}
    };
  }

  processPlayerData(data) {
    if (data.type === 'data') {
      console.log(data);
    }
  }
}
```

# Step 05 - Horacio

## Gestion de la websocket côté mobile (pas encore envoie de données). On branche la logique

Maintenant on va commencer à brancher la logique côté mobile-> On va récupérer un nom d'un user qu'on affichera. On lui dira d'attendre.
On va aussi tout faire comme si on envoyait les données côté mobile. On va en profiter pour ajouter du css

### index.html

Ajout du css et des messages et input

```html
<link rel="stylesheet" type="text/css" href="css/main.css" />
...
<main id="mobile-main" style="display: none">
  <input type="text" id="username" />
  <span id="player-name" style="display: none"></span>
  <span id="error-msg" style="display: none">⚠️ You should enter a name to play</span>
  <span id="shake-icon" style="display: none">👋 shake</span>
  <span id="wait-icon" style="display: none">⌛️ wait</span>
</main>
```

### main.css

Bases du css

```css
html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  font-size: 30px;
}

main {
  font-size: 1rem;
  margin: auto;
  width: 70%;
  height: calc(100% - 100px);
  padding: 50px;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-items: center;
  align-content: center;
  justify-content: flex-start;
}

button {
  font-size: 1.5rem;
  margin-bottom: 40px;
}
```

### mobile.mjs

// Mise en place de la logique avec websockets + interaction

```javascript
export default class MobileGame {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.listenToMove = false;
    this.playerReady = false;
    this.playerId = undefined;
    this.username = undefined;

    this.checkIcons(false);
    this.initUI();
  }

  initUI() {
    document.getElementById('error-msg').style.display = '';
    document.getElementById('username').addEventListener('keyup', (event) => {
      if (event.key === 'Enter' && document.getElementById('username').value.trim().length > 0) {
        this.username = document.getElementById('username').value;
        document.getElementById('error-msg').style.display = 'none';
        document.getElementById('player-name').innerHTML = this.username;
        document.getElementById('player-name').style.display = 'block';
        document.getElementById('username').style.display = 'none';
        this.initWS(this.username);
      }
    });
  }

  initWS(username) {
    this.playerId = `${username}-${Date.now()}`;
    this.ws = new WebSocket(this.wsUrl, `mobile-${this.playerId}`);

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'start') {
          this.startListen();
        }
      } catch (e) {}
    };
  }

  checkIcons(listenToMove) {
    this.listenToMove = listenToMove;
    document.getElementById('shake-icon').style.display = this.listenToMove ? '' : 'none';
    document.getElementById('wait-icon').style.display = this.listenToMove ? 'none' : '';
  }

  startListen() {
    this.checkIcons(true);
  }
}
```

### app.mjs

Ajout de la référence manquante à mobile.mjs

```javascript
// Ajout import mobile.mjs
import MobileGame from './mobile.mjs';

// Ajout logique mobile
if (isMobile()) {
  new MobileGame(wsUrl);
  document.getElementById('mobile-main').style.display = 'flex';
  console.log('Mobile way');
}
```

# Step 06 - JFG

## Utilisation de l'accelerometer

On va utiliser pour ça un truc de Fugu -> **C'est quoi Fugu**. Mais ça marche aussi sur les anciens ;) grace à un polyfill
**motion-sensors-polyfill/motion-sensors.js**

### constants.mjs

On va commencer à introduire des magic numbers -> constants.mjs

```javascript
export const GAME_DURATION = 5000 * 4;
export const FREQUENCY_SENSOR = 10;
```

### mobile.mjs

```javascript
// Ajout des imports
import { Accelerometer } from '../node_modules/motion-sensors-polyfill/motion-sensors.js';
import { FREQUENCY_SENSOR, GAME_DURATION } from './constants.mjs';

// Ajout de la logique d'écoute
startListen() {
    this.checkIcons(true);
    let accelerometer = null;
    try {
      accelerometer = new Accelerometer({ frequency: FREQUENCY_SENSOR });
      accelerometer.onerror = (event) => {
        if (event.error.name === 'NotAllowedError') {
          console.log('Permission to access sensor was denied.');
        } else if (event.error.name === 'NotReadableError') {
          console.log('Cannot connect to the sensor.');
        }
      };
      accelerometer.onreading = (e) => {
        this.ws.send(
          JSON.stringify({
            type: 'data',
            user: { playerId: this.playerId, username: this.username },
            datas: { x: accelerometer.x, y: accelerometer.y, z: accelerometer.z },
          }),
        );
      };
      accelerometer.start();
      setTimeout(() => {
        accelerometer.stop();
        this.checkIcons(false);
      }, GAME_DURATION);
    } catch (error) {
      if (error.name === 'SecurityError') {
        console.log('Sensor construction was blocked by the Permissions Policy.');
      } else if (error.name === 'ReferenceError') {
        console.log('Sensor is not supported by the User Agent.');
      } else {
        throw error;
      }
    }
  }
```

# Step07 - Horacio

## Gestion de l'affichage des players

Afin de pas s'embêter avec le rendu, on va utiliser litHTML pour notre rendu. On va donc traiter chaque donnée qui arrive
afin de l'afficher et de trier notre liste.

Ici on modifie le css pour ajouter les derniers styles. On modifie aussi les constantes et surtout game.mjs

### index.html

```html
<main id="game-main" style="display: none">
  <button id="start-button">start</button>
  <section id="players-data"></section>
</main>
```

### main.css

```css
section,
.player {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  align-content: center;
  justify-content: center;
}
.player {
  border: thin solid black;
  margin: 5px;
  flex-direction: column;
}
```

### constants.mjs

```javascript
export const DELAY_REFRESH_UI = 100;
export const HIGH_SCORE = 10000;
```

### game.mjs

```javascript
// Ajout des imports :
import { html, render } from 'https://unpkg.com/lit-html?module';
import { DELAY_REFRESH_UI, GAME_DURATION, HIGH_SCORE } from './constants.mjs';

// Dans le constructor - ajout de variables + appel de méthode d'init
this.players = [];
this.lastTimeRefresh = Date.now();
// True if we continue to process events from websocket
this.continueWS = true;
// Number of events processed
this.dataProcessed = 0;
this.initFrontGame();

// Changement méthode initUI -> Ajout dataProcessed
initUI() {
    document.getElementById('start-button').addEventListener('click', () => {
      this.dataProcessed = 0;
      this.continueWS = true;
      this.ws.send(JSON.stringify({ type: 'start' }));
      // According to the mode we use, we will init the websocket listen process or the stream process
      this.listenWS(this.ws);
    });
  }

// Changement du coeur de la méthode processPlayerData
processPlayerData(data) {
    if (data.type === 'data') {
        let player = this.players.find((playerTmp) => playerTmp.id === data.user.playerId);
        if (!player) {
        player = {
            id: data.user.playerId,
            name: data.user.username,
            score: 0,
        };
        this.players.push(player);
        }
        player.score += Math.abs(data.datas.x);
        this.dataProcessed++;
    }
}

// Modif méthode listen Websockets
listenWS(ws) {
    setTimeout(() => {
      console.log('Data processed', this.dataProcessed + 1);
      this.continueWS = false;
    }, GAME_DURATION + 500);
    ws.onmessage = (event) => {
      if (this.continueWS) {
        try {
          const data = JSON.parse(event.data);
          this.processPlayerData(data);
        } catch (e) {}
      }
    };
  }

// Ajout des méthodes de rendu
  initFrontGame() {
    this.palyersElt = document.getElementById('players-data');
    window.requestAnimationFrame(this.raf.bind(this));
  }

  raf() {
    if (Date.now() - this.lastTimeRefresh > DELAY_REFRESH_UI) {
      render(
        this.renderPlayers(
          this.players.slice().sort((player1, player2) => player2.score - player1.score),
        ),
        this.palyersElt,
      );
      this.lastTimeRefresh = Date.now();
    }
   window.requestAnimationFrame(this.raf.bind(this));
  }

  renderPlayers(players) {
    const max = HIGH_SCORE;
    const low = Math.round(HIGH_SCORE / 3);
    const high = Math.round((HIGH_SCORE * 3) / 4);
    return html`${players.map(
      (player) => html`<div class="player">
        <label>${player.name}:${Math.round(player.score)}</label>
        <meter min="0" max="${max}"  optimum="${max}" low="${low}" high="${high}" value=${player.score}></meter>
      </div>`,
    )}`;
  }
```

# Step 08 - JFG

## Création de user mocked pour tester le tout

Ici on va finir d'ajouter dans le fichier de constants, et on va introduire la notion de mock dans la partie serveur

### constant.mjs

```javascript
export const NB_MOCK_PLAYERS = 1000;
```

### server.mjs

```javascript
// Import des constants
import { GAME_DURATION, FREQUENCY_SENSOR, NB_MOCK_PLAYERS } from './scripts/constants.mjs';

// Ajout de variable d'activation des mocks
const mock = true; // True if we want to generate mock players

// Ajout de la méthode de mock
function mockServer() {
  let startMockDatas = Date.now();

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

// Envoie du mock dans le websocket
case 'start':
    if (mock) {
        mockServer();
    }
```

# Step09 - Horacio (+déploiement)

## Mise en place d'un stream côté client à la place de l'écoute passive -> objective plus de tuning dans la réception

Ici on ne touche que le fichier game.mjs

### game.mjs

```javascript
// On récupère les données sous forme de stream au lieu de websocket
initUI() {
    document.getElementById('start-button').addEventListener('click', () => {
      this.ws.send(JSON.stringify({ type: 'start' }));
      this.initStream(this.ws);
      //this.listenWS(this.ws);
    });
  }

// On ajoute la méthode de stream et de sa lecture
  initStream(ws) {
    this.stream = new ReadableStream({
      start(controller) {
        setTimeout(() => controller.close(), GAME_DURATION + 500);
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'data') {
              controller.enqueue(event.data);
            }
          } catch (e) {}
        };
      },
      pull(controller) {},
      cancel() {},
    });

    this.reader = this.stream.getReader();
    this.reader.read().then(this.readPlayerData.bind(this));
  }

  readPlayerData({ done, value }) {
     if (done) {
      console.log('Data processed', this.dataProcessed);
      return;
    }
    try {
      const data = JSON.parse(value);
      this.processPlayerData(data);
    } catch (e) {}
    return this.reader.read().then(this.readPlayerData.bind(this));
  }


```
