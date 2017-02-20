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

  const members = [];

  group.add = (subscriber) => {
    const index = members.indexOf(subscriber);

    if (index !== -1) {
      return;
    }

    members.push(SubscriberAudioPlayer(subscriber));
    subscriber.on('destroyed', () => group.remove(subscriber));
    group.update();
  };

  group.remove = (subscriber) => {
    const index = members.indexOf(subscriber);

    if (index === -1) {
      return;
    }

    members.splice(index, 1);
    group.update();
  };

  group.update = () => {
    if (members.length === 1) {
      members[0].setLeftRightBalance(0.5);
    } else if (members.length === 0) {
      return;
    }

    const rawBalances = members.map(player => player.getDomBasedBalance());
    const least = rawBalances.reduce((x, y) => Math.min(x, y));
    const most = rawBalances.reduce((x, y) => Math.max(x, y));

    if (least === most) {
      for (const member of members) {
        member.setLeftRightBalance(0.5);
      }

      return;
    }

    const balances = rawBalances.map(bal => (bal - least) / (most - least));

    for (const i of range(balances.length)) {
      members[i].setLeftRightBalance(balances[i]);
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

return {
  SubscriberAudioPlayer,
  SubscriberGroup,
  SessionGroup,
};
