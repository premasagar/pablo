import Pablo from '../core';
import PabloCollection from '../PabloCollection';

// Add elements from any DOM, e.g.
// https://developer.mozilla.org/en-US/docs/Web/MathML/

const RESERVED_METHODS = []; // 'filter'

export default function defineElementMethods (elementNames, nsType, nsURI = null) {
  // An nsURI must be given when adding a new
  // namespace. An existing uri could be used, e.g.
  //   defineElementMethods('foo', ['a', 'b'], Pablo.ns.html);
  if (!(nsType in Pablo.ns)) {
    if (!nsURI) {
      throw new Error(`${nsType}, unknown namespace uri`);
    }

    Pablo.ns[nsType] = nsURI;
  }

  // e.g. Pablo.svg({width: 100, height: 200}, window.document)
  Pablo[nsType] = function (attr, document) {
    const elementName = nsType;
    return Pablo.el(elementName, attr, nsType, document);
  }

  // Add element names to `Pablo.elements`
  Pablo.elements[nsType] = elementNames.slice();

  // e.g. Pablo.svg(attr)
  // e.g. Pablo.html(attr)
  // e.g. Pablo.svg('circle', attr)
  // e.g. Pablo.html('div', attr)
  Pablo[nsType] = function pushElementRoot (name, attr, document) {
    // Optional name
    if (!name || typeof name === 'object') {
      document = attr;
      attr = name;
      name = nsType;
    }

    return Pablo.el(name, attr, nsType, document);
  };

  // e.g. Pablo(body).svg(attr)
  // e.g. Pablo(foreignObject).html(attr)
  // e.g. Pablo(el).svg('circle', attr)
  // e.g. Pablo(el).html('div', attr)
  Pablo.fn[nsType] = function appendElementRoot (name, attr) {
    // Optional name
    if (typeof name === 'object') {
      attr = name;
      name = nsType;
    }

    return this.child(name, attr);
  };

  elementNames.split(' ')
  .forEach(name => {
    // e.g. Pablo.svg.circle(attr)
    Pablo[nsType][name] = function (attr, document) {
      return Pablo.el(name, attr, nsType, document);
    };

    // e.g. `filterElem`, as `filter` is a reserved method name
    const methodName = RESERVED_METHODS.includes(name) ? `${name}Elem` : name;

    if (!(methodName in Pablo.fn)) {
      // e.g. Pablo.circle(attr)
      // e.g. Pablo.filterElem(attr)
      // General element functions are only created if // they do not already exist so, e.g. Pablo.a()
      // creates an SVG <a> if SVG elements are defined
      // first, or an HTML <a> if HTML elements are 
      // defined first.
      // Specific elements can still be created with
      // e.g. Pablo.html.a(), Pablo.html.div().a() and
      // Pablo.svg.a(), Pablo.svg.g().a()
      Pablo[methodName] = Pablo[nsType][name];

      // e.g. Pablo(el).circle(attr)
      Pablo.fn[methodName] = function appendElement (attr) {
        return this.child(name, attr);
      };
      Pablo.fn[methodName].nsType = nsType;
    }

    else if (Pablo.fn[methodName].name !== 'appendElementRoot') {
      console.warn(`${nsType} element method: \`${methodName}\` already exists`, Pablo.fn[methodName].name === 'appendElement' ? `(${Pablo.fn[methodName].nsType} element)` : Pablo.fn[methodName]);
    }
  });
}
