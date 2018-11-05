import Pablo from '../core';

const { svgVersion, ns } = Pablo;

const SVG_PREFIX = `<svg version="${svgVersion}" xmlns="${ns.xmlns}" xmlns:xlink="${ns.xlink}">`;
const SVG_SUFFIX = '</svg>';

let parser;

Pablo.fromMarkup = function (markup) {
  if (!parser) {
    parser = new Pablo.window.DOMParser();
  }

  // not supported in IE9: mime type 'image/svg+xml'
  const doc = parser.parseFromString(`${SVG_PREFIX}${markup}${SVG_SUFFIX}`, 'application/xml');
  const target = Pablo(doc.documentElement.firstChild);

  return target.remove();
};

// Backwards-compatibility
Pablo.markupToSvgElement = Pablo.fromMarkup;
