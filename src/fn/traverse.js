import Pablo from '../core';

Pablo.fn.traverse = function (prop, selectors, iterate = false) {
  const collection = Pablo();

  this.forEach((el, i) => {
    el = el[prop];

    while (el) {
      collection.push(el);

      if (!iterate || (typeof iterate === 'function' && !iterate.call(this, el, i))) {
        el = false;
      }

      else {
        el = el[prop];
      }
    }
  });

  if (selectors && typeof Pablo.fn.select === 'function') {
    return collection.select(selectors);
  }

  return collection;
}
