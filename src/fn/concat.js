import Pablo from '../core';

Pablo.fn.concat = function (...elems) {
  return Pablo(...this, ...elems);
};
