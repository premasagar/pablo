(function(window){
  'use strict';

  function run(){
    if (true || navigator.userAgent.indexOf('PhantomJS') < 0) {
      mocha.run();
    }
  }
  // if `?minjs` is used as a query parameter in the browser
  // Use query parameters in the test page's URL to direct which version of 
  // Pablo is being tested
  var search   = window.location.search,
      minjs    = window.TESTS_MINJS || /\bminjs\b/.test(search),
      remote   = window.TESTS_REMOTE || /\bremote\b/.test(search),
      sync     = window.TESTS_SYNC || /\bsync\b/.test(search),
      testsSrc = 'tests.js',
      librarySrc;

  // Setup Mocha
  mocha.setup('bdd');

  // Test pablo.min.js - either remote or local
  if (minjs){
    librarySrc = remote ?
      'http://pablojs.com/downloads/pablo.min.js' :
      '../build/pablo.min.js';
  }

  // Test pablo.js - either remote or local
  else {
    librarySrc = remote ?
      'http://pablojs.com/downloads/pablo.js' :
      '../pablo.js';
  }

  // Load the script to be tested

  // Synchronously (not yet functional)
  if (sync){
    document.write(
      '<script src="' + librarySrc + '"><\/script>' +
      '<script src="' + testsSrc + '"><\/script>'
    );
    run();
  }

  // Asynchronously
  else {
    getscript(librarySrc, function(){
      getscript(testsSrc, run);
    });
  }
}(this));