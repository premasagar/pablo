import Pablo from '../core';

Pablo.fn.slice = function () {
  return Pablo(Array.prototype.slice.apply(this, arguments));
};
