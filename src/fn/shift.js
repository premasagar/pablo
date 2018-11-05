import Pablo from '../core';

Pablo.fn.shift = function () {
  return Pablo(Array.prototype.shift.call(this));
};
