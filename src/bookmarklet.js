'use strict';

const { SessionGroup } = require('./index');

const msg = (str) => {
  const div = document.createElement('div');
  div.style.borderRadius = '5px';
  div.style.backgroundColor = '#cff';
  div.style.color = '#000';
  div.style.zIndex = '100';
  div.textContent = str;

  div.style.position = 'fixed';
  div.style.right = '10px';
  div.style.bottom = '10px';

  div.style.padding = '10px';

  document.body.appendChild(div);

  let timerId;

  const clearTimer = () => clearTimeout(timerId);

  const setTimer = () => {
    timerId = setTimeout(() => {
      div.remove();
    }, 3000);
  };

  setTimer();

  div.addEventListener('mouseover', () => {
    clearTimer();
    div.style.backgroundColor = '#cfc';
  });

  div.addEventListener('mouseout', () => {
    setTimer();
    div.style.backgroundColor = '#cff';
  });
};

const run = () => {
  const OT = window.OT;

  if (!window.OT) {
    msg('OpenTok not found on this page.');
    return;
  }

  if (window.opentokStereoActivated) {
    msg('OpenTok Stereo should already be active.');
    return;
  }

  const session = OT.sessions.find();

  if (!session) {
    msg('Session not found.');
  }

  window.opentokStereoSessionGroup = SessionGroup(session);

  window.opentokStereoActivated = true;

  msg('OpenTok Stereo activated.');
};

try {
  run();
} catch (e) {
  msg(`Exception thrown on set-up: ${e.msg}`);
  window.opentokStereoErrors = window.opentokStereoErrors || [];
  window.opentokStereoErrors.push(e);
  throw e;
}
