import Pablo from '../core';

Pablo.fn.empty = function (text) {
  // If the cache has any contents
  // if (Object.keys(cache).length){
  //     // Remove data for each descendent of elements in the collection
  //     this.find('*').off().removeData();
  // }

  // Remove elements, text and other nodes
  // This uses native DOM methods, rather than `detach()`, to ensure that
  // non-element nodes are also removed.
  
  this.forEach(el => {
    let child;

    while (child = el.firstChild) {
      el.removeChild(child);
    }
  });

  return this;
};
