import Pablo from '../core';

export function forEachInStringList (stringList, fn, delimiter = ' ') {
  stringList = stringList.trim();

  // Multiple items
  if (stringList && stringList.indexOf(delimiter) !== -1){
    stringList.split(delimiter).forEach(str => fn.call(this, str));
  }

  // Single item
  else {
    fn.call(this, stringList);
  }
}

['add', 'remove', 'toggle'].forEach(method => {
  Pablo.fn[`${method}Class`] = function (classNames) {
    this.forEach((el, i) => 
      forEachInStringList(this.getValue(classNames, i), className => el.classList[method](className))
    );

    return this;
  };
});
