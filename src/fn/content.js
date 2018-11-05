import Pablo from '../core';

Pablo.fn.content = function (text) {
  // Get first element's textContent
  if (typeof text === 'undefined'){
    return this.length && this[0].textContent || '';
  }

  // Set every element's textContent
  this.forEach((el, i) => el.textContent = this.getValue(text, i));

  return this;
};
