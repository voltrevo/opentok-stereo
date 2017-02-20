'use strict';

const { placeDot, Dot } = require('./DotModule');
const PositionalAudioPlayer = require('./PositionalAudioPlayer');

window.PositionalAudioPlayer = PositionalAudioPlayer;

const playerPromise = navigator.mediaDevices.getUserMedia({ audio: true })
  .then((stream) => {
    window.stream = stream;
    const player = PositionalAudioPlayer(stream);
    return player;
  });

const loadPromise = new Promise(resolve => window.addEventListener('load', resolve));

Promise
  .all([
    loadPromise,
    playerPromise,
  ])
  .then(([, player]) => {
    const update = (() => {
      const startTime = Date.now();
      const dot = Dot();
      document.body.appendChild(dot);

      return () => {
        const timeElapsed = Date.now() - startTime;
        const angle = timeElapsed / 3000 * (2 * Math.PI);
        const center = { x: 0.5 * window.innerWidth, y: 0.5 * window.innerHeight };
        const radius = 0.85 * Math.min(center.x, center.y);

        placeDot(dot, {
          x: center.x + (radius * Math.sin(angle)),
          y: center.y - (radius * Math.cos(angle)),
        });

        player.setLeftRightBalance(0.5 + (timeElapsed / 1500));
      };
    })();

    const loop = () => {
      update();
      window.requestAnimationFrame(loop);
    };

    window.requestAnimationFrame(loop);
  })
;
