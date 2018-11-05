import Pablo from './core';

// export function isUnique (array) {
//   return array.length < 2 || array.every((item, i) => array.lastIndexOf(item) === i);
// }

// export function unique (array) {
//   if (!isUnique(array)) {
//     return array.reduce(function (result, item, i) {
//       if (!i || !result.includes(item)) {
//         result.push(item);
//       }

//       return result;
//     }, []);
//   }

//   return array;
// }

function isArrayLike (obj) {
  return (typeof obj === 'object' || typeof obj === 'function') && typeof obj.length === 'number' && obj.length >= 0;
}

class ArrayLike {}
ArrayLike.prototype = Object.create(Array.prototype);

// extending with `Array` instead of ArrayLike prevents method extension on Node.js
export default class PabloCollection extends ArrayLike {
  constructor (elems) {
    super();
    this.push(...elems);
  }

  el (name, attr, nsType, document) {
    // Optional attr
    if (attr && (typeof attr === 'string' || attr instanceof Pablo.window.Document)) {
      document = nsType;
      nsType = attr;
      attr = undefined;
    }

    // Optional nsType
    if (typeof nsType === 'object') {
      document = nsType;
      nsType = undefined;
    }

    const el = Pablo.create(name, nsType, document);

    if (attr && 'attr' in this) {
      Pablo(el).attr(attr);
    }

    this[this.length] = el;

    return this;
  }

  child (...children) {
    if (!this.length) {
      return this;
    }

    let collection = Pablo();

    if (typeof children[0] === 'string') {
      const [name, attr] = children;
      
      this.forEach(parent => {
        let nsType;

        // e.g. documentElement, 'svg' or 'html'
        if (name in Pablo.elements) {
          nsType = name;
        }

        // Use nsType of parent namespace
        else {
          nsType = Object.keys(Pablo.elements).find(nsType => Pablo.ns[nsType] === parent.namespaceURI);
        }

        const child = Pablo.create(name, nsType, parent.ownerDocument);

        if (attr && 'attr' in PabloCollection.prototype) {
          Pablo(child).attr(attr);
        }

        parent.appendChild(child);
        collection.push(child);
      });
    }

    else {
      const parent = this[0];

      children.forEach(child => {
        if (child) {
          if (isArrayLike(child)) {
            for (let i = 0, length = child.length; i < length; i++) {
              collection.push(parent.appendChild(child[i]));
            }
          }

          else {
            collection.push(parent.appendChild(child));
          }
        }
      });
    }

    return collection;
  }

  append () {
    this.child.apply(this, arguments);
    return this;
  }

  remove () {
    this.forEach(el => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });

    return this;
  }

  getValue (value, i) {
    if (Array.isArray(value)) {
      // If array is shorter than collection, then cycle back to start
      i = i % value.length;
      value = value[i];
    }

    else if (typeof value === 'function') {
      value = value.call(this, this[i], i);
    }

    return value;
  }
}
