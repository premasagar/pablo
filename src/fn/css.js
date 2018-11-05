import Pablo from '../core';

let CSS_PROPERTIES;

export function cssProperties () {
  if (!CSS_PROPERTIES) {
    const { document } = Pablo;
    const props = Object.keys(document.body.style.constructor.prototype);

    CSS_PROPERTIES = props.reduce((result, prop) => {
      if (typeof props[prop] !== 'function') {
        result[prop] = true;
      }

      return result;
    }, {});
  }

  return CSS_PROPERTIES;
}

const CHARCODE_a = 'a'.charCodeAt(0);


// Translate hyphenated and camelCase CSS properties
export function resolveProperty (prop) {
  const cssProps = cssProperties();

  if (prop in cssProps) {
    return prop;
  }

  let testProp;
  const hyphenPos = prop.indexOf('-');

  if (hyphenPos !== -1) {
    testProp = prop.slice(0, hyphenPos) + prop[hyphenPos + 1].toUpperCase() + prop.slice(hyphenPos + 2);
  }

  else {
    let capitalPos;

    for (let i = 0, length = prop.length; i < length; i++) {
      if (prop.charCodeAt(i) < CHARCODE_a) {
        capitalPos = i;
        break;
      }
    }

    if (capitalPos !== undefined) {
      testProp = prop.slice(0, capitalPos) + '-' + prop.slice(capitalPos).toLowerCase();
    }
  }

  if (testProp && testProp in cssProps) {
    return testProp;
  }

  return null;
}

Pablo.fn.css = function (newStyle, value, important = false) {
  if (typeof newStyle !== 'object'){
    if (value === undefined) {
      const el = this[0];
      const styles = Pablo.window.getComputedStyle(el, null);

      if (newStyle) {
        const prop = resolveProperty(newStyle);

        // return el.style[prop];
        return styles.getPropertyValue(prop);
      }

      return Object.keys(cssProperties()).reduce((result, prop) => {
        // const value = el.style[prop];
        const value = styles.getPropertyValue(prop);

        if (typeof value === 'string' && value.length) {
          result[prop] = value;
        }

        return result;
      }, {});

      // return el.style;
    }

    // Set named value
    newStyle = {[prop]: value};
  }

  const priority = important ? 'important' : undefined;

  this.forEach((el, i) => {
    Object.keys(newStyle).forEach(prop =>
      el.style.setProperty(resolveProperty(prop), this.getValue(newStyle[prop], i), priority)
    );
  });

  return this;
};
