import Game from './game.mjs';
import MobileGame from './mobile.mjs';

function isMobile() {
  return !window.matchMedia('(min-width: 600px)').matches;
}

document.addEventListener('DOMContentLoaded', () => {
  const schema = location.protocol === 'http:' ? 'ws' : 'wss';
  const wsUrl = `${schema}://${location.host}`;

  if (isMobile()) {
    new MobileGame(wsUrl);
    document.getElementById('mobile-main').style.display = 'flex';
    console.log('Mobile way');
  } else {
    new Game(wsUrl);
    document.getElementById('game-main').style.display = 'flex';
    console.log('Game screen');
  }
});
