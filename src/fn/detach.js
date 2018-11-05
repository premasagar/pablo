import Pablo from '../core';

Pablo.fn.detach = function () {
  this.forEach(el => {
    if (el.parentNode){
      el.parentNode.removeChild(el);
    }
  });

  return this;
};
