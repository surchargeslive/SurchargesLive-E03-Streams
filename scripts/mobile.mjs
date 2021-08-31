export default class MobileGame {
  constructor(ws) {
    this.ws = ws;
    this.listenToMove = false;
    this.playerReady = false;

    this.checkIcons(false);
    this.initUI();
  }

  initUI() {
    document.getElementById('error-message').style.display = '';
    document.getElementById('username').addEventListener('keyup', (event) => {
      if (event.key === 'Enter') {
        document.getElementById('error-message').style.display = 'none';
        document.getElementById('player-name').innerHTML =
          document.getElementById('username').value;
        this.initWsMessage();
      }
    });
  }

  initWsMessage() {
    this.ws.onmessage = function (event) {
      const data = JSON.parse(event.data);
      if (data.type === 'start') {
        this.startListen();
      }
    };
  }

  checkIcons(listenToMove) {
    this.listenToMove = listenToMove;
    document.getElementById('shake-icon').style.display = this.listenToMove ? '' : 'none';
    document.getElementById('wait-icon').style.display = this.listenToMove ? 'none' : '';
  }

  checkName() {
    const input = document.getElementById('username');
    if (input.value) {
      return 'username' + Date.getTime();
    } else {
      return value;
    }
  }

  startListen() {
    this.checkIcons(true);
    let accelerometer = null;
    try {
      accelerometer = new Accelerometer({ frequency: 10 });
      accelerometer.onerror = (event) => {
        // Handle runtime errors.
        if (event.error.name === 'NotAllowedError') {
          console.log('Permission to access sensor was denied.');
        } else if (event.error.name === 'NotReadableError') {
          console.log('Cannot connect to the sensor.');
        }
      };
      accelerometer.onreading = (e) => {
        this.ws.send(
          JSON.stringify({
            user: this.checkName(),
            datas: { x: accelerometer.x, y: accelerometer.y, z: accelerometer.z },
          }),
        );
      };
      accelerometer.start();
      setTimeout(() => {
        accelerometer.stop();
        this.checkIcons(false);
      }, 1000);
    } catch (error) {
      // Handle construction errors.
      if (error.name === 'SecurityError') {
        console.log('Sensor construction was blocked by the Permissions Policy.');
      } else if (error.name === 'ReferenceError') {
        console.log('Sensor is not supported by the User Agent.');
      } else {
        throw error;
      }
    }
  }
}
