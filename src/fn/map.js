import Pablo from '../core';

Pablo.fn.map = function (fn, context = this) {
  return Pablo(Array.prototype.map.call(this, fn, context));
};
