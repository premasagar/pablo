import Pablo from '../core';
import './traverse';

Pablo.fn.parents = function (selectors) {
  const { Element } = Pablo.window;
  
  return this.traverse('parentNode', selectors, el => el instanceof Element);
};
