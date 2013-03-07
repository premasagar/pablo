var expect = chai.expect,
    assert = chai.assert;

describe('Pablo test suite', function () {
  it('should load the the Pablo library into the browser', function () {
    expect(Pablo).to.be.a('function');
  });

  it('should load the jQuery library into the browser for one of the Collections test', function () {
    expect(jQuery).to.be.a('function');
  });

  it('Pablo is supported in this browser', function () {
    expect(Pablo.isSupported).to.eql(true);
  });
});

describe('Pablo', function () {

  describe('Collections', function () {

    describe('Pablo()', function () {

      it('should return an empty pablo collection when invoked without argument', function () {
        var pCollection   = Pablo();

        expect(pCollection instanceof Pablo.Collection).to.eql(true);
        expect(pCollection.length).to.eql(0);
      });

      it('should return a pablo collection containing a DOM element when invoked with that dom element', function () {
        var targetElement = document.getElementById('test-subjects'),
            pCollection   = Pablo(targetElement);

        expect(pCollection instanceof Pablo.Collection).to.eql(true);
        expect(pCollection.length).to.eql(1);
        expect(pCollection[0].id).to.eql('test-subjects');
      });

      it('should return a pablo collection containing a list when passed a HTMLCollection or NodeList (and excludes text node)', function () {
        var nodeList    = document.getElementById('test-subjects').childNodes,
            pCollection = Pablo(nodeList);

        expect(pCollection instanceof Pablo.Collection).to.eql(true);
        expect(pCollection.length).to.eql(3);
      });

      it('should return a pablo collection containing a list when passed an Array of elements', function () {
        var nodeList = document.getElementById('test-subjects').childNodes,
            asArray  = [],
            pCollection;

          for (var i = 0; i < nodeList.length; i++) {
            asArray.push(nodeList[i]);
          };

        pCollection = Pablo(asArray);

        expect(pCollection instanceof Pablo.Collection).to.eql(true);
        expect(pCollection.length).to.eql(3);
        expect(pCollection[0].id).to.eql('test-subject-a');
        expect(pCollection[1].id).to.eql('test-subject-b');
        expect(pCollection[2].id).to.eql('test-subject-c');
      });

      it('should return a pablo collection containing a list when passed a Array like collection (e.g. jQuery)', function () {
        var jQueryCollection = jQuery('#test-subjects'),
            pCollection      = Pablo(jQueryCollection);

        expect(pCollection instanceof Pablo.Collection);
        expect(pCollection.length).to.eql(1);
        expect(pCollection[0].id).to.eql('test-subjects');
      });

      it('should return a pablo collection containing a list when passed a Pablo collection', function () {
        var pCollection  = Pablo(document.getElementById('test-subjects').children),
            pCollection2 = Pablo(pCollection); 

        expect(pCollection instanceof Pablo.Collection);
        expect(pCollection.length).to.eql(3);
        expect(pCollection[0].id).to.eql('test-subject-a');
        expect(pCollection[1].id).to.eql('test-subject-b');
        expect(pCollection[2].id).to.eql('test-subject-c');
      });
    });
  });

  describe('Collection methods', function () {

  });

});


function notDone () {
  assert.ok(false, 'Test not implemented');
}