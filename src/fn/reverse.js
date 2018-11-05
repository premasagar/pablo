import Pablo from '../core';

Pablo.fn.reverse = function () {
  return Pablo(Array.prototype.reverse.call(this));
};
