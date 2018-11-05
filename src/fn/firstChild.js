import Pablo from '../core';
import './traverse';

Pablo.fn.firstChild = function (selectors) {
  return this.traverse('firstElementChild', selectors);
};
