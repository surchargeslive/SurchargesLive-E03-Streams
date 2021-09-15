import { html, render } from 'https://unpkg.com/lit-html?module';
import { DELAY_REFRESH_UI, GAME_DURATION, HIGH_SCORE } from './constants.mjs';

/**
 * Class that deal with the logic of websocket game
 */
export default class Game {
  constructor(wsUrl) {
    // Connection websocket URL
    this.wsUrl = wsUrl;
    // List of players to show
    this.players = [];
    // Reference to deal with UI refresh frame rate
    this.lastTimeRefresh = Date.now();

    this.initUI();
    this.initWS();
    this.initFrontGame();
  }

  /**
   * Simply plug the start button to a send of webscoket message
   */
  initUI() {
    document.getElementById('start-button').addEventListener('click', () => {
      this.ws.send(JSON.stringify({ type: 'start' }));
      // According to the mode we use, we will init the websocket listen process or the stream process
      this.listenWS(this.ws);
    });
  }

  /**
   * Just initialize the websocket with protocol game
   */
  initWS() {
    this.ws = new WebSocket(this.wsUrl, 'game');
  }

  /**
   * Listen to input messages and process data each times a messages comes
   *
   * @param ws the websocket to listen
   */
  listenWS(ws) {
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.processPlayerData(data);
      } catch (e) {}
    };
  }

  /**
   * Add score to a player
   *
   * @param data a data coming from player
   */
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
    }
  }

  /**
   * Init the lit Element methods
   */
  initFrontGame() {
    this.palyersElt = document.getElementById('players-data');
    // We use raf to play with regular events according to UI availability but we only draw if the delay of refresh ui is passed
    window.requestAnimationFrame(this.raf.bind(this));
  }

  /**
   * Paint method
   */
  raf() {
    if (Date.now() - this.lastTimeRefresh > DELAY_REFRESH_UI) {
      // Render the template to the document

      // We render an orderer array
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

  /**
   * Lit Element rendering method
   *
   * @param players List of players to render
   * @returns the html lit element
   */
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