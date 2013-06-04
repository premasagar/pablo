
var fs          = require('fs'),
    grunt       = require('grunt'),
    exec        = require('execSync'),
    description = 'Move the minified code and tests.js over to the ' +
                  'gh-pages branch',
    tests,
    minCode,
    fullCode;

grunt.registerTask('toGhPages', description, function () {
  var finished = this.async();

  fullCode = fs.readFileSync('../pablo.js').toString();
  minCode  = fs.readFileSync('pablo.min.js').toString();
  tests    = fs.readFileSync('../tests/tests.js').toString();
  testcard = fs.readFileSync('../examples/testcard/testcard.js').toString();

  fs.unlinkSync('pablo.min.js');

  warn('git stash');
  code('git stash');

  warn('checkout gh-pages');
  code('git checkout gh-pages');

  ifFailureWarning();


  warn('Overwriting ../downloads/pablo.js');
  fs.writeFileSync('../downloads/pablo.js', fullCode, 'utf8');

  warn('Overwriting ../downloads/pablo.min.js');
  fs.writeFileSync('../downloads/pablo.min.js', minCode, 'utf8');

  warn('Overwriting ../tests/tests.js');
  fs.writeFileSync('../tests/tests.js', tests, 'utf8');

  warn('Overwriting ../media/testcard.js');
  fs.writeFileSync('../media/testcard.js', testcard, 'utf8');


  warn('git commit ../downloads/pablo.js');
  code('git commit ../downloads/pablo.js -m "Add latest pablo.js"');

  warn('git commit ../downloads/pablo.min.js');
  code('git commit ../downloads/pablo.min.js -m "Add latest pablo.min.js"');

  warn('git commit ../tests/tests.js');
  code('git commit ../tests/tests.js -m "Add latest tests"');

  warn('git commit ../media/testcard.js');
  code('git commit ../media/testcard.js -m "Add latest testcard"');


  warn('git checkout master');
  code('git checkout master');

  warn('git stash pop');
  code('git stash pop');

  console.log('If successful, do "git push origin gh-pages"');

  finished();
});

function warn (msg) {
  console.log('[grunt] Attempting: ' + msg);
}

function code (str) {
  console.log(exec.stdout(str));
  sleep(3000);
}

function ifFailureWarning () {
  console.log('[grunt] Warning: If anything fails now, you may remain on the ' + 
              'gh-pages branch. Checkout to wherever you where and do ' + 
              '"git stash pop".');
}

function sleep (milli) {
  var date = new Date();
  var curDate = null;
  do { curDate = new Date(); }
  while(curDate-date < milli);
}