import Pablo from '../core';
import './traverse';

Pablo.fn.viewport = function (selectors) {
  return this.traverse('viewportElement', selectors);
};
