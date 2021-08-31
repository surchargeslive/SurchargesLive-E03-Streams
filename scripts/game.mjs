import { html, render } from 'https://unpkg.com/lit-html?module';

export default class Game {
  constructor(ws) {
    this.ws = ws;
    this.initWS();
    this.initFrontGame();
  }

  initWS() {
    this.ws.onmessage = function (event) {
      const data = JSON.parse(event.data);
      if (data.type === 'data') {
        //TODO
      }
    };
  }

  initFrontGame() {
    const myTemplate = (player) => html` <label>${player.name}:</label>
      <meter min="0" max="100" low="33" high="80" value=${player.value}></meter>`;

    // Render the template to the document
    render(myTemplate({ name: 'test', value: 10 }), document.getElementById('players-data'));
  }
}
