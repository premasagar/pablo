import Pablo from '../core';
import './traverse';

Pablo.fn.nextSiblings = function (selectors) {
  return this.traverse('nextElementSibling', selectors, true);
};
