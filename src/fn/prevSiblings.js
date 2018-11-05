import Pablo from '../core';
import './traverse';

Pablo.fn.prevSiblings = function (selectors) {
  return this.traverse('previousElementSibling', selectors, true);
};

Pablo.fn.previousSiblings = Pablo.fn.prevSiblings;
