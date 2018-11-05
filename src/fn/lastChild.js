import Pablo from '../core';
import './traverse';

Pablo.fn.lastChild = function (selectors) {
  return this.traverse('lastElementChild', selectors);
};
