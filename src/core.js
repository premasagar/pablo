import PabloCollection from './PabloCollection';

function Pablo (...elems) {
  return new PabloCollection(elems);
}

Pablo.svgVersion = 1.1;
Pablo.ns = {
  xmlns: 'http://www.w3.org/2000/xmlns/',
  svg: 'http://www.w3.org/2000/svg',
  html: 'http://www.w3.org/1999/xhtml',
  xlink: 'http://www.w3.org/1999/xlink'
};
Pablo.elements = {}; // extended when elements are defined
Pablo.fn = PabloCollection.prototype;
Pablo.window = typeof window !== 'undefined' ? window : null;
Pablo.document = typeof document !== 'undefined' ? document : null;

Pablo.create = function (name, nsType = 'svg', document = Pablo.document) {
  if (typeof name !== 'string' || typeof document === 'undefined') {
    return null;
  }

  // if (nsType === 'html') {
  //   return document.createElement(name);
  // }

  return document.createElementNS(Pablo.ns[nsType], name);
};

Pablo.el = function (name, attr, nsType, document) {
  // Optional attr
  // if (attr) {
  //   if (typeof attr === 'string') {
  //     document = nsType;
  //     nsType = attr;
  //   }

  //   else {
  //     document = attr;
  //     nsType = undefined;
  //   }

  //   attr = undefined;
  // }

  // // Optional attr
  // if (attr && (typeof attr === 'string' || ('Document' in Pablo.window && attr instanceof Pablo.window.Document))) {
  //   document = nsType;
  //   nsType = attr;
  //   attr = undefined;
  // }

  // // Optional nsType
  // if (typeof nsType === 'object') {
  //   document = nsType;
  //   nsType = undefined;
  // }

  // if (typeof attr === 'string') {
  //   document = nsType;
  //   nsType = attr;
  //   attr = undefined;
  // }

  // else if (nsType && 'Document' in Pablo.window && nsType instanceof Pablo.window.Document) {
  //   document = nsType;
  //   nsType = undefined;
  // }

  const collection = Pablo(Pablo.create(name, nsType, document));
  
  if (attr && 'attr' in Pablo.fn) {
    collection.attr(attr);
  }

  return collection;
};

export default Pablo;
