'use strict';

function PositionalAudioPlayer(stream, leftRightBalance = 0.5) {
  const player = {};

  const audioCtx = new AudioContext();
  const source = audioCtx.createMediaStreamSource(stream);

  const splitter = audioCtx.createChannelSplitter(2);
  const merger = audioCtx.createChannelMerger(2);

  source.connect(splitter);

  const leftGainNode = audioCtx.createGain();
  const rightGainNode = audioCtx.createGain();

  player.setLeftRightBalance = (balance) => {
    leftGainNode.gain.value = Math.cos(0.5 * Math.PI * balance);
    rightGainNode.gain.value = Math.sin(0.5 * Math.PI * balance);
  };

  player.setLeftRightBalance(leftRightBalance);

  splitter.connect(leftGainNode, 0);
  splitter.connect(rightGainNode, 1);

  leftGainNode.connect(merger, 0, 0);
  rightGainNode.connect(merger, 0, 1);

  merger.connect(audioCtx.destination);

  return player;
}

window.PositionalAudioPlayer = PositionalAudioPlayer;

const playerPromise = navigator.mediaDevices.getUserMedia({ audio: true })
  .then((stream) => {
    window.stream = stream;
    const player = PositionalAudioPlayer(stream);
    return player;
  });

const placeDot = (dot, { x = 0, y = 0 }) => {
  dot.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
};

const Dot = ({
  color = 'blue',
  radius = 10,
  x = 0,
  y = 0,
  zIndex,
} = {}) => {
  const dot = document.createElement('div');
  dot.style.backgroundColor = color;
  dot.style.left = '0px';
  dot.style.top = '0px';
  dot.style.position = 'absolute';

  dot.style.borderRadius = '50%';
  dot.style.width = 2 * radius + 'px';
  dot.style.height = 2 * radius + 'px';

  dot.style.marginLeft = - radius + 'px';
  dot.style.marginTop = - radius + 'px';

  placeDot(dot, { x, y });

  if (zIndex !== undefined) {
    dot.style.zIndex = zIndex;
  }

  return dot;
};

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
