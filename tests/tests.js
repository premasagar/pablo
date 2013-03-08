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
        var pCollection = Pablo();

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

    describe('Node Positioning', function () {
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
          var pCollection = Pablo.circle().append(Pablo.rect()).append(Pablo.rect());
          pCollection.prepend(Pablo.ellipse({foo:'bar'}));

          expect(pCollection[0].childNodes.length).to.eql(3);
          expect(pCollection[0].childNodes[0] instanceof SVGEllipseElement).to.eql(true);
          expect(pCollection[0].childNodes[0].getAttribute('foo')).to.eql('bar');
        });

        it('.prepend(elementName, attributes) should prepend to a newly created element respective of the passed arguments', function () {
          var pCollection = Pablo.circle().append(Pablo.rect()).append(Pablo.rect());
          pCollection.prepend('ellipse', {foo:'bar'});

          expect(pCollection[0].childNodes.length).to.eql(3);
          expect(pCollection[0].childNodes[0] instanceof SVGEllipseElement).to.eql(true);
          expect(pCollection[0].childNodes[0].getAttribute('foo')).to.eql('bar');
        });
      });

      describe('.prependTo(elements, [attributes])', function () {
        it('.prependTo(element) should prepend the subject collection to the passed element', function () {
          var pCollection = Pablo.circle().append(Pablo.rect()).append(Pablo.rect());
          Pablo.ellipse({foo:'bar'}).prependTo(pCollection);

          expect(pCollection[0].childNodes.length).to.eql(3);
          expect(pCollection[0].childNodes[0] instanceof SVGEllipseElement).to.eql(true);
          expect(pCollection[0].childNodes[0].getAttribute('foo')).to.eql('bar');
        });

        it('.prependTo(elementName, attributes) should prepend the subject collection to the a newly created element respective of the passed arguments', function () {
          var pCollection = Pablo.circle();
          pCollection.prependTo('ellipse', {foo:'bar'});

          expect(pCollection[0].parentNode instanceof SVGEllipseElement).to.eql(true);
          expect(pCollection[0].parentNode.getAttribute('foo')).to.eql('bar');
        });
      });

      describe('.before(element)', function () {
        it('before(element)', function () {
          var pCollection = Pablo.rect().append(Pablo.circle()).append(Pablo.circle());
          Pablo(pCollection[0].childNodes).before(Pablo.ellipse({foo:'bar'}));

          notDone();

          expect(pCollection[0].childNodes.length).to.eql(4);
          expect(pCollection[0].childNodes[0] instanceof SVGEllipseElement).to.eql(true);
          expect(pCollection[0].childNodes[2] instanceof SVGEllipseElement).to.eql(true);
          expect(pCollection[0].childNodes[0].getAttribute('foo')).to.eql('bar');
          expect(pCollection[0].childNodes[2].getAttribute('foo')).to.eql('bar');
        });

        it('before(element, [attributes])', function () {
          var pCollection = Pablo.rect().append(Pablo.circle()).append(Pablo.circle());
          Pablo(pCollection[0].childNodes).before('ellipse', {foo: 'bar'});

          expect(pCollection[0].childNodes.length).to.eql(4);
          expect(pCollection[0].childNodes[0] instanceof SVGEllipseElement).to.eql(true);
          expect(pCollection[0].childNodes[2] instanceof SVGEllipseElement).to.eql(true);
          expect(pCollection[0].childNodes[0].getAttribute('foo')).to.eql('bar');
          expect(pCollection[0].childNodes[2].getAttribute('foo')).to.eql('bar');
        });
      });

      describe('.after(element)', function () {
        it('after(element)', function () {
          var pCollection = Pablo.rect().append(Pablo.circle()).append(Pablo.circle());
          Pablo(pCollection[0].childNodes).after(Pablo.ellipse({foo:'bar'}));

          notDone();

          expect(pCollection[0].childNodes.length).to.eql(4);
          expect(pCollection[0].childNodes[1] instanceof SVGEllipseElement).to.eql(true);
          expect(pCollection[0].childNodes[3] instanceof SVGEllipseElement).to.eql(true);
          expect(pCollection[0].childNodes[1].getAttribute('foo')).to.eql('bar');
          expect(pCollection[0].childNodes[3].getAttribute('foo')).to.eql('bar');
        });

        it('after(element, [attributes])', function () {
          var pCollection = Pablo.rect().append(Pablo.circle()).append(Pablo.circle());
          Pablo(pCollection[0].childNodes).after('ellipse', {foo:'bar'});

          expect(pCollection[0].childNodes.length).to.eql(4);
          expect(pCollection[0].childNodes[1] instanceof SVGEllipseElement).to.eql(true);
          expect(pCollection[0].childNodes[3] instanceof SVGEllipseElement).to.eql(true);
          expect(pCollection[0].childNodes[1].getAttribute('foo')).to.eql('bar');
          expect(pCollection[0].childNodes[3].getAttribute('foo')).to.eql('bar');
        });
      });

      describe('.insertBefore(element)', function () {
        it('insertBefore(element)', function () {
          var pCollection = Pablo.rect().append(Pablo.circle()).append(Pablo.circle());
          Pablo.ellipse({foo:'bar'}).insertBefore(pCollection[0].childNodes);

          notDone();

          expect(pCollection[0].childNodes.length).to.eql(4);
          expect(pCollection[0].childNodes[0] instanceof SVGEllipseElement).to.eql(true);
          expect(pCollection[0].childNodes[2] instanceof SVGEllipseElement).to.eql(true);
          expect(pCollection[0].childNodes[0].getAttribute('foo')).to.eql('bar');
          expect(pCollection[0].childNodes[2].getAttribute('foo')).to.eql('bar');
        });

        it('insertBefore(element, [attributes])', function () {
          var pCollection = Pablo.rect().append(Pablo.circle()).append(Pablo.circle());
          Pablo('ellipse', {foo:'bar'}).insertBefore(pCollection[0].childNodes);

          notDone();

          expect(pCollection[0].childNodes.length).to.eql(4);
          expect(pCollection[0].childNodes[0] instanceof SVGEllipseElement).to.eql(true);
          expect(pCollection[0].childNodes[2] instanceof SVGEllipseElement).to.eql(true);
          expect(pCollection[0].childNodes[0].getAttribute('foo')).to.eql('bar');
          expect(pCollection[0].childNodes[2].getAttribute('foo')).to.eql('bar');
        });
      });

      describe('.insertAfter(element)', function () {
        it('insertAfter(element)', function () {
          var pCollection = Pablo.rect().append(Pablo.circle()).append(Pablo.circle());
          Pablo.ellipse({foo:'bar'}).insertAfter(pCollection[0].childNodes);

          notDone();

          expect(pCollection[0].childNodes.length).to.eql(4);
          expect(pCollection[0].childNodes[1] instanceof SVGEllipseElement).to.eql(true);
          expect(pCollection[0].childNodes[3] instanceof SVGEllipseElement).to.eql(true);
          expect(pCollection[0].childNodes[1].getAttribute('foo')).to.eql('bar');
          expect(pCollection[0].childNodes[3].getAttribute('foo')).to.eql('bar');
        });

        it('insertAfter(element, [attributes])', function () {
          var pCollection = Pablo.rect().append(Pablo.circle()).append(Pablo.circle());
          Pablo('ellipse', {foo:'bar'}).insertAfter(pCollection[0].childNodes);

          notDone();

          expect(pCollection[0].childNodes.length).to.eql(4);
          expect(pCollection[0].childNodes[1] instanceof SVGEllipseElement).to.eql(true);
          expect(pCollection[0].childNodes[3] instanceof SVGEllipseElement).to.eql(true);
          expect(pCollection[0].childNodes[1].getAttribute('foo')).to.eql('bar');
          expect(pCollection[0].childNodes[3].getAttribute('foo')).to.eql('bar');
        });
      });
    });

    describe('Node Traversal', function () {
      describe('.children([filterBy])', function () {
        it('should return the children of the subject Pablo collection', function () {
          var children = Pablo('#test-subjects').children();

          expect(children.length).to.eql(3);
          expect(children instanceof Pablo.Collection).to.eql(true);
          expect(children[0].id).to.eql('test-subject-a');
          expect(children[1].id).to.eql('test-subject-b');
          expect(children[2].id).to.eql('test-subject-c');
        });

        it('should allow the returned children to be filtered by a selector', function () {
          var children = Pablo('#test-subjects').children('li[id="test-subject-b"]');

          expect(children.length).to.eql(1);
          expect(children instanceof Pablo.Collection).to.eql(true);
          expect(children[0].id).to.eql('test-subject-b');
        });

        it('should allow the returned children to be filtered by a function', function () {
          var children = Pablo('#test-subjects').children(function () {

          });

          notDone();

          expect(children.length).to.eql(1);
          expect(children instanceof Pablo.Collection).to.eql(true);
          expect(children[0].id).to.eql('test-subject-b');
        });
      });

      describe('.parent()', function () {
        it('.parent()', function () {
          var child = document.getElementById('test-subject-a');
          expect(Pablo(child).parent()[0].id).to.eql('test-subjects');
        });
      });

      describe('.siblings()', function () {
        it('.siblings()', function () {
          var aSibling = document.getElementById('test-subject-a'),
              siblings = Pablo(aSibling).siblings();

          expect(siblings.length).to.eql(2);
          expect(siblings[0].id).to.eql('test-subject-b');
          expect(siblings[1].id).to.eql('test-subject-c');
        });
      });

      describe('.prev()', function () {
        it('.prev()', function () {
          var b = Pablo('#test-subject-b');

          expect(b.prev()[0].id).to.eql('test-subject-a');
        });
      });

      describe('.next()', function () {
        it('.next()', function () {
          var b = Pablo('#test-subject-b');

          expect(b.next()[0].id).to.eql('test-subject-c');
        });
      });

      describe('.find()', function () {
        it('.find(selectors)', function () {
          notDone();
        });
      });

      describe('.get()', function () {
        it('.get(index)', function () {
          var pCollection = Pablo('#test-subjects').children(),
              chosenOne   = pCollection.get(1);

          expect(chosenOne instanceof Pablo.Collection).to.eql(false);
          expect(chosenOne.id).to.eql('test-subject-b')
        });
      });

      describe('.eq()', function () {
        it('.eq(index)', function () {
          var pCollection = Pablo('#test-subjects').children(),
              chosenOne   = pCollection.eq(1);

          expect(chosenOne instanceof Pablo.Collection).to.eql(true);
          expect(chosenOne[0].id).to.eql('test-subject-b')
        });
      });

      describe('.first()', function () {
        it('.first()', function () {
          var first = Pablo('#test-subjects').children().first();

          expect(first[0].id).to.eql('test-subject-a');
        });
      });

      describe('.last()', function () {
        it('.last()', function () {
          var first = Pablo('#test-subjects').children().last();

          expect(first[0].id).to.eql('test-subject-c');
        });
      });
    });

    describe('Node Properties', function () {
      describe('.attr([attribute], [attributeValue])', function () {
        it('.attr()', function () {
          notDone();
        });

        it('.attr(attributeName)', function () {
          notDone();
        });

        it('.attr(attributeName, attributeValue)', function () {
          notDone();
        });

        it('.attr(attributes)', function () {
          notDone();
        });

        it('.attr(attributes) attribute value as function', function () {
          notDone();
        });

        it('.attr(attributes) attribute value as an Array', function () {
          notDone();
        });
      });

      describe('.removeAttr()', function () {
        it('.removeAttr(attributeName)', function () {
          notDone();
        });
      });

      describe('.transform()', function () {
        it('.transform(functionName, value)', function () {
          notDone();
        });
      });

      describe('.css()', function () {
        it('.css(property)', function () {
          notDone();
        });

        it('.css(property, value)', function () {
          notDone();
        });

        it('.css(styles)', function () {
          notDone();
        });
      });

      describe('.cssPrefix()', function () {
        it('.cssPrefix(prop, val)', function () {
          notDone();
        });

        it('.cssPrefix(styles)', function () {
          notDone();
        });
      });

      describe('.addClass()', function () {
        it('.addClass(className)', function () {
          notDone();
        });
      });

      describe('.removeClass()', function () {
        it('.removeClass(className)', function () {
          notDone();
        });
      });

      describe('.hasClass', function () {
        it('.hasClass(className)', function () {
          notDone();
        });
      });

      describe('.toggleClass()', function () {
        it('.toggleClass(className)', function () {
          notDone();
        });
      });

      describe('.link()', function () {
        it('.link()', function () {
          notDone();
        });

        it('.link(url)', function () {
          notDone();
        });
      });

      describe('.content()', function () {
        // suggest content renamed text
        it('.content()', function () {
          notDone();
        });

        it('.content(text)', function () {
          notDone();
        });
      });

      describe('.empty()', function () {
        it('.empty()', function () {
          notDone();
        });
      });

      describe('.remove()', function () {
        it('.remove()', function () {
          notDone();
        });
      });
    });

    describe('Collection manipulation', function () {
      describe('.toArray()', function () {
        it('.toArray()', function () {
          notDone();
        });
      });

      describe('.size()', function () {
        it('.size()', function () {
          notDone();
        });
      });

      describe('.push()', function () {
        it('.push(elements)', function () {
          notDone();
        });
      });

      describe('.add()', function () {
        it('.add(elements)', function () {
          // alias for push
          notDone();
        });
      });

      describe('.concat()', function () {
        it('.concat(elements)', function () {
          // alias for push
          notDone();
        });
      });

      describe('.unshift()', function () {
        it('.unshift(elements)', function () {
          notDone();
        });
      });

      describe('.pop()', function () {
        it('.pop()', function () {
          notDone();
        });
      });

      describe('.shift()', function () {
        it('.shift()', function () {
          notDone();
        });
      });

      describe('.slice()', function () {
        it('.slice(begin)', function () {
          notDone();
        });

        it('.slice(begin, [end]', function () {
          notDone();
        });
      });
    });
    
    describe('Collection iteration', function () {
      describe('.each()', function () {
        it('.each(callback)', function () {
          notDone();
        });
      });

      describe('.map()', function () {
        it('.map(iterator)', function () {
          notDone();
        });
      });

      describe('.select()', function () {
        it('.select(function)', function () {
          notDone();
        });
      });
    });

    describe('Misc', function () {
      describe('.clone()', function () {
        it('.clone([isDeep])', function () {
          notDone();
        });
      });

      describe('.duplicate()', function () {
        it('.duplicate([repeat])', function () {
          notDone();
        });
      });
    });
  });

  describe('Events', function () {
    describe('.on()', function () {
      it('.on(type, listener', function () {
        notDone();
      });

      it('.on(type, listener, [useCapture]', function () {
        notDone();
      });
    });

    describe('.off()', function () {
      it('.off(type, listener', function () {
        notDone();
      });

      it('.off(type, listener, [useCapture]', function () {
        notDone();
      });
    });

    describe('.one()', function () {
      it('.one(type, listener', function () {
        notDone();
      });

      it('.one(type, listener, [useCapture]', function () {
        notDone();
      });
    });

    describe('.oneEach()', function () {
      it('.oneEach(type, listener', function () {
        notDone();
      });

      it('.oneEach(type, listener, [useCapture]', function () {
        notDone();
      });
    });
  });

  describe('Pablo.ELEMENT_NAME([attributes]) shortcuts', function () {
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