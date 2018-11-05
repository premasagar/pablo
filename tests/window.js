import requestAnimationFrame from 'raf';
import { JSDOM } from 'jsdom';
import XMLSerializer from '@harrison-ifeanyichukwu/xml-serializer';

const dom = new JSDOM('<!DOCTYPE html><body></body>');
const { window } = dom;

if (!window.performance.now) {
  const startTime = Date.now();
  window.performance.now = function () { return Date.now() - startTime; };
}

if (!window.requestAnimationFrame) {
  requestAnimationFrame.polyfill(window);
}

if (!window.XMLSerializer) {
  window.XMLSerializer = XMLSerializer;
}


console.log('DOC', window.document);

export default window;
