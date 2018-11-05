import Pablo from '../core';

Pablo.fn.toArray = function () {
  const array = new Array(this.length);

  for (let i = 0; i < this.length; i++) {
    array[i] = this[i];
  }

  return array;

  // return Array.prototype.slice.call(this);
};
