import Pablo from '../core';
import PabloCollection from '../PabloCollection';
import '../fn/attr';

const RESERVED_METHODS = []; // 'filter', 'name'
const UNUSED_ARRAY_METHODS = ['fill', 'values'];

export default function defineAttributeMethods (attributeNames, nsType) {
  attributeNames.split(' ')
  .forEach(name => {
    // e.g. `filterAttr`, as `filter` is a reserved method name
    const methodName = RESERVED_METHODS.includes(name) ? `${name}Attr` : name;

    if (!(methodName in Pablo.fn) || (
        Pablo.fn[methodName] === Array.prototype[methodName] && UNUSED_ARRAY_METHODS.includes(methodName)
      )) {
      // e.g. Pablo.circle().cx(50)
      // e.g. Pablo.circle().filterAttr('#foo')
      Pablo.fn[methodName] = function getsetAttribute (value) {
        return this.attr(name, value);
      };
    }

    else if (Pablo.fn[methodName].name !== 'getsetAttribute') {
      console.warn(`${nsType} attribute method \`${methodName}\`: already exists`, Pablo.fn[methodName].name === 'appendElement' ? `(${Pablo.fn[methodName].nsType} element)` : Pablo.fn[methodName]);
    }
  });
}
