import { Accelerometer } from '../node_modules/motion-sensors-polyfill/motion-sensors.js';
import { FREQUENCY_SENSOR, GAME_DURATION } from './constants.mjs';

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
      if (event.key === 'Enter') {
        this.username = document.getElementById('username').value;
        document.getElementById('error-msg').style.display = 'none';
        document.getElementById('player-name').innerHTML = this.username;
        document.getElementById('username').style.display = 'none';
        document.getElementById('player-name').style.display = 'block';
        this.initWS(this.username);
      }
    });
  }

  initWS(username) {
    this.playerId = `${username}-${Date.now()}`;
    this.ws = new WebSocket(this.wsUrl, `mobile-${this.playerId}`);
    //this.ws.binaryType = 'arraybuffer';
    this.ws.onmessage = (event) => {
      try {
        console.log(event.data);
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
    let accelerometer = null;
    try {
      accelerometer = new Accelerometer({ frequency: FREQUENCY_SENSOR });
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
