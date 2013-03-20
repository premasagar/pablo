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

    describe('Pablo.Collection', function () {
      it('.Collection', function () {
        expect(Pablo.Collection.prototype).to.eql(Pablo.fn);
        expect(Pablo.g() instanceof Pablo.Collection).to.eql(true);
      });
    });

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
        it('.before(element)', function () {
          var pCollection = Pablo.rect().append(Pablo.circle()).append(Pablo.circle());
          Pablo(pCollection[0].childNodes).before(Pablo.ellipse({foo:'bar'}));

          expect(pCollection[0].childNodes.length).to.eql(4);
          expect(pCollection[0].childNodes[0] instanceof SVGEllipseElement).to.eql(true);
          expect(pCollection[0].childNodes[2] instanceof SVGEllipseElement).to.eql(true);
          expect(pCollection[0].childNodes[0].getAttribute('foo')).to.eql('bar');
          expect(pCollection[0].childNodes[2].getAttribute('foo')).to.eql('bar');
        });

        it('.before(element, [attributes])', function () {
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
        it('.after(element)', function () {
          var pCollection = Pablo.rect().append(Pablo.circle()).append(Pablo.circle());
          Pablo(pCollection[0].childNodes).after(Pablo.ellipse({foo:'bar'}));

          expect(pCollection[0].childNodes.length).to.eql(4);
          expect(pCollection[0].childNodes[1] instanceof SVGEllipseElement).to.eql(true);
          expect(pCollection[0].childNodes[3] instanceof SVGEllipseElement).to.eql(true);
          expect(pCollection[0].childNodes[1].getAttribute('foo')).to.eql('bar');
          expect(pCollection[0].childNodes[3].getAttribute('foo')).to.eql('bar');
        });

        it('.after(element, [attributes])', function () {
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
        it('.insertBefore(element)', function () {
          var pCollection = Pablo.rect().append(Pablo.circle()).append(Pablo.circle());
          Pablo.ellipse({foo:'bar'}).insertBefore(pCollection[0].childNodes);

          expect(pCollection[0].childNodes.length).to.eql(4);
          expect(pCollection[0].childNodes[0] instanceof SVGEllipseElement).to.eql(true);
          expect(pCollection[0].childNodes[2] instanceof SVGEllipseElement).to.eql(true);
          expect(pCollection[0].childNodes[0].getAttribute('foo')).to.eql('bar');
          expect(pCollection[0].childNodes[2].getAttribute('foo')).to.eql('bar');
        });

        it('.insertBefore(element, [attributes])', function () {
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
        it('.insertAfter(element)', function () {
          var pCollection = Pablo.rect().append(Pablo.circle()).append(Pablo.circle());
          Pablo.ellipse({foo:'bar'}).insertAfter(pCollection[0].childNodes);

          expect(pCollection[0].childNodes.length).to.eql(4);
          expect(pCollection[0].childNodes[1] instanceof SVGEllipseElement).to.eql(true);
          expect(pCollection[0].childNodes[3] instanceof SVGEllipseElement).to.eql(true);
          expect(pCollection[0].childNodes[1].getAttribute('foo')).to.eql('bar');
          expect(pCollection[0].childNodes[3].getAttribute('foo')).to.eql('bar');
        });

        it('.insertAfter(element, [attributes])', function () {
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
        it('.parent() should return the parent element as a PabloCollection', function () {
          var child = document.getElementById('test-subject-a');
          expect(Pablo(child).parent()[0].id).to.eql('test-subjects');
          expect(Pablo(child).parent() instanceof Pablo.Collection).to.eql(true);
        });
      });

      describe('.parents()', function () {
        it('.parents() should return all ancestors of the PabloCollection as a PabloCollection ordered by closest to oldest', function () {
          var child     = Pablo('#test-subject-a'),
              ancestors = child.parents(),
              expected  = Pablo('html').add(Pablo('body')).add(Pablo('#test-subjects'));

          expected.reverse();

          expect(ancestors).to.eql(expected);
          expect(ancestors instanceof Pablo.Collection).to.eql(true);
        });
      });

      describe('.parentsSvg()', function () {
        it('.parentsSvg()', function () {
          var pCollection = Pablo.svg(),
              deepChild,
              svgParents;

          pCollection.circle().append('span', {});
          pCollection.firstChild().firstChild().append('a', {});
          deepChild = pCollection.find('a');

          svgParents = deepChild.parentsSvg();

          expect(svgParents[0] instanceof SVGCircleElement).to.eql(true);
          expect(svgParents[1] instanceof SVGSVGElement).to.eql(true);
        });
      });

      describe('.root()', function () {
        it('.root() should return the pablo wrapped <svg> root element of the Pablo collection.', function () {
          var pCollection = Pablo('div', {}),
              deepChild;

          pCollection.svg().circle().ellipse().g().rect().a();
          deepChild = pCollection.find('a');
          
          expect(deepChild.root()[0] instanceof SVGSVGElement).to.eql(true);
        });
      });

      describe('.viewport()', function () {
        it('.viewport()', function () {
          notDone();
        });
      });

      describe('.viewports()', function () {
        it('.viewports()', function () {
          notDone();
        });
      });

      describe('.owner()', function () {
        it('.owner() should return the closest <svg> ancestor element of the Pablo collection wrapped as a Pablo collection.', function () {
          var pCollection = Pablo('div', {}),
              deepChild;

          pCollection.svg().circle().svg({foo: 'bar'}).circle().g().a(),
          deepChild = pCollection.find('a');
          
          expect(deepChild.owner()[0].getAttribute('foo')).to.eql('bar');
        });
      });

      describe('.owners()', function () {
        it('.owners() should a pablo collection of the all <svg> ancestor element\'s of the Pablo collection from closest to furthest.', function () {
          var pCollection = Pablo('div', {}),
              deepChild;

          pCollection.svg({fiz: 'buz'}).circle().svg({foo: 'bar'}).circle().a(),
          deepChild = pCollection.find('a');
          
          expect(deepChild.owners()[0].getAttribute('foo')).to.eql('bar');
          expect(deepChild.owners()[1].getAttribute('fiz')).to.eql('buz');
        });
      });

      describe('.siblings()', function () {
        it('.siblings() should return the sibling elements as PabloCollections', function () {
          var aSibling = document.getElementById('test-subject-a'),
              siblings = Pablo(aSibling).siblings();

          expect(siblings.length).to.eql(2);
          expect(siblings instanceof Pablo.Collection).to.eql(true);
          expect(siblings[0].id).to.eql('test-subject-b');
          expect(siblings[1].id).to.eql('test-subject-c');
        });
      });

      describe('.nextSiblings()', function () {
        it('.nextSiblings() should return the next sibling elements of the PabloCollections as PabloCollections', function () {
          var pCollection = Pablo.rect().append([Pablo.a(),
                                                 Pablo.g(),
                                                 Pablo.ellipse(),
                                                 Pablo.circle()
                                                ]),
              siblings    = pCollection.children().eq(1).nextSiblings();

          expect(siblings.length).to.eql(2);
          expect(siblings instanceof Pablo.Collection).to.eql(true);
          expect(siblings[0] instanceof SVGEllipseElement).to.eql(true);
          expect(siblings[1] instanceof SVGCircleElement).to.eql(true);
        });
      });

      describe('.prevSiblings()', function () {
        it('.prevSiblings() should return the previous sibling elements of the PabloCollection as PabloCollections', function () {
          var pCollection = Pablo.rect().append([Pablo.a(),
                                                 Pablo.g(),
                                                 Pablo.ellipse(),
                                                 Pablo.circle()
                                                ]),
              siblings    = pCollection.children().eq(3).prevSiblings();

          siblings.reverse();

          expect(siblings.length).to.eql(3);
          expect(siblings instanceof Pablo.Collection).to.eql(true);
          expect(siblings[0] instanceof SVGAElement).to.eql(true);
          expect(siblings[1] instanceof SVGGElement).to.eql(true);
          expect(siblings[2] instanceof SVGEllipseElement).to.eql(true);
        });
      });

      describe('.prev()', function () {
        it('.prev() should return the element\'s previous sibling as a PabloCollection', function () {
          var b = Pablo('#test-subject-b');

          expect(b.prev()[0].id).to.eql('test-subject-a');
          expect(b.prev() instanceof Pablo.Collection).to.eql(true);
        });
      });

      describe('.next()', function () {
        it('.next() should return the element\'s next sibling as a PabloCollection', function () {
          var b = Pablo('#test-subject-b');

          expect(b.next()[0].id).to.eql('test-subject-c');
          expect(b.next() instanceof Pablo.Collection).to.eql(true);
        });
      });

      describe('.traverse()', function () {
        it('.traverse()', function () {
          notDone();
        });
      });

      describe('.find()', function () {
        it('.find(selectors) should return a PabloCollection representative of the matched argument', function () {
          var pCollection = Pablo('#test-subjects').find('li');

          expect(pCollection instanceof Pablo.Collection).to.eql(true);
          expect(pCollection.length).to.eql(3);
          expect(pCollection[0].id).to.eql('test-subject-a');
          expect(pCollection[1].id).to.eql('test-subject-b');
          expect(pCollection[2].id).to.eql('test-subject-c');
        });
      });

      describe('.get()', function () {
        it('.get(index) should return the SVGElement or HTMLElement of the specified index', function () {
          var pCollection = Pablo('#test-subjects').children(),
              chosenOne   = pCollection.get(1);

          expect(chosenOne instanceof Pablo.Collection).to.eql(false);
          expect(chosenOne.id).to.eql('test-subject-b')
        });
      });

      describe('.eq()', function () {
        it('.eq(index) should a PabloCollection of the specified index', function () {
          var pCollection = Pablo('#test-subjects').children(),
              chosenOne   = pCollection.eq(1);

          expect(chosenOne instanceof Pablo.Collection).to.eql(true);
          expect(chosenOne[0].id).to.eql('test-subject-b')
        });
      });

      describe('.first()', function () {
        it('.first() returns the first element in a PabloCollection as a PabloCollection', function () {
          var first = Pablo('#test-subjects').children().first();

          expect(first[0].id).to.eql('test-subject-a');
          expect(first instanceof Pablo.Collection).to.eql(true)
        });
      });

      describe('.last()', function () {
        it('.last() returns the last element in a PabloCollection as a PabloCollection', function () {
          var last = Pablo('#test-subjects').children().last();

          expect(last[0].id).to.eql('test-subject-c');
          expect(last instanceof Pablo.Collection).to.eql(true)
        });
      });

      describe('.firstChild()', function () {
        it('firstChild() should return a PabloCollection', function () {
          var pCollection = Pablo.rect().append([Pablo.a(), Pablo.g(), Pablo.rect()]),
              child;

          expect(pCollection.firstChild()[0] instanceof SVGAElement).to.eql(true);
        });
      });

      describe('.lastChild()', function () {
        it('lastChild() should return a PabloCollection', function () {
          var pCollection = Pablo.rect().append([Pablo.a(), Pablo.g(), Pablo.rect()]),
              child;

          expect(pCollection.lastChild()[0] instanceof SVGRectElement).to.eql(true);
        });
      });
    });

    describe('Node Properties', function () {
      describe('.attr([attribute], [attributeValue])', function () {
        it('.attr() should return a map of attributes of the element', function () {
          expect(Pablo('#test-subjects').attr()).to.eql({
            id: "test-subjects",
            style: "display: none"
          });
        });

        it('.attr(attributeName) should return the value of the specified attribute of the element', function () {
          expect(Pablo('#test-subjects').attr('id')).to.eql('test-subjects')
        });

        it('.attr(attributeName, attributeValue) should set the value of the specified attribute of the element', function () {
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
        it('.removeAttr(attributeName) should remove the specified attribute of the element', function () {
          var subject = Pablo('#test-subjects');

          subject[0].setAttribute('foo', 'bar');
          expect(subject[0].getAttribute('foo')).to.eql('bar');
          subject.removeAttr('foo');
          expect(subject[0].getAttribute('foo')).to.eql(null);
        });
      });

      describe('.transform()', function () {
        it('.transform(functionName, value) should add a transform attribute and value to the element', function () {
          var pCollection = Pablo([Pablo.rect(), Pablo.rect()]);

          pCollection.transform('rotate', '45 50 50');

          expect(pCollection[0].getAttribute('transform')).to.eql('rotate(45 50 50)');
          expect(pCollection[1].getAttribute('transform')).to.eql('rotate(45 50 50)');
        });
      });

      describe('.css()', function () {
        it('.css(property) should return the specified css property of the element', function () {
          expect(Pablo('#test-subjects').css('display')).to.eql('none');
        });

        it('.css(property, value) should set the specified css property of the element', function () {
          var subject = Pablo('#test-subjects');

          subject.css('font-size', '20px');

          expect(subject.css('font-size')).to.eql('20px');
          resetTestSubjectStyles();
        });

        it('.css(styles) should set the specified css properties of the element in relation to the styles map', function () {
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
        it('.cssPrefix(prop, val) should set and prefix the passed css property with a browser namespace', function () {
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

        it('.cssPrefix(prop) should return the value of the css property of the element', function () {
          var subject = Pablo('#test-subjects');
          subject.cssPrefix('transition', 'opacity 0.5s');
          expect(subject.cssPrefix('transition')).to.eql('opacity 0.5s');
        });

        it('.cssPrefix(styles) should set and prefix the css properties with a browser namespace in relation to the style map', function () {
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

      describe('.getValue()', function () {
        it('.getValue()', function () {
          notDone();
        });
      });

      describe('.addClass()', function () {
        it('.addClass(className) should set the class attribute on the element with the passed string', function () {
          var subject = Pablo('#test-subjects');

          subject.addClass('foo');

          expect(subject[0].getAttribute('class')).to.eql('foo');

          subject[0].removeAttribute('class');
        });
      });

      describe('.removeClass()', function () {
        it('.removeClass(className) should remove the class of the element matching the passed string', function () {
          var subject = Pablo('#test-subjects');

          subject[0].setAttribute('class', 'foo');
          expect(subject[0].getAttribute('class')).to.eql('foo');

          subject.removeClass('foo');

          expect(subject[0].getAttribute('class')).to.eql('');
          subject[0].removeAttribute('class');
        });
      });

      describe('.hasClass', function () {
        it('.hasClass(className) should return true or false based on if the element has that class name', function () {
          var subject = Pablo('#test-subjects');

          subject[0].setAttribute('class', 'foo');

          expect(Pablo(subject).hasClass('foo')).to.eql(true);
          expect(Pablo(subject).hasClass('bar')).to.eql(false);

          subject[0].removeAttribute('class');
        });
      });

      describe('.toggleClass()', function () {
        it('.toggleClass(className) should set the class on the element if it does not already have it and vice versa', function () {
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
        it('.content() should gets the innerText property of the element', function () {
          var subject = Pablo(document.createElement('a'));

          subject[0].innerText = 'foo';

          expect(subject.content()).to.eql('foo');
        });

        it('.content(text) should sets the innerText property of the element', function () {
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

      describe('.reverse()', function () {
        it('.reverse() should mutate the PabloCollection by reversing its element order', function () {
          var subject  = Pablo([Pablo.rect(), Pablo.ellipse(), Pablo.a()]),
              expected = Pablo([Pablo.a(), Pablo.ellipse(), Pablo.rect()]);

          subject.reverse();

          expect(subject).to.eql(expected);
        });
      });
    });
    
    describe('Collection iteration', function () {
      describe('.each()/.forEach()', function () {
        it('.each(callback)/.forEach(callback) should iterate over every element in the collection passing to a callback the element and an iterator', function () {
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
        it('.each(callback, context)/.forEach(callback, context) like above but the this property refers to the passed context', function () {
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
        it('.map(iterator) returns a new array comprising of the total returned elements from the iteration callback', function () {
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

        it('.map(iterator, context) like above but with the this property refering to the passed context', function () {
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
        it('.find(selectors) should return a PabloCollection representative of the matching selector matching the PabloCollection', function () {
          var pCollection = Pablo.find('#test-subjects li');

          expect(pCollection.length).to.eql(3);
          expect(pCollection[0].id).to.eql('test-subject-a');
          expect(pCollection[1].id).to.eql('test-subject-b');
          expect(pCollection[2].id).to.eql('test-subject-c');
        });

        it('.find(selectors, searchContext) like above but the with an additional search context as Pablo object', function () {
          var pCollection = Pablo.find('li', Pablo('#test-subjects'));

          expect(pCollection.length).to.eql(3);
          expect(pCollection[0].id).to.eql('test-subject-a');
          expect(pCollection[1].id).to.eql('test-subject-b');
          expect(pCollection[2].id).to.eql('test-subject-c');
        });

        it('.find(selectors, searchContext) like above but with an additional search context as selector', function () {
          var pCollection = Pablo.find('li', '#test-subjects');

          expect(pCollection.length).to.eql(3);
          expect(pCollection[0].id).to.eql('test-subject-a');
          expect(pCollection[1].id).to.eql('test-subject-b');
          expect(pCollection[2].id).to.eql('test-subject-c');
        });

        it('.find(selectors, searchContext) like above but with an additional search context as DOM Element', function () {
          var pCollection = Pablo.find('li', Pablo('#test-subjects')[0]);

          expect(pCollection.length).to.eql(3);
          expect(pCollection[0].id).to.eql('test-subject-a');
          expect(pCollection[1].id).to.eql('test-subject-b');
          expect(pCollection[2].id).to.eql('test-subject-c');
        });
      });

      describe('.sort()', function () {
        it('.sort(function) should sort the collection based on the negativity of the returned value callback iteration', function () {
          var unsorted = Pablo([Pablo.a({'n':2}), Pablo.a({'n':3}), Pablo.a({'n':1})]);

          unsorted.sort(function (a, b) {
            return parseInt(a.getAttribute('n')) - parseInt(b.getAttribute('n'));
          });

          expect(unsorted[0].getAttribute('n')).to.eql('1');
          expect(unsorted[1].getAttribute('n')).to.eql('2');
          expect(unsorted[2].getAttribute('n')).to.eql('3');
        });
      });

      describe('.pluck()', function () {
        it('.pluck(property) should return an array of values of default type attributes for each element in the collection', function () {
          var pCollection = Pablo([
                              Pablo.rect({foo: '123'}),
                              Pablo.ellipse({foo: '456'})
                            ]),
              arr = pCollection.pluck('foo');

          expect(arr[0]).to.eql('123');
          expect(arr[1]).to.eql('456');
        });

        it('.pluck(property, [attr]) should return an array of values of the type attributes for each element in the collection', function () {
          var pCollection = Pablo([
                              Pablo.rect({foo: '123'}),
                              Pablo.ellipse({foo: '456'})
                            ]),
              arr = pCollection.pluck('foo','attr');

          expect(arr[0]).to.eql('123');
          expect(arr[1]).to.eql('456');
        });

        it('.pluck(property, [prop]) like above but with the type being a property set on the object', function () {
          var pCollection = Pablo([Pablo.rect(), Pablo.ellipse()]),
              arr;
          
          pCollection[0].foo = '123';
          pCollection[1].foo = '456';

          arr = pCollection.pluck('foo', 'prop');

          expect(arr[0]).to.eql('123');
          expect(arr[1]).to.eql('456');
        });

        it('.pluck(property, [data]) like above but with the type being a pablo data value', function () {
          var pCollection = Pablo([Pablo.rect(), Pablo.ellipse()]),
              arr;

          pCollection.eq(0).data('foo', '123');
          pCollection.eq(1).data('foo', '456');

          arr = pCollection.pluck('foo', 'data');

          expect(arr[0]).to.eql('123');
          expect(arr[1]).to.eql('456');
        });

        it('.pluck(property, [css]) like above but with the type being a css rule', function () {
          var pCollection = Pablo([
                              Pablo('span', {style: 'display: block'}),
                              Pablo('span', {style: 'display: inline'})
                            ]),
              arr;

          arr = pCollection.pluck('display', 'css');

          expect(arr[0]).to.eql('block');
          expect(arr[1]).to.eql('inline');
        });

        it('.pluck(property, [cssPrefix]) like above but with the type being a prefixed css rule', function () {
          var pCollection = Pablo([Pablo.rect(), Pablo.ellipse()]),
              arr;

          pCollection.eq(0).cssPrefix('transition', 'opacity 0.1s');
          pCollection.eq(1).cssPrefix('transition', 'opacity 1s');
          
          arr = pCollection.pluck('transition', 'cssPrefix');

          expect(arr[0]).to.eql('opacity 0.1s');
          expect(arr[1]).to.eql('opacity 1s');
        });
      });

      describe('.select()', function () {
        it('.select(function) should return a new collection containing each element for which the callback function returns true', function () {
          var pCollection = Pablo([Pablo.rect(), Pablo.a(), Pablo.circle()]),
              expected1   = Pablo([Pablo.rect(), Pablo.a(), Pablo.circle()]),
              expected2   = Pablo(Pablo.a()),
              outcome1, outcome2;

          outcome1 = pCollection.select(function (item, i) {
            return true;
          });

          outcome2 = pCollection.select(function (item, i) {
            if (item instanceof SVGAElement) {
              return true;
            }
          });

          expect(outcome1).to.eql(expected1);
          expect(outcome2).to.eql(expected2);
        });
      });

      describe('.every()', function () {
        it('.every(function) should return true if all values in the PabloCollection pass the test function', function () {
          var pCollection = Pablo([Pablo.a({foo:'bar'}),
                                   Pablo.a({foo:'bar'}),
                                   Pablo.a({foo:'bar'})]),
              outcome1, outcome2;

          function test (item, i) {
            if (item.getAttribute('foo') === 'bar') {
              return true;
            } else {
              return false;
            }
          }

          outcome1 = pCollection.every(test);
          pCollection[1].setAttribute('foo', 'wrong');
          outcome2 = pCollection.every(test);
          
          expect(outcome1).to.eql(true);
          expect(outcome2).to.eql(false);
        });
      });
    });

    describe('Misc', function () {
      describe('.create()', function () {
        it('.create(node) should return a new Pablo collection containing one element based on the passed argument', function () {
          var pCollection = Pablo.create('span');
          expect(pCollection instanceof Pablo.Collection).to.eql(true);
          expect(pCollection[0].tagName.toLowerCase()).to.eql('span');
        });

        it('.create(node, [attr]) should return a new Pablo collection containing one element with attributes based on the passed arguments', function () {
          var pCollection = Pablo.create('span', {foo: 'bar'});

          expect(pCollection instanceof Pablo.Collection).to.eql(true);
          expect(pCollection[0].tagName.toLowerCase()).to.eql('span');
          expect(pCollection[0].getAttribute('foo')).to.eql('bar');
        });
      });

      describe('.make()', function () {
        it('.make(svgName) should return a native SVG element with the supplied name', function () {
          var a       = Pablo.make('a'),
              ellipse = Pablo.make('ellipse'),
              circle  = Pablo.make('circle'),
              rect    = Pablo.make('rect');

          expect(a instanceof SVGAElement).to.eql(true);
          expect(ellipse instanceof SVGEllipseElement).to.eql(true);
          expect(circle instanceof SVGCircleElement).to.eql(true);
          expect(rect instanceof SVGRectElement).to.eql(true);
        });
      });

      describe('.getAttributes()', function () {
        it('.getAttributes(element) should return an object map of the passed element\'s attributes', function () {
          var span     = document.createElement('span'),
              expected = {
                foo:'bar',
                fiz:'buz',
                zip:'zop'
              };

          span.setAttribute('foo', 'bar');
          span.setAttribute('fiz', 'buz');
          span.setAttribute('zip', 'zop');

          expect(Pablo.getAttributes(span)).to.eql(expected);
        });
      });

      describe('.clone()', function () {
        it('.clone() should return a shallow copy (excludes children) of the PabloCollection', function () {
          var original = Pablo.rect({foo: 'bar'}),
              clone;

          original.append(Pablo.rect());

          clone = original.clone();

          expect(clone instanceof Pablo.Collection).to.eql(true);
          expect(clone[0] instanceof SVGRectElement).to.eql(true);
          expect(clone[0].getAttribute('foo')).to.eql('bar');
          expect(clone[0].childNodes.length).to.eql(0);
        });

        it('.clone() should return a shallow copy (excludes data) of the PabloCollection', function () {
          var original = Pablo.rect({foo: 'bar'}),
              clone;

          original.data('foo', 'bar');

          clone = original.clone();

          expect(clone instanceof Pablo.Collection).to.eql(true);
          expect(clone[0] instanceof SVGRectElement).to.eql(true);
          expect(clone[0].getAttribute('foo')).to.eql('bar');
          expect(clone.data('foo')).to.eql(undefined);
        });

        it('.clone() should return a shallow copy (excludes events) of the PabloCollection', function (done) {
          var original = Pablo.rect({foo: 'bar'}),
              clone;

          original.on('foo', function () {
            done(new Error('This event should not have been cloned'));
          });

          clone = original.clone();

          clone.trigger('foo');

          setTimeout(function () {
            done();
          }, 4);
        });

        it('.clone([isDeep]) should return a deep copy (includes children) of the PabloCollection', function () {
          var pCollection = Pablo.rect(),
              clone;

          pCollection.ellipse().ellipse().ellipse({foo:'bar'});

          clone = pCollection.clone(true);
          expect(clone).to.eql(pCollection);
        });

        it('.clone([isDeep]) should return a deep copy (includes data) of the PabloCollection', function () {
          var pCollection = Pablo.rect(),
              clone;

          pCollection.data('foo', 'bar');

          clone = pCollection.clone(true);

          expect(clone.data('foo')).to.eql('bar');
        });

        it('.clone([isDeep]) should return a deep copy (includes events) of the PabloCollection', function (done) {
          var pCollection = Pablo.rect(),
              clone;

          pCollection.on('foo', function () {
            done();
          });

          clone = pCollection.clone(true);

          clone.trigger('foo');
        });
      });

      describe('.duplicate()', function () {
        it('.duplicate() should change the length of the PabloCollection by duplicating it with itself', function () {
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

        it('.duplicate([repeat]) should change the length of the array up to the specified integer by duplicating it with itself', function () {
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
        it('.some(function)/.is(function) should return true or false based on the testing function\'s evaluation', function () {
          var subject    = Pablo([Pablo.rect(), Pablo.rect()]),
              expectTrue,
              expectFalse;

          expectTrue = subject.some(function (item, i) {
            expect(item instanceof SVGRectElement).to.eql(true);
            expect(i).to.be.a('number');
            return true;
          });

          expectFalse = subject.some(function (item, i) {
            return false;
          });

          expect(expectTrue).to.eql(true);
          expect(expectFalse).to.eql(false);
        });

        it('.some(function, context)/.is(function, context) should return true or false based on the testing function\'s evaluation', function () {
          var subject    = Pablo([Pablo.rect(), Pablo.rect()]),
              expectTrue,
              expectFalse,
              context    = {foo: 'bar'};

          expectTrue = subject.some(function (item, i) {
            expect(item instanceof SVGRectElement).to.eql(true);
            expect(i).to.be.a('number');
            expect(this.foo).to.eql('bar');
            return true;
          }, context);

          expectFalse = subject.some(function (item, i) {
            expect(this.foo).to.eql('bar');
            return false;
          }, context);

          expect(expectTrue).to.eql(true);
          expect(expectFalse).to.eql(false);
        });

        it('.some(PabloCollection)/.is(PabloCollection) should return true if the matching PabloCollection is found in the PabloCollection', function () {
          var subject  = Pablo([Pablo.rect(), Pablo.ellipse()]),
              expected = subject.some(subject.eq(1));

          expect(expected).to.eql(true);
        });

        it('.some(HTMLElement)/.is(HTMLElement) should return true if the matching HTMLElement is found in the PabloCollection', function () {
          var subject  = Pablo([document.createElement('span'), document.createElement('a')]),
              expected = subject.some(subject[1]);

          expect(expected).to.eql(true);
        });

        it('.some(SVGElement)/.is(SVGElement) should return true if the matching SVGElement is found in the PabloCollection', function () {
          var subject  = Pablo([Pablo.rect(), Pablo.ellipse()]),
              expected = subject.some(subject[1]);
          
          expect(expected).to.eql(true);
        });

        it('.some(selector)/.is(selector) should return true if the matching tag selector is found in the PabloCollection', function () {
          var subject  = Pablo([Pablo.rect(), Pablo.ellipse()]),
              expected = subject.some('rect');
          
          expect(expected).to.eql(true);
        });

        it('.some(selector)/.is(selector) should return true if the matching id selector is found in the PabloCollection ', function () {
          var subject  = Pablo([Pablo.rect(), Pablo.ellipse({id: 'foo'})]),
              expected = subject.some('#foo');
          
          expect(expected).to.eql(true);
        });

        it('.some(selector)/.is(selector) should return true if the matching selector is found in the nested PabloCollection ', function () {
          var span = document.createElement('span'),
              anchor = span.appendChild(document.createElement('a')),
              subject = Pablo(['rect', anchor, 'g']);
          
          expect(subject.some('a')).to.eql(true);
        });
      });

      describe('.processList()', function () {
        it('processList(list, callback) should return an array of strings given a string of space delimited words', function () {
          var items = [];

          Pablo().processList('foo bar', function (item) {
            items.push(item);
          });

          expect(items[0]).to.eql('foo');
          expect(items[1]).to.eql('bar');
        });
      });

      describe('.canBeWrapped()', function () {
        it('.canBeWrapped(elem) should return true', function () {
          expect(Pablo.canBeWrapped(document.body)).to.eql(true);
        });

        it('.canBeWrapped(jQueryCollection) should return true', function () {
          expect(Pablo.canBeWrapped(jQuery('body'))).to.eql(true);
        });

        it('.canBeWrapped(pabloCollection) should return true', function () {
          expect(Pablo.canBeWrapped(Pablo('body'))).to.eql(true);
        });

        it('.canBeWrapped({}) should return false', function () {
          expect(Pablo.canBeWrapped({})).to.not.eql(true);
        });
      });

      describe('.indexOf', function () {
        it('.indexOf(element) should return the index position in the PabloCollection of the matching node', function () {
          var pCollection = Pablo([Pablo.circle(), Pablo.a(), Pablo.g()]);

          expect(pCollection.indexOf(pCollection[2])).to.eql(2);
        });

        it('.indexOf(element) should return the index position in the PabloCollection of the matching PabloCollection', function () {
          var pCollection = Pablo([Pablo.circle(), Pablo.a(), Pablo.g()]);

          expect(pCollection.indexOf(pCollection.eq(2))).to.eql(2);
        });

        it('.indexOf(element) should return the index position of -1 in the PabloCollection of the matching node if it is not found', function () {
          var pCollection = Pablo([Pablo.circle(), Pablo.a(), Pablo.g()]);

          expect(pCollection.indexOf(Pablo.ellipse())).to.eql(-1);
        });
      });

      describe('.isArrayLike()', function () {
        it('.isArrayLike(obj) should return true if an array is passed', function () {
          expect(Pablo.isArrayLike([])).to.eql(true);
        });

        it('.isArrayLike(obj) should return true if a PabloCollection is passed', function () {
          expect(Pablo.isArrayLike(Pablo('body'))).to.eql(true);
        });

        it('.isArrayLike(obj) should return true if a NodeList is passed', function () {
          expect(Pablo.isArrayLike(Pablo('#test-subjects')[0].childNodes)).to.eql(true);
        });

        it('.isArrayLike(obj) should return true if a jQueryCollection is passed', function () {
          expect(Pablo.isArrayLike(jQuery('body'))).to.eql(true);
        });

        it('.isArrayLike(obj) should return false if a generic object is passed', function () {
          expect(Pablo.isArrayLike({})).to.eql(false);
        });
      });

      describe('.isElement()', function () {
        it('.isElement(obj) should return true if a HTMLElement is passed', function () {
          expect(Pablo.isElement(document.createElement('a'))).to.eql(true);
        });

        it('.isElement(obj) should return true if a SVGElement is passed', function () {
          expect(Pablo.isElement(Pablo.circle()[0])).to.eql(true);
        });

        it('.isElement(obj) should return false if a NodeList is passed', function () {
          expect(Pablo.isElement(Pablo('#test-subjects')[0].childNodes)).to.eql(false);
        });

        it('.isElement(obj) should return false if a jQueryCollection is passed', function () {
          expect(Pablo.isElement(jQuery('body'))).to.eql(false);
        });

        it('.isElement(obj) should return false if a generic object is passed', function () {
          expect(Pablo.isElement({})).to.eql(false);
        });
      });

      describe('.isSVGElement()', function () {
        it('.isSVGElement(obj) should return true if a SVGElement is passed', function () {
          expect(Pablo.isSVGElement(Pablo.circle()[0])).to.eql(true);
        });

        it('.isSVGElement(obj) should return false if a HTMLElement is passed', function () {
          expect(Pablo.isSVGElement(document.createElement('a'))).to.eql(false);
        });

        it('.isSVGElement(obj) should return false if a NodeList is passed', function () {
          expect(Pablo.isSVGElement(Pablo('#test-subjects')[0].childNodes)).to.eql(false);
        });

        it('.isSVGElement(obj) should return false if a jQueryCollection is passed', function () {
          expect(Pablo.isSVGElement(jQuery('body'))).to.eql(false);
        });

        it('.isSVGElement(obj) should return false if a generic object is passed', function () {
          expect(Pablo.isSVGElement({})).to.eql(false);
        });
      });

      describe('.isNodeList()', function () {
        it('.isNodeList(obj) should return true if a NodeList is passed', function () {
          expect(Pablo.isNodeList(Pablo('#test-subjects')[0].childNodes)).to.eql(true);
        });

        it('.isNodeList(obj) should return false if a SVGElement is passed', function () {
          expect(Pablo.isNodeList(Pablo.circle()[0])).to.eql(false);
        });

        it('.isNodeList(obj) should return false if a HTMLElement is passed', function () {
          expect(Pablo.isNodeList(document.createElement('a'))).to.eql(false);
        });

        it('.isNodeList(obj) should return false if a jQueryCollection is passed', function () {
          expect(Pablo.isNodeList(jQuery('body'))).to.eql(false);
        });

        it('.isNodeList(obj) should return false if a generic object is passed', function () {
          expect(Pablo.isNodeList({})).to.eql(false);
        });
      });

      describe('.isHTMLDocument()', function () {
        it('.isHTMLDocument(obj) should return true if the HTML document object is passed', function () {
          expect(Pablo.isHTMLDocument(document)).to.eql(true);
        });

        it('.isHTMLDocument(obj) should return false if a NodeList is passed', function () {
          expect(Pablo.isHTMLDocument(Pablo('#test-subjects')[0].childNodes)).to.eql(false);
        });

        it('.isHTMLDocument(obj) should return false if a SVGElement is passed', function () {
          expect(Pablo.isHTMLDocument(Pablo.circle()[0])).to.eql(false);
        });

        it('.isHTMLDocument(obj) should return false if a HTMLElement is passed', function () {
          expect(Pablo.isHTMLDocument(document.createElement('a'))).to.eql(false);
        });

        it('.isHTMLDocument(obj) should return false if a jQueryCollection is passed', function () {
          expect(Pablo.isHTMLDocument(jQuery('body'))).to.eql(false);
        });

        it('.isHTMLDocument(obj) should return false if a generic object is passed', function () {
          expect(Pablo.isHTMLDocument({})).to.eql(false);
        });
      });

      describe('.isPablo()', function () {
        it('.isPablo(obj) should return true if a PabloCollection passed', function () {
          expect(Pablo.isPablo(Pablo())).to.eql(true);
        });

        it('.isPablo(obj) should return false if a NodeList is passed', function () {
          expect(Pablo.isPablo(Pablo('#test-subjects')[0].childNodes)).to.eql(false);
        });

        it('.isPablo(obj) should return false if a SVGElement is passed', function () {
          expect(Pablo.isPablo(Pablo.circle()[0])).to.eql(false);
        });

        it('.isPablo(obj) should return false if a HTMLElement is passed', function () {
          expect(Pablo.isPablo(document.createElement('a'))).to.eql(false);
        });

        it('.isPablo(obj) should return false if a jQueryCollection is passed', function () {
          expect(Pablo.isPablo(jQuery('body'))).to.eql(false);
        });

        it('.isPablo(obj) should return false if a generic object is passed', function () {
          expect(Pablo.isPablo({})).to.eql(false);
        });
      });
      
      describe('.hyphensToCamelCase()', function () {
        it('.hyphensToCamelCase() should return a camel cased string based of the passed hyphenated string', function () {
          var cc = Pablo.hyphensToCamelCase('water-the-plants');
          expect(cc).to.eql('waterThePlants');
        });
      });
    });
  });

  describe('Data', function () {
    it('a PabloCollection which had data previously deleted should have that data if it is added again', function () {
      var subject = Pablo.rect();

      subject.data('foo', 'bar');
      expect(subject.data('foo')).to.eql('bar');

      subject.removeData('foo');
      expect(subject.data('foo')).to.eql(undefined);

      subject.data('foo', 'bar');
      expect(subject.data('foo')).to.eql('bar');
    });

    describe('.data()', function () {
      it('.data(key) should return the set value matching the given key', function () {
        var subject = Pablo.rect();
        subject.data('foo', 'bar');
        expect(subject.data('foo')).to.eql('bar');
      });

      it('.data(key, [value]) should set the given value to the given key', function () {
        var subject = Pablo.rect();
        subject.data('foo', 'bar');
        expect(subject.data('foo')).to.eql('bar');
      });

      it('.data(option) should set a number of key/value pairs representative of the passed mapping', function () {
        var subject = Pablo.rect();

        subject.data({
          foo: 'bar',
          fiz: 123
        });

        expect(subject.data('foo')).to.eql('bar');
        expect(subject.data('fiz')).to.eql(123);
      });
    });

    describe('.removeData()', function () {
      it('.removeData() should remove all the key and value associated with the PabloCollection', function () {
        var subject = Pablo.rect();
        subject.data('foo', 'bar');
        subject.data('fiz', 'buz');
        
        expect(subject.data('foo')).to.eql('bar');
        expect(subject.data('fiz')).to.eql('buz');

        subject.removeData();

        expect(subject.data('foo')).to.eql(undefined);
        expect(subject.data('fiz')).to.eql(undefined);
      });

      it('.removeData([keys]) should remove the key and value associated with the PabloCollection', function () {
        var subject = Pablo.rect();
        subject.data('foo', 'bar');
        subject.data('fiz', 'buz');
        
        expect(subject.data('foo')).to.eql('bar');
        expect(subject.data('fiz')).to.eql('buz');

        subject.removeData('foo');

        expect(subject.data('foo')).to.eql(undefined);
        expect(subject.data('fiz')).to.eql('buz');
      });

      it('.removeData([keys]) multiple keys should remove the keys and values associated with the PabloCollection', function () {
        var subject = Pablo.rect();

        subject.data('foo', 'bar');
        subject.data('fiz', 'buz');
        subject.data('zip', 'zap');

        subject.removeData('foo fiz');

        expect(subject.data('foo')).to.eql(undefined);
        expect(subject.data('fiz')).to.eql(undefined);
        expect(subject.data('zip')).to.eql('zap');
      });
    });

    describe('Pablo.cache', function () {
      var subject = Pablo.rect(),
          lastKey;
      it('when a PabloCollection has data set on it for the first time a unique id should be set for it in the cache', function () {
        var lastEntry;

        subject.data('foo', 'bar');

        lastKey   = Object.keys(Pablo.cache)[Object.keys(Pablo.cache).length-1];
        lastEntry = Pablo.cache[lastKey];

        expect(lastEntry['foo']).to.eql('bar');
      });

      it('when one of a PabloCollection\'s data key/value pair is removed it should remove it from the cache', function () {
        subject.data('fiz', 'buz');
        subject.removeData('foo');

        expect(Pablo.cache[lastKey]).to.eql({
          'fiz': 'buz'
        });
      });

      it('when all of PabloCollection\'s data key/value pair are removed it should remove the data from the cache and the unique id for that PabloCollection', function () {
        subject.removeData();
        expect(Pablo.cache[lastKey]).to.eql(undefined);
      });
    });

    describe('.detach()', function () {
      it('.detach() should detach the PabloCollection\'s element from its parent but retain its set data', function () {
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

    describe('.remove()', function () {
      it('.remove() should remove data on the removed element and its descendants ', function () {        
        var subject = Pablo.rect().append([Pablo.ellipse(), Pablo.ellipse()]);

        subject.children().eq(0).append(Pablo.circle());
        subject.children().eq(1).append(Pablo.circle());

        subject.data('foo', 'bar');
        subject.children().eq(0).data('foo', 'bar');
        subject.children().eq(1).data('foo', 'bar');
        subject.children().eq(0).firstChild().data('foo','bar');
        subject.children().eq(1).firstChild().data('foo','bar');

        expect(subject.data('foo')).to.eql('bar');
        expect(subject.children().eq(0).data('foo')).to.eql('bar');
        expect(subject.children().eq(1).data('foo')).to.eql('bar');
        expect(subject.children().eq(0).firstChild().data('foo')).to.eql('bar');
        expect(subject.children().eq(1).firstChild().data('foo')).to.eql('bar');

        subject.remove();

        expect(subject.data('foo')).to.eql(undefined);
        expect(subject.children().eq(0).data('foo')).to.eql(undefined);
        expect(subject.children().eq(1).data('foo')).to.eql(undefined);
        expect(subject.children().eq(0).firstChild().data('foo')).to.eql(undefined);
        expect(subject.children().eq(1).firstChild().data('foo')).to.eql(undefined);
      });
    });

    describe('.empty()', function () {
      it('.empty() should remove data on the element\'s descendants', function () {
        var subject = Pablo.rect().append([Pablo.ellipse(), Pablo.line()]);

        subject.children().eq(0).append(Pablo.circle());
        subject.children().eq(1).append(Pablo.circle());

        subject.data('foo', 'bar');
        subject.children().eq(0).data('foo', 'bar');
        subject.children().eq(1).data('foo', 'bar');
        subject.children().eq(0).firstChild().data('foo','bar');
        subject.children().eq(1).firstChild().data('foo','bar');

        expect(subject.data('foo')).to.eql('bar');
        expect(subject.children().eq(0).data('foo')).to.eql('bar');
        expect(subject.children().eq(1).data('foo')).to.eql('bar');
        expect(subject.children().eq(0).firstChild().data('foo')).to.eql('bar');
        expect(subject.children().eq(1).firstChild().data('foo')).to.eql('bar');

        subject.empty();

        expect(subject.data('foo')).to.eql('bar');
        expect(subject.children().eq(0).data('foo')).to.eql(undefined);
        expect(subject.children().eq(1).data('foo')).to.eql(undefined);
        expect(subject.children().eq(0).firstChild().data('foo')).to.eql(undefined);
        expect(subject.children().eq(1).firstChild().data('foo')).to.eql(undefined);
      });
    });
  });

  describe('Events', function () {
    it('a PabloCollection which had an event previously removed should have it function if its reassigned', function (done) {
      var subject = Pablo.rect(),
          counter = 0;

      function handler () {
        counter++;
        subject.off('foo', handler);
        subject.on('foo', handler);
        if (counter === 2) {
          done();
        } else {
          subject.trigger('foo');
        }
      }

      subject.on('foo', handler);
      subject.trigger('foo');
    });

    describe('.trigger()', function () {
      it('.trigger(eventNames) should trigger the event matching the passed event name of the PabloCollection', function (done) {
        var subject = Pablo.rect();

        subject.on('click', function () {
          done();
        });

        subject.trigger('click');
      });

      it('.trigger(eventNames) should trigger multiple events matching the passed event names delimited by a space', function (done) {
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

      it('.trigger(eventNames) like above but should work with an empty PabloCollection', function (done) {
        var subject = Pablo();

        subject.on('foo', function () {
          done();
        });

        subject.trigger('foo');
      });
    });

    describe('.on()', function () {
      it('.on(type, listener) should assign an event to the PabloCollection', function (done) {
        var subject = Pablo.rect();

        subject.on('click', function () {
          done();
        });

        subject.trigger('click');
      });

      it('.on(type, listener) should assign multiple event names to one handler to the PabloCollection', function (done) {
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

      it('.on(type, listener) should assign an event with an empty PabloCollection', function (done) {        var subject = Pablo();
        var subject = Pablo();

        subject.on('foo', function () {
          done();
        });

        subject.trigger('foo');
      });
    });

    describe('.off()', function () {
      it('.off(type, listener) should remove an event on a PabloCollection', function (done) {
        var subject = Pablo.rect();

        subject.on('click', failure);

        function failure () {
          done(new Error('The event should have been removed'));
        }

        subject.off('click', failure);

        subject.trigger('click');

        setTimeout(function () {
          done();
        }, 4);
      });

      it('.off(type, listener) should remove an event on a empty PabloCollection', function (done) {
        var subject = Pablo();

        subject.on('click', failure);

        function failure () {
          done(new Error('The event should have been removed'));
        }

        subject.off('click', failure);

        subject.trigger('click');

        setTimeout(function () {
          done();
        }, 4);
      });
    });

    describe('.one()', function () {
      it('.one(type, listener) should add an event on a PabloCollection and it should be removed when triggered', function (done) {
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
            done(new Error('The event persisted'));
          }
        }, 4)
      });

      it('.one(type, listener) should add an event on an empty PabloCollection and it should be removed when triggered', function (done) {
        var subject = Pablo(),
            counter = 0;

        subject.one('click', function () {
          counter++;
        });

        subject.trigger('click');
        subject.trigger('click');
        subject.trigger('click');

        setTimeout(function () {
          if (counter === 1) {
            done();
          } else {
            done(new Error('The event persisted'));
          }
        }, 4)
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
        }, 4)
      });
    });
  });

  describe('.extend()', function () {
    it('extend(source, target)', function () {
      var obj  = {
        foo: 'bar'
      },
      obj2     = {
        fiz: 'buz'
      },
      expected = {
        foo: 'bar',
        fiz: 'buz'
      };
      expect(Pablo.extend(obj, obj2)).to.eql(expected);
    });

    it('extend(source, target, target)', function () {
      var obj  = {
        foo: 'bar'
      },
      obj2     = {
        fiz: 'buz'
      },
      obj3     = {
        yin: 'yan'
      },
      expected = {
        foo: 'bar',
        fiz: 'buz',
        yin: 'yan'
      };
      expect(Pablo.extend(obj, obj2, obj3)).to.eql(expected);
    });

    it('extend(source, target, target, deep)', function () {
      var obj  = {
        foo: 'bar'
      },
      obj2     = {
        fiz: 'buz',
        deep: {
          'zip': 'zap'
        }
      },
      obj3     = {
        yin: 'yan',
        deep: {
          'fip': 'fop'
        }
      },
      expected = {
        foo: 'bar',
        fiz: 'buz',
        yin: 'yan',
        deep: {
          'zip': 'zap',
          'fip': 'fop'
        }
      };
      expect(Pablo.extend(obj, obj2, obj3, true)).to.eql(expected);
    });

    it('extend(source, target, deep)', function () {
      var obj = {
        fiz: 'buz',
        deep: {
          'zip': 'zap'
        }
      },
      obj2    = {
        yin: 'yan',
        deep: {
          'fip': 'fop',
          'com': [true, false, {}, 123, NaN, {'foo': 'bar'}]
        }
      },
      expected = {
        fiz: 'buz',
        yin: 'yan',
        deep: {
          'zip': 'zap',
          'fip': 'fop',
          'com': [true, false, {}, 123, NaN, {'foo': 'bar'}]
        }
      };
      expect(Pablo.extend(obj, obj2, true)).to.eql(expected);
    });
  });

  describe('.template()', function () {
    it('template(name, function) should set a new svg shape namespace on the pablo object', function () {
      Pablo.template('star', function (options) {

      });
      notDone();
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