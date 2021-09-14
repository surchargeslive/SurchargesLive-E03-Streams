import { html, render } from 'https://unpkg.com/lit-html?module';
import { DELAY_REFRESH_UI, GAME_DURATION, HIGH_SCORE } from './constants.mjs';

export default class Game {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;

    this.initUI();

    this.initWS();
    this.initFrontGame();
    this.players = [];
    this.lastTimeRefresh = Date.now();
  }

  initUI() {
    document.getElementById('start-button').addEventListener('click', () => {
      this.ws.send(JSON.stringify({ type: 'start' }));
      this.initStream(this.ws);
      //this.listenWS(this.ws);
    });
  }

  initWS() {
    this.ws = new WebSocket(this.wsUrl, 'game');
    this.ws.binaryType = 'arraybuffer';
  }

  listenWS(ws) {
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.processPlayerData(data);
      } catch (e) {}
    };
  }

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
    if (done) return;
    try {
      const data = JSON.parse(value);
      this.processPlayerData(data);
    } catch (e) {}
    return this.reader.read().then(this.readPlayerData.bind(this));
  }

  processPlayerData(data) {
    if (data.type === 'data') {
      //console.log('data', data);
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
    }
  }

  initFrontGame() {
    this.palyersElt = document.getElementById('players-data');
    window.requestAnimationFrame(this.raf.bind(this));
  }

  raf() {
    if (Date.now() - this.lastTimeRefresh > DELAY_REFRESH_UI) {
      // Render the template to the document

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
        <meter min="0" max="${max}" low="${low}" high="${high}" value=${player.score}></meter>
      </div>`,
    )}`;
  }
}
