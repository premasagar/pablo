import Pablo from '../core';

Pablo.fn.splice = function () {
  return Pablo(Array.prototype.splice.apply(this, arguments));
};
