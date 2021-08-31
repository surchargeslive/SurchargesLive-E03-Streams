import Game from './game.mjs';
import MobileGame from './mobile.mjs';

function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

document.addEventListener('DOMContentLoaded', () => {
  const schema = location.protocol === 'http:' ? 'ws' : 'wss';
  const mobileView = isMobile();
  const ws = new WebSocket(`${schema}://${location.host}`, mobileView ? 'mobile' : 'game');

  function wsReadyState() {
    if (ws.readyState === 1) {
      //match correct script to play
      if (isMobile()) {
        new MobileGame(ws);
        document.getElementById('mobile-main').style.display = 'block';
        console.log('Mobile way');
      } else {
        new Game(ws);
        document.getElementById('game-main').style.display = 'block';
        console.log('Game screen');
      }
    } else if (ws.readyState === 0) {
      setTimeout(() => wsReadyState(), 0);
    }
  }

  wsReadyState();
});
