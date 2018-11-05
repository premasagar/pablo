import Pablo from '../core';

Pablo.fn.push = function (...elems) {
  for (let i = 0; i < elems.length; i++) {
    const elem = elems[i];
    const type = typeof elem;

    if (elem && (type === 'object' || type === 'function')) {
      if (typeof elem.length === 'number') {
        if (elem.length > 0) {
          this.push(...elem);
        }
      }

      else if (!this.includes(elem)) {
        Array.prototype.push.call(this, elem);
      }
    }
  }

  return this;
}

Pablo.fn.add = Pablo.fn.push;
