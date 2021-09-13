import { html, render } from 'https://unpkg.com/lit-html?module';

export default class Game {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;

    this.initUI();

    this.initWS();
    this.initFrontGame();
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
        }
      } catch (e) {}
    };
  }

  initFrontGame() {
    const myTemplate = (player) => html` <label>${player.name}:</label>
      <meter min="0" max="100" low="33" high="80" value=${player.value}></meter>`;

    // Render the template to the document
    render(myTemplate({ name: 'test', value: 10 }), document.getElementById('players-data'));
  }
}
