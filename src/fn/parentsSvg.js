import Pablo from '../core';
import './traverse';

Pablo.fn.parentsSvg = function (selectors) {
  const { SVGElement } = Pablo.window;
  
  return this.traverse('parentNode', selectors, el => el instanceof SVGElement);
};
