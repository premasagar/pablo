import Pablo from '../core';
import './traverse';

Pablo.fn.parent = function (selectors) {
  return this.traverse('parentNode', selectors);
};
