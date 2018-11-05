import Pablo from '../core';
// import { unique } from '../PabloCollection';

// Pablo.fn.unshift = function (...elems) {
//   const allElems = unique([...elems, ...this]);

//   // No elements were excluded
//   if (allElems.length === elems.length + this.length) {
//     Array.prototype.unshift.apply(this, elems);
//   }

//   // Elements were excluded; rewrite
//   else {
//     for (let i = 0; i < allElems.length; i++) {
//       this[i] = allElems[i];
//     }
//   }

//   return this;
// };

Pablo.fn.unshift = function (...elems) {
  const toAdd = [];

  for (let i = 0; i < elems.length; i++) {
    const elem = elems[i];
    const type = typeof elem;

    if (elem && (type === 'object' || type === 'function')) {
      if (typeof elem.length === 'number') {
        if (elem.length > 0) {
          for (let j = 0; j < elems.length; j++) {
            const elem = elems[j];
            const type = typeof elem;

            if ((type === 'object' || type === 'function') && !collection.includes(elem) && !toAdd.includes(elem)) {
              toAdd[toAdd.length] = elem;
            }
          }
        }
      }

      else if (!collection.includes(elem) && !toAdd.includes(elem)) {
        toAdd[toAdd.length] = elem;
      }
    }
  }

  Array.prototype.unshift.apply(collection, toAdd);
  return this;
}
