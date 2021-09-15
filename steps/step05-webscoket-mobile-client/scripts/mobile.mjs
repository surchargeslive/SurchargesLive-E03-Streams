/**
 * Class that deal with mobile logic
 */
export default class MobileGame {
  constructor(wsUrl) {
    this.wsUrl = wsUrl; // Websocket url to use for connection
    this.listenToMove = false; // true if we listen to move of mobile
    this.playerReady = false; // true when the player as enter a name
    this.playerId = undefined; // generate player id (used for websocket protocol and game)
    this.username = undefined; // usename chosse

    // We init the buttons states
    this.checkIcons(false);
    // we plug input logic
    this.initUI();
  }

  /**
   * Simply wait for enter press and init the websocket when player is ready
   */
  initUI() {
    // At first we ask to the user to enter a name
    document.getElementById('error-msg').style.display = '';
    // We listen to Enter hit
    document.getElementById('username').addEventListener('keyup', (event) => {
      // We only process data if the player as enter a name with at least 1 character
      if (event.key === 'Enter' && document.getElementById('username').value.trim().length > 0) {
        this.username = document.getElementById('username').value;
        // We hide the error message
        document.getElementById('error-msg').style.display = 'none';
        // We display the username on screen to avoid change of name
        document.getElementById('player-name').innerHTML = this.username;
        document.getElementById('player-name').style.display = 'block';
        // We hide the input field
        document.getElementById('username').style.display = 'none';
        // We register to websocket with the username (will be use to generate the id)
        this.initWS(this.username);
      }
    });
  }

  /**
   * Connect to websocket
   *
   * @param username the username choosed
   */
  initWS(username) {
    // We add the Date to avoid conflict of name
    this.playerId = `${username}-${Date.now()}`;
    // We connect to websocket server
    this.ws = new WebSocket(this.wsUrl, `mobile-${this.playerId}`);

    // We listen to input message in order to activate the acceleromter
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'start') {
          this.startListen();
        }
      } catch (e) {}
    };
  }

  /**
   *
   * Display the move icons if player should shake it's phone
   *
   * @param listenToMove true if we ask the user to shake it's phone
   */
  checkIcons(listenToMove) {
    this.listenToMove = listenToMove;
    document.getElementById('shake-icon').style.display = this.listenToMove ? '' : 'none';
    document.getElementById('wait-icon').style.display = this.listenToMove ? 'none' : '';
  }

  /**
   * We listen to accelerometer and then data when data arrived
   */
  startListen() {
    // We ask to show the shake icon
    this.checkIcons(true);
  }
}
