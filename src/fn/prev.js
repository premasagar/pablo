import Pablo from '../core';
import './traverse';

Pablo.fn.prev = function (selectors) {
  return this.traverse('previousElementSibling', selectors);
};

Pablo.fn.previous = Pablo.fn.prev;
