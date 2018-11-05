import Pablo from '../core';

Pablo.fn.bbox = function () {
  if (!this.length || !('getBBox' in this[0])) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  return this[0].getBBox();
};
