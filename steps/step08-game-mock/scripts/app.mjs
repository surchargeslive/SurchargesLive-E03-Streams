import Game from './game.mjs';
import MobileGame from './mobile.mjs';

/**
 *
 * @returns true if media queries detection as a width less than 600px
 */
function isMobile() {
  return !window.matchMedia('(min-width: 600px)').matches;
}

document.addEventListener('DOMContentLoaded', () => {
  // Should be use for secure tests -> If we use for example ngrok, the secure connection of websocket should be done with wss and not ws
  const schema = location.protocol === 'http:' ? 'ws' : 'wss';
  const wsUrl = `${schema}://${location.host}`;

  // According to screen detection, we show the correct part on screen
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
