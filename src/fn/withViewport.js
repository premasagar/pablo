import Pablo from '../core';
import './crop';

Pablo.fn.withViewport = function () {
  // If this is already a single <svg> element
  if (this.length === 1 && this[0].nodeName === 'svg'){
    return this;
  }

  // Append to a new <svg> element
  return Pablo.svg().append(this).crop();
};
