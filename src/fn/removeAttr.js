import Pablo from '../core';
import { attributeNS } from './attr';

Pablo.fn.removeAttr = function (name) {
  this.forEach(el => attributeNS('remove', el, name));
  return this;
};
