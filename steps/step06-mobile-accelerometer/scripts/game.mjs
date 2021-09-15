/**
 * Class that deal with the logic of websocket game
 */
export default class Game {
  constructor(wsUrl) {
    // Connection websocket URL
    this.wsUrl = wsUrl;

    this.initUI();
    this.initWS();
  }

  /**
   * Simply plug the start button to a send of webscoket message
   */
  initUI() {
    document.getElementById('start-button').addEventListener('click', () => {
      this.ws.send(JSON.stringify({ type: 'start' }));
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
      console.log(data);
    }
  }
}
