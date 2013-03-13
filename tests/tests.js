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
        it('should return a Pablo collection', function () {
          expect(Pablo.circle().prependTo(Pablo.rect()) instanceof Pablo.Collection).to.eql(true);
        });

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

          expect(pCollection[0].childNodes.length).to.eql(4);
          expect(pCollection[0].childNodes[0] instanceof SVGEllipseElement).to.eql(true);
          expect(pCollection[0].childNodes[2] instanceof SVGEllipseElement).to.eql(true);
          expect(pCollection[0].childNodes[0].getAttribute('foo')).to.eql('bar');
          expect(pCollection[0].childNodes[2].getAttribute('foo')).to.eql('bar');
        });

        it('insertBefore(element, [attributes])', function () {
          var pCollection = Pablo.rect().append(Pablo.circle()).append(Pablo.circle());
          Pablo('ellipse', {foo:'bar'}).insertBefore(pCollection[0].childNodes);

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

          expect(pCollection[0].childNodes.length).to.eql(4);
          expect(pCollection[0].childNodes[1] instanceof SVGEllipseElement).to.eql(true);
          expect(pCollection[0].childNodes[3] instanceof SVGEllipseElement).to.eql(true);
          expect(pCollection[0].childNodes[1].getAttribute('foo')).to.eql('bar');
          expect(pCollection[0].childNodes[3].getAttribute('foo')).to.eql('bar');
        });

        it('insertAfter(element, [attributes])', function () {
          var pCollection = Pablo.rect().append(Pablo.circle()).append(Pablo.circle());
          Pablo('ellipse', {foo:'bar'}).insertAfter(pCollection[0].childNodes);

          expect(pCollection[0].childNodes.length).to.eql(4);
          expect(pCollection[0].childNodes[1] instanceof SVGEllipseElement).to.eql(true);
          expect(pCollection[0].childNodes[3] instanceof SVGEllipseElement).to.eql(true);
          expect(pCollection[0].childNodes[1].getAttribute('foo')).to.eql('bar');
          expect(pCollection[0].childNodes[3].getAttribute('foo')).to.eql('bar');
        });
      });

      describe('.empty()', function () {
        it('.empty()', function () {
          var saved   = document.querySelectorAll('#test-subjects li'),
              subject = Pablo('#test-subjects'),
              cLength;

          subject.empty();
          cLength = subject[0].childNodes.length;

          document.getElementById('test-subjects').appendChild(saved[0]);
          document.getElementById('test-subjects').appendChild(saved[1]);
          document.getElementById('test-subjects').appendChild(saved[2]);

          expect(cLength).to.eql(0);
        });
      });

      describe('.remove()', function () {
        it('.remove()', function () {
          var saved   = document.querySelectorAll('#test-subjects')[0],
              subject = Pablo('#test-subjects'),
              length;

          subject.remove();
        
          length = document.querySelectorAll('#test-subjects').length;

          document.body.appendChild(saved, document.getElementById('mocha'));

          expect(length).to.eql(0);
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
          var children = Pablo('#test-subjects').children(function (item, i) {
            if (i != 1) {
              return true;
            }
          });

          expect(children.length).to.eql(2);
          expect(children instanceof Pablo.Collection).to.eql(true);
          expect(children[0].id).to.eql('test-subject-a');
          expect(children[1].id).to.eql('test-subject-c');
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
          var pCollection = Pablo('#test-subjects').find('li');

          expect(pCollection instanceof Pablo.Collection).to.eql(true);
          expect(pCollection.length).to.eql(3);
          expect(pCollection[0].id).to.eql('test-subject-a');
          expect(pCollection[1].id).to.eql('test-subject-b');
          expect(pCollection[2].id).to.eql('test-subject-c');
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
          expect(Pablo('#test-subjects').attr()).to.eql({
            id: "test-subjects",
            style: "display: none"
          });
        });

        it('.attr(attributeName)', function () {
          expect(Pablo('#test-subjects').attr('id')).to.eql('test-subjects')
        });

        it('.attr(attributeName, attributeValue)', function () {
          var subject = Pablo('#test-subjects');
          subject.attr('foo', 'bar');

          expect(subject[0].getAttribute('foo')).to.eql('bar');

          subject[0].removeAttribute('foo');
        });

        it('.attr(attributes)', function () {
          var subject = Pablo('#test-subjects');

          subject.attr({
            'foo':'bar',
            'zoo':'zar'
          });

          expect(subject[0].getAttribute('foo')).to.eql('bar');
          expect(subject[0].getAttribute('zoo')).to.eql('zar');

          subject[0].removeAttribute('foo');
          subject[0].removeAttribute('zoo');
        });

        it('.attr(attributes) attribute value as function', function () {
          var subject = Pablo('#test-subjects');

          subject.attr({
            foo: function () {
              return 'bar';
            }
          });

          subject.attr('zip', function () {
            return 'zop';
          });

          expect(subject[0].getAttribute('foo')).to.eql('bar');
          expect(subject[0].getAttribute('zip')).to.eql('zop');
          subject[0].removeAttribute('foo');
          subject[0].removeAttribute('zip');
        });

        it('.attr(attributes) attribute value as an Array', function () {
          var subject = Pablo('#test-subjects li');

          subject.attr({
            foo: ['a', 'b', 'c', 'd']
          });

          subject.attr('bar', ['d', 'e', 'f']);

          expect(subject[0].getAttribute('foo')).to.eql('a');
          expect(subject[1].getAttribute('foo')).to.eql('b');
          expect(subject[2].getAttribute('foo')).to.eql('c');
          expect(subject[0].getAttribute('bar')).to.eql('d');
          expect(subject[1].getAttribute('bar')).to.eql('e');
          expect(subject[2].getAttribute('bar')).to.eql('f');

          subject[0].removeAttribute('foo');
          subject[1].removeAttribute('foo');
          subject[2].removeAttribute('foo');
          subject[0].removeAttribute('bar');
          subject[1].removeAttribute('bar');
          subject[2].removeAttribute('bar');
        });
      });

      describe('.removeAttr()', function () {
        it('.removeAttr(attributeName)', function () {
          var subject = Pablo('#test-subjects');

          subject[0].setAttribute('foo', 'bar');
          expect(subject[0].getAttribute('foo')).to.eql('bar');
          subject.removeAttr('foo');
          expect(subject[0].getAttribute('foo')).to.eql(null);
        });
      });

      describe('.transform()', function () {
        it('.transform(functionName, value)', function () {
          var pCollection = Pablo([Pablo.rect(), Pablo.rect()]);

          pCollection.transform('rotate', '45 50 50');

          expect(pCollection[0].getAttribute('transform')).to.eql('rotate(45 50 50)');
          expect(pCollection[1].getAttribute('transform')).to.eql('rotate(45 50 50)');
        });
      });

      describe('.css()', function () {
        it('.css(property)', function () {
          expect(Pablo('#test-subjects').css('display')).to.eql('none');
        });

        it('.css(property, value)', function () {
          var subject = Pablo('#test-subjects');

          subject.css('font-size', '20px');

          expect(subject.css('font-size')).to.eql('20px');
          resetTestSubjectStyles();
        });

        it('.css(styles)', function () {
          var subject = Pablo('#test-subjects');

          subject.css({
            'font-size': '20px',
            'font-weight': 'bold'
          });

          expect(subject.css('font-size')).to.eql('20px');
          expect(subject.css('font-weight')).to.eql('bold');
          resetTestSubjectStyles();
        });
      });

      describe('.cssPrefix()', function () {
        it('.cssPrefix(prop, val)', function () {
          var subject = Pablo('#test-subjects'),
              appliedWithPrefix;

          subject.cssPrefix('transition', 'opacity 0.5s');
          appliedWithPrefix = !!(subject.css('-webkit-transition')  || 
                              subject.css('-moz-transition')        ||
                              subject.css('-webkit-transition')     ||
                              subject.css('-o-transition')          ||
                              subject.css('-ms-transition')         ||
                              subject.css('-khtml-transition'));

          expect(appliedWithPrefix).to.eql(true);

          resetTestSubjectStyles();
        });

        it('.cssPrefix(prop)', function () {
          var subject = Pablo('#test-subjects');
          subject.cssPrefix('transition', 'opacity 0.5s');
          expect(subject.cssPrefix('transition')).to.eql('opacity 0.5s');
        });

        it('.cssPrefix(styles)', function () {
          var subject = Pablo('#test-subjects'),
              appliedWithPrefix1,
              appliedWithPrefix2;

          subject.cssPrefix({
            'transform': 'rotate(180deg)',
            'transform-origin': '50%'
          });

          appliedWithPrefix1 = !!(subject.css('-webkit-transform') || 
                              subject.css('-moz-transform')        ||
                              subject.css('-webkit-transform')     ||
                              subject.css('-o-transform')          ||
                              subject.css('-ms-transform')         ||
                              subject.css('-khtml-transform'));

          appliedWithPrefix2 = !!(subject.css('-webkit-transform-origin') || 
                              subject.css('-moz-transform-origin')        ||
                              subject.css('-webkit-transform-origin')     ||
                              subject.css('-o-transform-origin')          ||
                              subject.css('-ms-transform-origin')         ||
                              subject.css('-khtml-transform-origin'));

          expect(appliedWithPrefix1).to.eql(true);
          expect(appliedWithPrefix2).to.eql(true);
        });
      });

      describe('.addClass()', function () {
        it('.addClass(className)', function () {
          var subject = Pablo('#test-subjects');

          subject.addClass('foo');

          expect(subject[0].getAttribute('class')).to.eql('foo');

          subject[0].removeAttribute('class');
        });
      });

      describe('.removeClass()', function () {
        it('.removeClass(className)', function () {
          var subject = Pablo('#test-subjects');

          subject[0].setAttribute('class', 'foo');
          expect(subject[0].getAttribute('class')).to.eql('foo');

          subject.removeClass('foo');

          expect(subject[0].getAttribute('class')).to.eql('');
          subject[0].removeAttribute('class');
        });
      });

      describe('.hasClass', function () {
        it('.hasClass(className)', function () {
          var subject = Pablo('#test-subjects');

          subject[0].setAttribute('class', 'foo');

          expect(Pablo(subject).hasClass('foo')).to.eql(true);
          expect(Pablo(subject).hasClass('bar')).to.eql(false);

          subject[0].removeAttribute('class');
        });
      });

      describe('.toggleClass()', function () {
        it('.toggleClass(className)', function () {
          var subject = Pablo('#test-subjects');

          subject[0].setAttribute('class', 'foo');

          expect(subject[0].getAttribute('class')).to.eql('foo');

          subject.toggleClass('foo');
          expect(subject[0].getAttribute('class')).to.eql('');

          subject.toggleClass('foo');
          expect(subject[0].getAttribute('class')).to.eql('foo');

          subject[0].removeAttribute('class');
        });
      });

      describe('.content()', function () {
        it('.content()', function () {
          var subject = Pablo(document.createElement('a'));

          subject[0].innerText = 'foo';

          expect(subject.content()).to.eql('foo');
        });

        it('.content(text)', function () {
          var subject = Pablo(document.createElement('a'));

          subject.content('foo');

          expect(subject[0].innerText).to.eql('foo');
        });
      });
    });

    describe('Collection manipulation', function () {
      describe('.toArray()', function () {
        it('.toArray()', function () {
          var pCollection = Pablo.a(),
              asArray     = pCollection.toArray();

          expect(asArray instanceof Array).to.eql(true);
          expect(asArray.css).to.eql(undefined);
        });
      });

      describe('.size()', function () {
        it('.size()', function () {
          var pCollection = Pablo('#test-subjects li');

          expect(pCollection.size() === pCollection.length)
            .to.eql(true);
        });
      });

      describe('.push() alias .add()', function () {
        it('.push(elements)/.add(elements) should mutate the Pablo Collection and return itself', function () {
          var pCollection = Pablo('#test-subjects li'),
              returned    = pCollection.push([Pablo.rect(), Pablo.circle()]);

          expect(returned).to.eql(pCollection);
          expect(pCollection.length).to.eql(5);
          expect(pCollection[0].id).to.eql('test-subject-a');
          expect(pCollection[1].id).to.eql('test-subject-b');
          expect(pCollection[2].id).to.eql('test-subject-c');
          expect(pCollection[3] instanceof SVGRectElement).to.eql(true);
          expect(pCollection[4] instanceof SVGCircleElement).to.eql(true);
        });
        it('.push(elements...)/.add(elements...) as argument list should mutate the Pablo Collection and return itself', function () {
          var pCollection = Pablo('#test-subjects li'),
              returned    = pCollection.push(Pablo.rect(), Pablo.circle());

          expect(returned).to.eql(pCollection);
          expect(pCollection.length).to.eql(5);
          expect(pCollection[0].id).to.eql('test-subject-a');
          expect(pCollection[1].id).to.eql('test-subject-b');
          expect(pCollection[2].id).to.eql('test-subject-c');
          expect(pCollection[3] instanceof SVGRectElement).to.eql(true);
          expect(pCollection[4] instanceof SVGCircleElement).to.eql(true);
        });
      });

      describe('.concat()', function () {
        it('.concat(elements) should return a Pablo Collection and maintain the original', function () {
          var pCollection = Pablo('#test-subjects li'),
              returned    = pCollection.concat([Pablo.rect(), Pablo.circle()]);

          expect(pCollection.length).to.eql(3);
          expect(returned.length).to.eql(5);
          expect(returned[0].id).to.eql('test-subject-a');
          expect(returned[1].id).to.eql('test-subject-b');
          expect(returned[2].id).to.eql('test-subject-c');
          expect(returned[3] instanceof SVGRectElement).to.eql(true);
          expect(returned[4] instanceof SVGCircleElement).to.eql(true);
        });

        it('.concat(elements...) as argument list should return a Pablo Collection and maintain the original', function () {
          var pCollection = Pablo('#test-subjects li'),
              returned    = pCollection.concat(Pablo.rect(), Pablo.circle());

          expect(pCollection.length).to.eql(3);
          expect(returned.length).to.eql(5);
          expect(returned[0].id).to.eql('test-subject-a');
          expect(returned[1].id).to.eql('test-subject-b');
          expect(returned[2].id).to.eql('test-subject-c');
          expect(returned[3] instanceof SVGRectElement).to.eql(true);
          expect(returned[4] instanceof SVGCircleElement).to.eql(true);
        });
      });

      describe('.unshift()', function () {
        it('.unshift(elements) should mutate the Pablo Collection and return itself', function () {
          var pCollection = Pablo('#test-subjects li'),
              returned    = pCollection.unshift([Pablo.rect(), Pablo.circle()]);

          expect(returned).to.eql(pCollection);
          expect(pCollection.length).to.eql(5);
          expect(pCollection[0] instanceof SVGRectElement).to.eql(true);
          expect(pCollection[1] instanceof SVGCircleElement).to.eql(true);
          expect(pCollection[2].id).to.eql('test-subject-a');
          expect(pCollection[3].id).to.eql('test-subject-b');
          expect(pCollection[4].id).to.eql('test-subject-c');
        });

        it('.unshift(elements...) as argument list should mutate the Pablo Collection and return itself', function () {
          var pCollection = Pablo('#test-subjects li'),
              returned    = pCollection.unshift(Pablo.rect(), Pablo.circle());

          expect(returned).to.eql(pCollection);
          expect(pCollection.length).to.eql(5);
          expect(pCollection[0] instanceof SVGRectElement).to.eql(true);
          expect(pCollection[1] instanceof SVGCircleElement).to.eql(true);
          expect(pCollection[2].id).to.eql('test-subject-a');
          expect(pCollection[3].id).to.eql('test-subject-b');
          expect(pCollection[4].id).to.eql('test-subject-c');
        });
      });

      describe('.pop()', function () {
        it('.pop() should returned the last element in a Pablo Collection and mutate the subject collection', function () {
          var pCollection = Pablo('#test-subjects li'),
              popped      = pCollection.pop();

          expect(pCollection.length).to.eql(2);
          expect(pCollection[0].id).to.eql('test-subject-a');
          expect(pCollection[1].id).to.eql('test-subject-b');
          expect(popped[0].id).to.eql('test-subject-c');
        });
      });

      describe('.shift()', function () {
        it('.shift() should return and mutate the subject Pablo Collection', function () {
          var pCollection = Pablo('#test-subjects li'),
              shifted     = pCollection.shift();

          expect(pCollection.length).to.eql(2);
          expect(pCollection[0].id).to.eql('test-subject-b');
          expect(pCollection[1].id).to.eql('test-subject-c');
          expect(shifted[0].id).to.eql('test-subject-a');
        });
      });

      describe('.slice()', function () {
        it('.slice(begin) should return a fresh Pablo Collection and maintain the old one', function () {
          var pCollection = Pablo('#test-subjects li'),
              newCopy     = pCollection.slice(1);

          expect(pCollection.length).to.eql(3);
          expect(newCopy.length).to.eql(2);
          expect(newCopy[0].id).to.eql('test-subject-b');
          expect(newCopy[1].id).to.eql('test-subject-c');
        });

        it('.slice(begin, [end]) should return a fresh Pablo Collection and maintain the old one', function () {
          var pCollection = Pablo('#test-subjects li'),
              newCopy     = pCollection.slice(0,2);

          expect(pCollection.length).to.eql(3);
          expect(newCopy.length).to.eql(2);
          expect(newCopy[0].id).to.eql('test-subject-a');
          expect(newCopy[1].id).to.eql('test-subject-b');
        });
      });
    });
    
    describe('Collection iteration', function () {
      describe('.each()', function () {
        it('.each(callback)', function () {
          var pCollection      = Pablo([Pablo.rect(), Pablo.circle(), Pablo.a()]),
              iterationIndices = [],
              pabloItems       = [];

          pCollection.each(function (item, i) {
            iterationIndices.push(i);
            pabloItems.push(item);
          });

          expect(pabloItems[0] instanceof SVGRectElement).to.eql(true);
          expect(pabloItems[1] instanceof SVGCircleElement).to.eql(true);
          expect(pabloItems[2] instanceof SVGAElement).to.eql(true);
          expect(iterationIndices[0]).to.eql(0);
          expect(iterationIndices[1]).to.eql(1);
          expect(iterationIndices[2]).to.eql(2);
        });
        it('.each(callback, context)', function () {
          var pCollection      = Pablo([Pablo.rect(), Pablo.circle(), Pablo.a()]),
              iterationIndices = [],
              pabloItems       = [],
              context          = {foo:'bar'},
              contextWasCorrect;

          pCollection.each(function (item, i) {
            iterationIndices.push(i);
            pabloItems.push(item);
            if (this.foo === 'bar') {
              contextWasCorrect = true;
            }
          }, context);
          
          expect(pabloItems[0] instanceof SVGRectElement).to.eql(true);
          expect(pabloItems[1] instanceof SVGCircleElement).to.eql(true);
          expect(pabloItems[2] instanceof SVGAElement).to.eql(true);
          expect(iterationIndices[0]).to.eql(0);
          expect(iterationIndices[1]).to.eql(1);
          expect(iterationIndices[2]).to.eql(2);
          expect(contextWasCorrect).to.eql(true);
        });
      });

      describe('.map()', function () {
        it('.map(iterator)', function () {
          var mapped = Pablo([Pablo.rect(), Pablo.circle()]).map(function (item, i) {
            return item;
          });

          expect(mapped[0] instanceof SVGRectElement).to.eql(true);
          expect(mapped[1] instanceof SVGCircleElement).to.eql(true);
        });

        it('.map(iterator) within the map callback; returning a Pablo collection of 2 or more elements should have both in the returned Pablo collection', function () {
          var context = {foo:'bar'},
              mapped = Pablo([Pablo.rect(), Pablo.circle()]).map(function (item, i) {
                return Pablo([Pablo.ellipse(), Pablo.a()]);
              }, context);

          expect(mapped[0] instanceof SVGEllipseElement).to.eql(true);
          expect(mapped[1] instanceof SVGAElement).to.eql(true);
          expect(mapped[2] instanceof SVGEllipseElement).to.eql(true);
          expect(mapped[3] instanceof SVGAElement).to.eql(true);
        });

        it('.map(iterator, context)', function () {
          var contextWasCorrect,
              context = {foo:'bar'},
              mapped = Pablo([Pablo.rect(), Pablo.circle()]).map(function (item, i) {
                if (this.foo === 'bar') {
                  contextWasCorrect = true;
                }
                return item;
              }, context);

          expect(mapped[0] instanceof SVGRectElement).to.eql(true);
          expect(mapped[1] instanceof SVGCircleElement).to.eql(true);
          expect(contextWasCorrect).to.eql(true);
        });
      });

      describe('.find()', function () {
        it('.find(selectors)', function () {
          var pCollection = Pablo.find('#test-subjects li');

          expect(pCollection.length).to.eql(3);
          expect(pCollection[0].id).to.eql('test-subject-a');
          expect(pCollection[1].id).to.eql('test-subject-b');
          expect(pCollection[2].id).to.eql('test-subject-c');
        });

        it('.find(selectors, context) context as Pablo object', function () {
          var pCollection = Pablo.find('li', Pablo('#test-subjects'));

          expect(pCollection.length).to.eql(3);
          expect(pCollection[0].id).to.eql('test-subject-a');
          expect(pCollection[1].id).to.eql('test-subject-b');
          expect(pCollection[2].id).to.eql('test-subject-c');
        });

        it('.find(selectors, context) context as selector', function () {
          var pCollection = Pablo.find('li', '#test-subjects');

          expect(pCollection.length).to.eql(3);
          expect(pCollection[0].id).to.eql('test-subject-a');
          expect(pCollection[1].id).to.eql('test-subject-b');
          expect(pCollection[2].id).to.eql('test-subject-c');
        });

        it('.find(selectors, context) context as DOM Element', function () {
          var pCollection = Pablo.find('li', Pablo('#test-subjects')[0]);

          expect(pCollection.length).to.eql(3);
          expect(pCollection[0].id).to.eql('test-subject-a');
          expect(pCollection[1].id).to.eql('test-subject-b');
          expect(pCollection[2].id).to.eql('test-subject-c');
        });
      });
    });

    describe('Misc', function () {
      describe('.clone()', function () {
        it('.clone()', function () {
          var original = Pablo.rect({foo: 'bar'}),
              clone    = original.clone();

          expect(clone instanceof Pablo.Collection).to.eql(true);
          expect(clone[0] instanceof SVGRectElement).to.eql(true);
          expect(clone[0].getAttribute('foo')).to.eql('bar');
        });

        it('.clone([isDeep])', function () {
          var pCollection = Pablo.rect(),
              clone;

          pCollection.ellipse().ellipse().ellipse({foo:'bar'});

          clone = pCollection.clone(true);
          expect(clone).to.eql(pCollection);
        });
      });

      describe('.duplicate()', function () {
        it('.duplicate()', function () {
          var pCollection = Pablo.rect();

          pCollection.ellipse({foo: 'bar'});

          pCollection.duplicate();

          expect(pCollection.length).to.eql(2);
          expect(pCollection[0] instanceof SVGRectElement).to.eql(true);
          expect(pCollection[0].firstChild instanceof SVGEllipseElement).to.eql(true);
          expect(pCollection[0].firstChild.getAttribute('foo')).to.eql('bar');
          expect(pCollection[1] instanceof SVGRectElement).to.eql(true);
          expect(pCollection[1].firstChild instanceof SVGEllipseElement).to.eql(true);
          expect(pCollection[1].firstChild.getAttribute('foo')).to.eql('bar');
        });

        it('.duplicate([repeat])', function () {
          var pCollection = Pablo.rect();

          pCollection.ellipse({foo: 'bar'});

          pCollection.duplicate(2);

          expect(pCollection.length).to.eql(3);
          expect(pCollection[0] instanceof SVGRectElement).to.eql(true);
          expect(pCollection[0].firstChild instanceof SVGEllipseElement).to.eql(true);
          expect(pCollection[0].firstChild.getAttribute('foo')).to.eql('bar');
          expect(pCollection[1] instanceof SVGRectElement).to.eql(true);
          expect(pCollection[1].firstChild instanceof SVGEllipseElement).to.eql(true);
          expect(pCollection[1].firstChild.getAttribute('foo')).to.eql('bar');
          expect(pCollection[2] instanceof SVGRectElement).to.eql(true);
          expect(pCollection[2].firstChild instanceof SVGEllipseElement).to.eql(true);
          expect(pCollection[2].firstChild.getAttribute('foo')).to.eql('bar');
        });
      });

      describe('.some() alias .is()', function () {
        it('some()/.is()', function () {
          notDone();
        });
      });
    });
  });

  describe('Data', function () {
    describe('data()', function () {
      it('data(key)', function () {
        var subject = Pablo.rect();
        subject.data('foo', 'bar');
        expect(subject.data('foo')).to.eql('bar');
      });

      it('data(key, [value])', function () {
        var subject = Pablo.rect();
        subject.data('foo', 'bar');
        expect(subject.data('foo')).to.eql('bar');
      });

      it('data(option)', function () {
        var subject = Pablo.rect();

        subject.data({
          foo: 'bar',
          fiz: 123
        });

        expect(subject.data('foo')).to.eql('bar');
        expect(subject.data('fiz')).to.eql(123);
      });
    });

    describe('removeData()', function () {
      it('removeData()', function () {
        var subject = Pablo.rect();
        subject.data('foo', 'bar');
        subject.data('fiz', 'buz');
        
        expect(subject.data('foo')).to.eql('bar');
        expect(subject.data('fiz')).to.eql('buz');

        subject.removeData();

        expect(subject.data('foo')).to.eql(undefined);
        expect(subject.data('fiz')).to.eql(undefined);
      });

      it('removeData([keys])', function () {
        var subject = Pablo.rect();
        subject.data('foo', 'bar');
        subject.data('fiz', 'buz');
        
        expect(subject.data('foo')).to.eql('bar');
        expect(subject.data('fiz')).to.eql('buz');

        subject.removeData('foo');

        expect(subject.data('foo')).to.eql(undefined);
        expect(subject.data('fiz')).to.eql('buz');
      });

      it('removeData([keys]) multiple keys', function () {
        var subject = Pablo.rect();

        subject.data('foo', 'bar');
        subject.data('fiz', 'buz');

        subject.removeData('foo fiz');
        expect(subject.data('foo')).to.eql(undefined);
        expect(subject.data('fiz')).to.eql(undefined);
      });
    });

    describe('detach()', function () {
      it('detach()', function () {
        var subject = Pablo.rect().append([Pablo.ellipse(), Pablo.line()]);

        subject.data('foo', 'bar');
        subject.children().eq(0).data('foo', 'bar');
        subject.children().eq(1).data('foo', 'bar');

        expect(subject.data('foo')).to.eql('bar');
        expect(subject.children().eq(0).data('foo')).to.eql('bar');
        expect(subject.children().eq(1).data('foo')).to.eql('bar');

        subject.detach();

        expect(subject.data('foo')).to.eql('bar');
        expect(subject.children().eq(0).data('foo')).to.eql('bar');
        expect(subject.children().eq(1).data('foo')).to.eql('bar');
      });
    });

    describe('remove()', function () {
      it('.remove() should remove data on the removed element and its children ', function () {        
        var subject = Pablo.rect().append([Pablo.ellipse(), Pablo.line()]);

        subject.data('foo', 'bar');
        subject.children().eq(0).data('foo', 'bar');
        subject.children().eq(1).data('foo', 'bar');

        expect(subject.data('foo')).to.eql('bar');
        expect(subject.children().eq(0).data('foo')).to.eql('bar');
        expect(subject.children().eq(1).data('foo')).to.eql('bar');

        subject.remove();

        expect(subject.data('foo')).to.eql(undefined);
        expect(subject.children().eq(0).data('foo')).to.eql(undefined);
        expect(subject.children().eq(1).data('foo')).to.eql(undefined);
      });
    });

    describe('empty()', function () {
      it('.empty() should remove data on the element\'s children', function () {
        var subject = Pablo.rect().append([Pablo.ellipse(), Pablo.line()]);

        subject.data('foo', 'bar');
        subject.children().eq(0).data('foo', 'bar');
        subject.children().eq(1).data('foo', 'bar');

        expect(subject.data('foo')).to.eql('bar');
        expect(subject.children().eq(0).data('foo')).to.eql('bar');
        expect(subject.children().eq(1).data('foo')).to.eql('bar');

        subject.empty();

        expect(subject.data('foo')).to.eql('bar');
        expect(subject.children().eq(0).data('foo')).to.eql(undefined);
        expect(subject.children().eq(1).data('foo')).to.eql(undefined);
      });
    });
  });

  describe('Events', function () {

    describe('.trigger()', function () {
      it('.trigger(eventNames)', function (done) {
        var subject = Pablo.rect();

        subject.on('click', function () {
          done();
        });

        subject.trigger('click');
      });

      it('.trigger(eventNames) with multiple event names', function (done) {
        var subject = Pablo.rect(),
            counter = 0;

        subject.on('click', function () {
          counter++;
          if (counter === 2) {
            done();
          }
        });

        subject.on('focus', function () {
          counter++;
          if (counter === 2) {
            done();
          }
        });

        subject.trigger('click focus');
      });
    });

    describe('.on()', function () {
      it('.on(type, listener)', function (done) {
        var subject = Pablo.rect();

        subject.on('click', function () {
          done();
        });

        subject.trigger('click');
      });

      it('.on(type, listener) multiple events assignments in one method call', function (done) {
        var subject   = Pablo.rect(),
            completed = 0;

        subject.on('click focus', function () {
          completed++;
          if (completed === 2) {
            done();
          }
        });

        subject.trigger('click');
        subject.trigger('focus');
      });

      it('.on(type, listener, [useCapture])', function (done) {
        notDone();
      });

      it('.on(type, listener, [useCapture]) multiple events assignments in one method call', function (done) {
        notDone();
      });
    });

    describe('.off()', function () {
      it('.off(type, listener)', function (done) {
        var subject = Pablo.rect();

        subject.on('click', failure);

        function failure () {
          done(new Error('The event should have been removed'));
        }

        subject.off('click', failure);

        subject.trigger('click');

        setTimeout(function () {
          done();
        }, 1600);
      });

      it('.off(type, listener, [useCapture])', function (done) {
        notDone();
      });
    });

    describe('.one()', function () {
      it('.one(type, listener)', function (done) {
        var subject = Pablo([Pablo.rect(), Pablo.ellipse()]),
            counter = 0;

        subject.one('click', function () {
          counter++;
        });

        subject.eq(0).trigger('click');
        subject.eq(1).trigger('click');
        subject.eq(0).trigger('click');
        subject.eq(1).trigger('click');

        setTimeout(function () {
          if (counter === 1) {
            done();
          } else {
            done(new Error());
          }
        })
      });

      it('.one(type, listener, [useCapture])', function (done) {
        notDone();
      });
    });

    describe('.oneEach()', function () {
      it('.oneEach(type, listener)', function (done) {
        var subject = Pablo([Pablo.rect(), Pablo.ellipse()]),
            counter = 0;

        subject.oneEach('click', function () {
          counter++;
        });

        subject.eq(0).trigger('click');
        subject.eq(1).trigger('click');
        subject.eq(0).trigger('click');
        subject.eq(1).trigger('click');

        setTimeout(function () {
          if (counter === 2) {
            done();
          } else {
            done(new Error());
          }
        })
      });

      it('.oneEach(type, listener, [useCapture]', function (done) {
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
  assert.ok(false, 'Test not implemented'.toUpperCase());
}

function resetTestSubjectStyles () {
  document.getElementById('test-subjects')
    .setAttribute('style', 'display:none;');
}