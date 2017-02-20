'use strict';

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

module.exports = {
  placeDot,
  Dot,
};
