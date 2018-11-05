import Pablo from '../core';


/* Arguments:
`deepDom`: clones descendent DOM elements and DOM event listeners (default true)
`withData` clones data associated with the element (default false)
`deepData` clones data associated with descendents of the element (defaults to same as `withData`)
*/
Pablo.fn.clone = function (deepDom = true, withData = false, deepData = withData) {
  // const isSingle = this.length === 1;

  // if (typeof deepDom !== 'boolean') {
  //   deepDom = true;
  // }

  // if (typeof withData !== 'boolean') {
  //   withData = false;
  // }

  // if (typeof deepData !== 'boolean') {
  //   deepData = withData;
  // }

  return this.map(el => {
    const cloned = el.cloneNode(deepDom);
    // let data, node, clonedNode, dataset;

    // Clone data associated with the element
    // if (withData) {
    //   // Avoid unnecessary Pablo collection creation
    //   node = isSingle ? this : Pablo(el);
    //   data = node.cloneData();

    //   if (data){
    //       // Set data on the cloned element
    //       clonedNode = Pablo(cloned).data(data);
    //   }
    // }

    // // Clone descendents' data
    // if (deepDom && deepData){
    //   if (!clonedNode){
    //       clonedNode = Pablo(cloned);
    //   }

    //   dataset = node.pluck('data');
    //   clonedNode.find('*').data(dataset);
    // }

    return cloned;
  });
};
