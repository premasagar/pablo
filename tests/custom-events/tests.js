var expect = chai.expect,
    assert = chai.assert;

describe('Testing that event delegation works', function () {
  describe('on', function () {
    it('on(eventName, cssSelector, fn)', function () {
      var subject = Pablo(['g', 'a', 'text']).append('circle', {}),
          complete = 0;

      subject.on(
          'foo',
          'circle',
          function(event){
            expect(event.target).to.eql(this);
            complete ++;
          }
      )
      .each(function(el){
        el.dispatchEvent(new CustomEvent('foo', {}));
      });
      expect(complete).to.eql(3);
    });

    it('on(eventName, functionSelector, fn)', function () {
      var subject  = Pablo(['g', 'a', 'text']).append('circle', {}),
          complete = 0;

      subject.on(
          'foo',
          function(el){
            return el.nodeName.toLowerCase() !== 'text';
          },
          function(event){
            expect(event.target).to.eql(this);
            complete ++;
          }
      )
      .each(function(el){
        el.dispatchEvent(new CustomEvent('foo', {}));
      });
      expect(complete).to.eql(2);
    });
  });

  describe('one', function () {
    it('one(eventName, cssSelector, fn)', function () {
      notDone();
    });

    it('one(eventName, functionSelector, fn)', function () {
      notDone();
    })
  });

  describe('oneEach', function () {
    it('oneEach(eventName, cssSelector, fn)', function () {
      notDone();
    });

    it('on(eventName, functionSelector, fn)', function () {
      notDone();
    })
  });
});

function notDone () {
  assert.ok(false, 'Test not implemented'.toUpperCase());
}

function resetTestSubjectStyles () {
  document.getElementById('test-subjects')
    .setAttribute('style', 'display:none;');
}