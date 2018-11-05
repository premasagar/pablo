import Pablo from '../core';
// import './traverse';

// Ideally, we'd use the 'children'
// collection, instead of 'childNodes'. Even if a browser implements
// 'children' on HTML elements, it isn't always implemented on SVG elements
// See https://hacks.mozilla.org/2009/06/dom-traversal/
// Bug report in WebKit: https://bugs.webkit.org/show_bug.cgi?id=112698

// Pablo.fn.children = function (selectors) {
//   return this.traverse('childNodes', selectors);
// };


Pablo.fn.children = function () {
  return this.reduce((collection, el) => {
    collection.push(...el.children);
    return collection;
  }, Pablo());
};
