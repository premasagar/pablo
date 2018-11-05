import Pablo from '../core';
import './markup';

function toString (el) {
  return Pablo(el).markup();
}

Pablo.fn.join = function (separator) {
  return Array.prototype.map.call(this, el => Pablo(el).markup()).join(separator);
};
