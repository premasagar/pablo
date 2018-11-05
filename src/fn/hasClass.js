import Pablo from '../core';

Pablo.fn.hasClass = function (className) {
  return this.some((el, i) => el.classList.contains(this.getValue(className, i)));
};
