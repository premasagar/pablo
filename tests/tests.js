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

    describe('Pablo(input)', function () {

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

      it('should return a pablo collection containing a DOM element when passed the appropriate CSS Selector', function () {
        var pCollection  = Pablo('#test-subjects');

        expect(pCollection instanceof Pablo.Collection);
        expect(pCollection.length).to.eql(1);
        expect(pCollection[0].id).to.eql('test-subjects');
      });
    });

    describe('Pablo(element, [attributes])', function () {
      it('should create a new Pablo collection containing the specified element with the specified attributes', function () {
        var pCollection = Pablo('rect', {x:10, y:10, width:50, height:50});
        expect(pCollection instanceof Pablo.Collection).to.eql(true);
        expect(pCollection.length).to.eql(1);
        expect(pCollection[0].getAttribute('x')).to.eql('10');
        expect(pCollection[0].getAttribute('y')).to.eql('10');
        expect(pCollection[0].getAttribute('width')).to.eql('50');
        expect(pCollection[0].getAttribute('height')).to.eql('50');
      });

      it('should create a new Pablo collection containing multiple specified elements with the specified attributes', function () {
        var pCollection = Pablo(['rect', 'line', 'line'], {stroke:'black'});
        expect(pCollection instanceof Pablo.Collection).to.eql(true);
        expect(pCollection.length).to.eql(3);
        expect(pCollection[0].getAttribute('stroke')).to.eql('black');
        expect(pCollection[1].getAttribute('stroke')).to.eql('black');
        expect(pCollection[2].getAttribute('stroke')).to.eql('black');
      });
    });
  });

  describe('Pablo collection methods', function () {
    describe('.append(element, [attributes])', function () {
      it('should return a Pablo collection', function () {
        expect(Pablo.circle().append(Pablo.rect()) instanceof Pablo.Collection).to.eql(true);
      });

      it('.append(elements) should append the specified element(s) as a child of the specific Pablo collection and return ', function () {
        var pCollection = Pablo.circle();
        pCollection.append(Pablo.rect());

        expect(pCollection[0].childNodes.length).to.eql(1);
        expect(pCollection[0].childNodes[0] instanceof SVGRectElement).to.eql(true);
      });

      it('.append(elementName, attributes) should create a new element as a child of the specific Pablo collection', function () {
        var pCollection = Pablo.circle();
        pCollection.append('rect', {foo: 'bar'});

        expect(pCollection[0].childNodes.length).to.eql(1);
        expect(pCollection[0].childNodes[0] instanceof SVGRectElement).to.eql(true);
        expect(pCollection[0].childNodes[0].getAttribute('foo')).to.eql('bar');
      });
    });

    describe('.appendTo(element)', function () {
      it('should return a Pablo collection', function () {
        expect(Pablo.circle().appendTo(Pablo.rect()) instanceof Pablo.Collection).to.eql(true);
      });

      it('.appendTo(element) should append the subject collection to the passed in element', function () {
        var pCollection  = Pablo.circle({foo:'bar'}),
            pCollection2 = Pablo.rect();

        pCollection.appendTo(pCollection2);

        expect(pCollection2[0].childNodes.length).to.eql(1);
        expect(pCollection2[0].childNodes[0] instanceof SVGCircleElement).to.eql(true);
        expect(pCollection2[0].childNodes[0].getAttribute('foo')).to.eql('bar');
      });

      it('.appendTo(elementName, attributes) should append the subject collection to a newly created element respective of the passed arguments', function () {
        var pCollection = Pablo.circle({foo: 'bar'}),
            parent      = pCollection.appendTo('rect', {})[0].parentNode;
        
        expect(parent.childNodes.length).to.eql(1);
        expect(parent.childNodes[0] instanceof SVGCircleElement).to.eql(true);
        expect(parent.childNodes[0].getAttribute('foo')).to.eql('bar');
      });
    });

    describe('.prepend(elements, [attributes])', function () {
      it('should return a Pablo collection', function () {
        expect(Pablo.circle().prepend(Pablo.rect()) instanceof Pablo.Collection).to.eql(true);
      });

      it('.prepend(element) should prepend the passed element to the subject collection', function () {
        notDone();
      });

      it('.prepend(elementName, attributes) should prepend the subject collection to the a newly created element respective of the passed arguments', function () {
        notDone();
      });
    });
  });

  describe('Pablo.ELEMENT_NAME([attributes])', function () {
    it('Pable.svg([attributes]) should return a Pablo collection of that element and with the attribute "version=1.1" on it', function () {
      var pCollection = Pablo.svg();

      expect(pCollection instanceof Pablo.Collection).to.eql(true);
      expect(pCollection[0].tagName.toLowerCase()).to.eql('svg');
      expect(pCollection[0].getAttribute('version')).to.eql('1.1');
    });

    'a altGlyph altGlyphDef altGlyphItem animate animateColor animateMotion animateTransform circle clipPath color-profile cursor defs desc ellipse feBlend feColorMatrix feComponentTransfer feComposite feConvolveMatrix feDiffuseLighting feDisplacementMap feDistantLight feFlood feFuncA feFuncB feFuncG feFuncR feGaussianBlur feImage feMerge feMergeNode feMorphology feOffset fePointLight feSpecularLighting feSpotLight feTile feTurbulence filter font font-face font-face-format font-face-name font-face-src font-face-uri foreignObject g glyph glyphRef hkern image line linearGradient marker mask metadata missing-glyph mpath path pattern polygon polyline radialGradient rect script set stop style svg switch symbol text textPath title tref tspan use view vkern'
    .split(' ')
    .forEach(function (element) {
      it('Pablo.' + element + '([attributes]) should return a Pablo collection of that element', function () {
        var pCollection = Pablo[element]({foo:'bar'});

        expect(pCollection instanceof Pablo.Collection).to.eql(true);
        expect(pCollection[0].tagName.toLowerCase()).to.eql(element.toLowerCase());
        expect(pCollection[0].getAttribute('foo')).to.eql('bar');
      });
    });    
  });

});


function notDone () {
  assert.ok(false, 'Test not implemented');
}