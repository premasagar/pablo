import Pablo from '../core';

Pablo.fn.sort = function () {
  return Pablo(Array.prototype.sort.apply(this, arguments));
};
