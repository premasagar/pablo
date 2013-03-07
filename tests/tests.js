var expect = chai.expect,
    assert = chai.assert;

describe('pablo test suite', function () {
  it('should load the the pablo library into the browser', function () {
    expect(Pablo).to.be.a('function');
  });
});