import Pablo from '../core';
import './clone';
import './withViewport';

let xmlSerializer;

Pablo.fn.markup = function (asCompleteFile){
  if (!xmlSerializer) {
    xmlSerializer = new Pablo.window.XMLSerializer();
  }

  const collection = asCompleteFile ? this.clone().withViewport() : this;

  let markup = '';

  return collection.reduce((markup, el) =>
    markup + xmlSerializer.serializeToString(el), ''
  );
};

Pablo.fn.toString = Pablo.fn.markup;
