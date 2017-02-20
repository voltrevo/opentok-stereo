'use strict';

module.exports = function PositionalAudioPlayer(stream, leftRightBalance = 0.5) {
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
};
