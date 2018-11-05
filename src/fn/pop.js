import Pablo from '../core';

Pablo.fn.pop = function () {
  return Pablo(Array.prototype.pop.call(this));
};

// ['pop', 'shift', 'slice', 'splice', 'reverse', 'sort'].forEach(method => {
//   Pablo.fn[method] = function () {
//     return Pablo(Array.prototype[method].apply(this, arguments));
//   };
// });
