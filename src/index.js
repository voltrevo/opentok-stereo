'use strict';

/* eslint-disable no-restricted-syntax */

const PositionalAudioPlayer = require('./PositionalAudioPlayer');

const range = n => (new Array(n)).fill(0).map((x, i) => i);

function SubscriberAudioPlayer(subscriber) {
  subscriber.setAudioVolume(0);

  const vid = subscriber.element.querySelector('video');
  const stream = vid.srcObject;

  const player = {};

  player.setLeftRightBalance = PositionalAudioPlayer(stream).setLeftRightBalance;

  player.getDomBasedBalance = () => {
    const rect = vid.getBoundingClientRect();
    return (0.5 * (rect.left + rect.right)) / window.innerWidth;
  };

  return player;
}

function SubscriberGroup() {
  const group = {};

  const subscribers = [];
  const playerMap = new WeakMap();

  group.add = (subscriber) => {
    const index = subscribers.indexOf(subscriber);

    if (index !== -1) {
      return;
    }

    if (!(subscriber.element && subscriber.element.querySelector('video'))) {
      subscriber.on('videoElementCreated', () => group.add(subscriber));
      return;
    }

    subscribers.push(subscriber);
    playerMap.set(subscriber, SubscriberAudioPlayer(subscriber));
    subscriber.on('destroyed', () => group.remove(subscriber));
    group.update();
  };

  group.remove = (subscriber) => {
    const index = subscribers.indexOf(subscriber);

    if (index === -1) {
      return;
    }

    subscribers.splice(index, 1);
    group.update();
  };

  group.update = () => {
    if (subscribers.length === 1) {
      playerMap.get(subscribers[0]).setLeftRightBalance(0.5);
    } else if (subscribers.length === 0) {
      return;
    }

    const rawBalances = subscribers.map(sub => playerMap.get(sub).getDomBasedBalance());
    const least = rawBalances.reduce((x, y) => Math.min(x, y));
    const most = rawBalances.reduce((x, y) => Math.max(x, y));

    if (least === most) {
      for (const sub of subscribers) {
        playerMap.get(sub).setLeftRightBalance(0.5);
      }

      return;
    }

    const balances = rawBalances.map(bal => (bal - least) / (most - least));

    for (const i of range(balances.length)) {
      playerMap.get(subscribers[i]).setLeftRightBalance(balances[i]);
    }
  };

  group.watch = (period = 100) => {
    setInterval(group.update, period);
  };

  return group;
}

function SessionGroup(session, watchPeriod = 100) {
  const group = SubscriberGroup();

  const update = () => {
    for (const stream of session.streams.where()) {
      for (const sub of session.getSubscribersForStream(stream)) {
        group.add(sub);
      }
    }

    group.update();
  };

  update();

  setInterval(update, watchPeriod);

  return group;
}

module.exports = {
  SubscriberAudioPlayer,
  SubscriberGroup,
  SessionGroup,
};
