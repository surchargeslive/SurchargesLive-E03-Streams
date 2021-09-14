import { html, render } from 'https://unpkg.com/lit-html?module';

export default class Game {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;

    this.initUI();

    this.initWS();
    this.initFrontGame();
    this.players = [];
    this.lastTimeRefresh = Date.now();
    this.DELAY_REFRESH = 100;
  }

  initUI() {
    document
      .getElementById('start-button')
      .addEventListener('click', () => this.ws.send(JSON.stringify({ type: 'start' })));
  }

  initWS() {
    this.ws = new WebSocket(this.wsUrl, 'game');
    this.ws.binaryType = 'arraybuffer';
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'data') {
          console.log('data', data);
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
      } catch (e) {}
    };
  }

  initFrontGame() {
    this.palyersElt = document.getElementById('players-data');
    window.requestAnimationFrame(this.raf.bind(this));
  }

  raf() {
    if (Date.now() - this.lastTimeRefresh > this.DELAY_REFRESH) {
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
    return html`${players.map(
      (player) => html`<div class="player">
        <label>${player.name}:${Math.round(player.score)}</label>
        <meter min="0" max="10000" low="3333" high="8000" value=${player.score}></meter>
      </div>`,
    )}`;
  }
}
