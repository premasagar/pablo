import Pablo from '../core';

function getAttributes (el) {
  const result = {};

  if (el) {
    for (let i = 0, length = el.attributes.length; i < length; i++) {
      result[el.attributes[i].name] = el.attributes[i].value;
    }
  }

  return result;
}

export function attributeNS (action, el, attrName, value) {
  let name = attrName;
  let methodName = `${action}Attribute`;
  let ns;

  // The `xmlns` attribute
  if (name === 'xmlns'){
    ns = 'xmlns';
  }

  else {
    // Non-SVG attribute, e.g. HTML `src`
    // And for browsers that incorrectly don't output prefixes with markup(),
    // e.g. Safari 6.05
    if (el.namespaceURI !== Pablo.ns.svg) {
      return el[methodName](name, value);
    }

    // Find a colon separating the namespace prefix from the attribute name
    const colonIndex = name.indexOf(':');
    
    // A prefixed, namespaced attribute, e.g. `xlink:href`
    // e.g. ns === 'xlink'
    if (colonIndex !== -1){
      ns = attrName.slice(0, colonIndex);
      
      // setAttributeNS uses the prefixed name, others
      // the un-prefixed name, e.g. `href`
      if (methodName !== 'setAttribute') {
        name = attrName.slice(colonIndex + 1);
      }
    }
  }

  // URI for the namespace
  const uri = ns && Pablo.ns[ns] || null;

  return el[`${methodName}NS`](uri, name, value);
}

Pablo.fn.attr = function (name, value) {
  if (Array.isArray(name)) {
    this.forEach((el, i) => Pablo(el).attr(this.getValue(name, i)));
  }

  else if (typeof name === 'object') {
    const newAttr = name;
    const attrNames = Object.keys(newAttr);

    this.forEach((el, i) => 
      attrNames.forEach(name => Pablo(el).attr(name, this.getValue(newAttr[name], i)))
    );
  }

  else if (value === undefined) {
    const el = this[0];

    if (name === undefined) {
      return getAttributes(el);
    }

    // if (name === true) {
    //   return this.map(getAttributes);
    // }

    return attributeNS('get', el, name);
  }

  else if (value === null) {
    this.forEach(el => attributeNS('remove', el, name));
  }

  else {
    this.forEach((el, i) => attributeNS('set', el, name, this.getValue(value, i)));
  }

  return this;
};

Pablo.fn.attribute = Pablo.fn.attr;
