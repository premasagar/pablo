import Pablo from '../core';
import './traverse';

Pablo.fn.next = function (selectors) {
  return this.traverse('nextElementSibling', selectors);
};
