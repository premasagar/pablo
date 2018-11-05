import Pablo from '../core';
import './detach';

Pablo.fn.remove = function () {
  // If the cache has any contents
  // if (Object.keys(cache).length){
  //   // Remove data for all elements and their descendents
  //   this.off().removeData();
  //   this.find('*').off().removeData();
  // }

  // Remove from the DOM
  return this.detach();
};
