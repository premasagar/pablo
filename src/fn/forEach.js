import Pablo from '../core';

Pablo.fn.forEach = function (fn, context = this) {
  if (this.length) {
    if (this.length === 1){
      fn.call(context, this[0], 0, this);
    }

    else {
      Array.prototype.forEach.call(this, fn, context);
    }
  }

  return this;
};

Pablo.fn.each = Pablo.fn.forEach;
