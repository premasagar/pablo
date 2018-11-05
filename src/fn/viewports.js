import Pablo from '../core';
import './traverse';

Pablo.fn.viewports = function (selectors) {
  return this.traverse('viewportElement', selectors, true);
};
