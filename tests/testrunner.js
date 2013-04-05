(function(window){
  'use strict';

  function run(){
    mocha.run();
  }
  // if `?minjs` is used as a query parameter in the browser
  // Use query parameters in the test page's URL to direct which version of 
  // Pablo is being tested
  var search   = window.location.search,
      minjs    = window.PABLO_MINJS || /\bminjs\b/.test(search),
      remote   = window.PABLO_REMOTE || /\bremote\b/.test(search),
      sync     = window.PABLO_SYNC || /\bsync\b/.test(search),
      testsSrc = 'tests.js',
      pabloSrc;

  // Setup Mocha
  mocha.setup('bdd');

  // Test pablo.min.js - either remote or local
  if (minjs){
    pabloSrc = remote ?
      'http://pablojs.com/downloads/pablo.min.js' :
      '../build/dist/pablo.min.js';
  }

  // Test pablo.js - either remote or local
  else {
    pabloSrc = remote ?
      'http://pablojs.com/downloads/pablo.js' :
      '../pablo.js';
  }

  // Load the script to be tested

  // Synchronously (not yet functional)
  if (sync){
    document.write(
      '<script src="' + pabloSrc + '"><\/script>' +
      '<script src="' + testsSrc + '"><\/script>'
    );
    run();
  }

  // Asynchronously
  else {
    getscript(pabloSrc, function(){
      getscript(testsSrc, run);
    });
  }
}(this));