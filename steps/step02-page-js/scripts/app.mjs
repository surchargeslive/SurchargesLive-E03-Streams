function isMobile() {
  return !window.matchMedia('(min-width: 600px)').matches;
}

document.addEventListener('DOMContentLoaded', () => {
  if (isMobile()) {
    document.getElementById('mobile-main').style.display = 'flex';
    console.log('Mobile way');
  } else {
    document.getElementById('game-main').style.display = 'flex';
    console.log('Game screen');
  }
});
