(function(){
  'use strict';

  var expect = chai.expect,
      assert = chai.assert;

  describe('Pablo test suite', function () {
    it('should load the Pablo library into the browser', function () {
      expect(Pablo).to.be.a('function');
    });

    it('should load the jQuery library into the browser for one of the Collections test', function () {
      expect(jQuery).to.be.a('function');
    });

    it('Pablo is supported in this browser', function () {
      expect(Pablo.isSupported).to.equal(true);
    });
  });

  describe('Browser support', function(){
    function test(desc, condition){
      return (condition ? '✓' : '✖') + ' ' + desc;
    }

    var document = window.document,
        Array = window.Array,
        Object = window.Object,
        testElement = document && 
          'createElementNS' in document &&
          document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
        matchesProp = testElement.matches || 
          testElement.mozMatches ||
          testElement.webkitMatches ||
          testElement.oMatches ||
          testElement.msMatches || 
          testElement.matchesSelector || 
          testElement.mozMatchesSelector ||
          testElement.webkitMatchesSelector ||
          testElement.oMatchesSelector ||
          testElement.msMatchesSelector;

    describe('Essential native APIs', function(){
      it('document', function(){
        expect(document).to.be.an('object');
      });

      it('document.createElementNS', function(){
        expect(document.createElementNS).to.be.a('function');
      });

      it('can create SVG elements', function(){
        expect(testElement).to.be.a('object');
      });

      it('window.Element', function(){
        expect('Element' in window).to.equal(true);
      });

      it('window.SVGElement', function(){
        expect('SVGElement' in window).to.equal(true);
      });

      it('window.NodeList', function(){
        expect('NodeList' in window).to.equal(true);
      });

      it('window.Document', function(){
        expect('Document' in window).to.equal(true);
      });

      it('svg.createSVGRect', function(){
        expect(testElement.createSVGRect).to.be.a('function');
      });

      it('svg.attributes', function(){
        expect(testElement.attributes).to.be.an('object');
      });

      it('svg.querySelectorAll', function(){
        expect(testElement.querySelectorAll).to.be.a('function');
      });

      it('svg.previousElementSibling', function(){
        expect(testElement.previousElementSibling).to.not.be.undefined;
      });

      it('svg.childNodes', function(){
        expect(testElement.childNodes).to.not.be.undefined;
      });

      it('Object.create', function(){
        expect(Object.create).to.be.a('function');
      });

      it('Object.keys', function(){
        expect(Object.keys).to.be.a('function');
      });

      it('Array.isArray', function(){
        expect(Array.isArray).to.be.a('function');
      });

      it('array.forEach', function(){
        expect('forEach' in Array.prototype).to.equal(true);
      });

      it('array.map', function(){
        expect('map' in Array.prototype).to.equal(true);
      });

      it('array.some', function(){
        expect('some' in Array.prototype).to.equal(true);
      });

      it('array.every', function(){
        expect('every' in Array.prototype).to.equal(true);
      });

      it('array.filter', function(){
        expect('filter' in Array.prototype).to.equal(true);
      });

      it('window.matches or window.matchesSelector (vendor-prefixes allowed)', function(){
        expect(typeof matchesProp).to.equal('function');
      });

      it('window.XMLSerializer', function(){
        expect('XMLSerializer' in window).to.equal(true);
      });

      it('window.DOMParser', function(){
        expect('DOMParser' in window).to.equal(true);
      });
    });

    describe('Non-essential browser features', function(){
      // Pablo currently provides a polyfill for this
      it.skip(test('svgElement.classList', typeof testElement.classList === 'object'));

      // NOTE on svgElement.children: ideally, we'd use the 'children'
      // collection, instead of 'childNodes'. Even if a browser implements 
      // 'children' on HTML elements, it isn't always implemented on SVG elements
      // See https://hacks.mozilla.org/2009/06/dom-traversal/
      // Bug report in WebKit: https://bugs.webkit.org/show_bug.cgi?id=112698
      it.skip(test('svgElement.children', typeof testElement.children === 'object'));
    });

    describe('Support for dataUrl() and toImage("svg")', function(){
      it.skip(test('window.atob', 'atob' in window));
      it.skip(test('window.btoa', 'btoa' in window));
    });

    describe('Support for toImage("png") and toImage("jpeg")', function(){
      function setResult(desc, testFn){
        testFn(function(supported){
          window.setTimeout(function(){
            jQuery('.test.pending > h2').each(function(){
              var pendingDesc = this.textContent;
              if (pendingDesc === desc){
                this.textContent = test(desc, supported);
                return false;
              }
            });
          }, 250);
        });
      }

      var desc;

      desc = 'image("png") creates PNG via canvas';
      it.skip(desc);
      setResult(desc, function(done){
        Pablo.support.png(done);
      });

      desc = 'image("jpeg") creates JPEG via canvas';
      it.skip(desc);
      setResult(desc, function(done){
        Pablo.support.jpeg(done);
      });
    });

    describe('Support for toCanvas() method', function(){
      it.skip(test('can create <canvas>', 'getContext' in document.createElement('canvas')));
      it.skip(test('can call toImage("svg")', Pablo.support.svgImage));
    });

    describe('Support for download() method', function(){
      it.skip(test('document.createEvent', 'createEvent' in document));
      it.skip(test('HTML <a> elements have "download" attribute', 'download' in document.createElement('a')));
      it.skip(test('can call dataUrl()', Pablo.support.dataUrl));
    });

    describe('Alternative native APIs for download() URL creation', function(){
      it.skip(test('window.Blob', 'Blob' in window));
      it.skip(test('window.URL', 'URL' in window));
    });
  });


  // INCOMPATIBLE BROWSER - stop here

  if (!Pablo.isSupported){
    return;
  }


  // COMPATIBLE BROWSER

  describe('Pablo', function () {

    describe('Collections', function () {

      describe('Pablo.Collection', function () {
        it('.Collection', function () {
          expect(Pablo.Collection.prototype).to.equal(Pablo.fn);
          expect(Pablo.g() instanceof Pablo.Collection).to.equal(true);
        });
      });

      describe('Pablo(input)', function () {

        it('should return an empty pablo collection when passed unwrappable contents', function () {
          var subject = Pablo();

          expect(subject instanceof Pablo.Collection).to.equal(true);
          expect(subject.length).to.equal(0);

          expect(Pablo([]).length).to.equal(0);
          expect(Pablo({}).length).to.equal(0);
          expect(Pablo(3).length).to.equal(0);
          expect(Pablo('').length).to.equal(0);
          expect(Pablo(null).length).to.equal(0);
          expect(Pablo(undefined).length).to.equal(0);
          expect(Pablo(document.createTextNode('foo')).length).to.equal(0);
          expect(Pablo(document.createComment('bar')).length).to.equal(0);
        });

        it('should return a pablo collection containing a DOM element when passed that dom element', function () {
          var targetElement = document.getElementById('test-subjects'),
              subject   = Pablo(targetElement);

          expect(subject instanceof Pablo.Collection).to.equal(true);
          expect(subject.length).to.equal(1);
          expect(subject[0].id).to.equal('test-subjects');
        });

        it('should return a pablo collection containing elements when passed an Array of elements', function () {
          var nodeList = document.getElementById('test-subjects').childNodes,
              asArray  = [],
              subject;

            for (var i = 0; i < nodeList.length; i++) {
              asArray.push(nodeList[i]);
            }

          subject = Pablo(asArray);

          expect(subject instanceof Pablo.Collection).to.equal(true);
          expect(subject.length).to.equal(3);
          expect(subject[0].id).to.equal('test-subject-a');
          expect(subject[1].id).to.equal('test-subject-b');
          expect(subject[2].id).to.equal('test-subject-c');
        });

        it('should return a pablo collection containing elements when passed an Array-like collection (e.g. jQuery)', function () {
          var jQueryCollection = jQuery('#test-subjects'),
              subject      = Pablo(jQueryCollection);

          expect(subject instanceof Pablo.Collection);
          expect(subject.length).to.equal(1);
          expect(subject[0].id).to.equal('test-subjects');
        });

        it('should return a pablo collection containing elements when passed a NodeList (excludes textnodes)', function () {
          var nodeList    = document.getElementById('test-subjects').childNodes,
              subject = Pablo(nodeList);

          expect(subject instanceof Pablo.Collection).to.equal(true);
          expect(subject.length).to.equal(3);
          expect(subject[0].id).to.equal('test-subject-a');
          expect(subject[1].id).to.equal('test-subject-b');
          expect(subject[2].id).to.equal('test-subject-c');
        });

        it('should return a pablo collection containing elements when passed a Pablo collection', function () {
          var subject  = Pablo(document.getElementById('test-subjects').childNodes),
              subject2 = Pablo(subject); 

          expect(subject2 instanceof Pablo.Collection);
          expect(subject2.length).to.equal(3);
          expect(subject2[0].id).to.equal('test-subject-a');
          expect(subject2[1].id).to.equal('test-subject-b');
          expect(subject2[2].id).to.equal('test-subject-c');
        });

        it('should return a pablo collection containing elements when passed a CSS Selector', function () {
          var subject = Pablo('#test-subjects li');

          expect(subject instanceof Pablo.Collection);
          expect(subject.length).to.equal(3);
          expect(subject[0].id).to.equal('test-subject-a');
          expect(subject[1].id).to.equal('test-subject-b');
          expect(subject[2].id).to.equal('test-subject-c');
        });

        it.skip('should return a pablo collection containing elements when passed a document fragment', function () {
          var fragment = document.createDocumentFragment(),
              colors = ['blue', 'red', 'green'],
              subject;

          colors.forEach(function(color) {
            var li = document.createElement('li');
            li.textContent = color;
            fragment.appendChild(li);
          });

          subject = Pablo(fragment);

          expect(subject instanceof Pablo.Collection);
          expect(subject.length).to.equal(3);
          expect(subject[0].textContent).to.equal(colors[0]);
          expect(subject[0].textContent).to.equal(colors[1]);
          expect(subject[0].textContent).to.equal(colors[2]);
        });
      });

      describe('Pablo(selectors, context)', function () {
        it('should find matching elements when context is a Pablo collection', function () {
          var subject = Pablo('li', Pablo('#test-subjects'));

          expect(subject.length).to.equal(3);
          expect(subject[0].id).to.equal('test-subject-a');
          expect(subject[1].id).to.equal('test-subject-b');
          expect(subject[2].id).to.equal('test-subject-c');
        });

        it('.should find matching elements when context is a CSS selector', function () {
          var subject = Pablo('li', '#test-subjects');

          expect(subject.length).to.equal(3);
          expect(subject[0].id).to.equal('test-subject-a');
          expect(subject[1].id).to.equal('test-subject-b');
          expect(subject[2].id).to.equal('test-subject-c');
        });

        it('should find matching elements when context is a DOM Element', function () {
          var subject = Pablo('li', Pablo('#test-subjects')[0]);

          expect(subject.length).to.equal(3);
          expect(subject[0].id).to.equal('test-subject-a');
          expect(subject[1].id).to.equal('test-subject-b');
          expect(subject[2].id).to.equal('test-subject-c');
        });

        it('should find matching elements when context is a Nodelist', function () {
          var subject = Pablo('.test-subject', document.querySelectorAll('ul'));

          expect(subject.length).to.equal(3);
          expect(subject[0].id).to.equal('test-subject-a');
          expect(subject[1].id).to.equal('test-subject-b');
          expect(subject[2].id).to.equal('test-subject-c');
        });

        it('should find matching elements when context is a jQuery collection', function () {
          var subject = Pablo('.test-subject', jQuery('ul'));

          expect(subject.length).to.equal(3);
          expect(subject[0].id).to.equal('test-subject-a');
          expect(subject[1].id).to.equal('test-subject-b');
          expect(subject[2].id).to.equal('test-subject-c');
        });
      });

      describe('Pablo(element, [attributes])', function () {
        it('should create a new Pablo collection containing the specified element with the specified attributes', function () {
          var subject = Pablo('rect', {x:10, y:10, width:50, height:50});
          expect(subject instanceof Pablo.Collection).to.equal(true);
          expect(subject.length).to.equal(1);
          expect(subject[0].getAttribute('x')).to.equal('10');
          expect(subject[0].getAttribute('y')).to.equal('10');
          expect(subject[0].getAttribute('width')).to.equal('50');
          expect(subject[0].getAttribute('height')).to.equal('50');
        });

        it('should create a new Pablo collection containing multiple specified elements with the specified attributes', function () {
          var subject = Pablo(['rect', 'line', 'line'], {stroke:'black'});
          expect(subject instanceof Pablo.Collection).to.equal(true);
          expect(subject.length).to.equal(3);
          expect(subject[0].getAttribute('stroke')).to.equal('black');
          expect(subject[1].getAttribute('stroke')).to.equal('black');
          expect(subject[2].getAttribute('stroke')).to.equal('black');
        });


        it('Pablo(markup) should create a collection of SVG elements', function () {
            var subject = Pablo('<g></g>');

            expect(subject.length).to.equal(1);
            expect(subject.viewport().length).to.equal(0);
            expect(subject[0].nodeName.toLowerCase()).to.equal('g');
            expect(Pablo.hasSvgNamespace(subject[0])).to.equal(true);
        });
        
        it('Pablo(markup) should allow nested elements', function () {
            var subject = Pablo('<g><a></a><rect></rect></g>');

            expect(subject.length).to.equal(1);
            expect(subject.children().length).to.equal(2);
            expect(subject[0].nodeName.toLowerCase()).to.equal('g');
            expect(subject.firstChild()[0].nodeName.toLowerCase()).to.equal('a');
            expect(subject.lastChild()[0].nodeName.toLowerCase()).to.equal('rect');
        });

        it('Pablo(markup) should allow multiple sibling elements', function () {
            var subject = Pablo('<g></g><a></a><rect></rect>');

            expect(subject.length).to.equal(3);
            expect(subject.viewport().length).to.equal(0);
            expect(subject[0].nodeName.toLowerCase()).to.equal('g');
            expect(subject[1].nodeName.toLowerCase()).to.equal('a');
            expect(subject[2].nodeName.toLowerCase()).to.equal('rect');
        });

        it('Pablo(markup, attr) should merge attributes', function () {
            var subject = Pablo('<rect x="5" y="8"></rect>', {
              width: 10,
              height: 15
            });

            expect(subject.length).to.equal(1);
            expect(subject.viewport().length).to.equal(0);
            expect(subject[0].nodeName.toLowerCase()).to.equal('rect');
            expect(Pablo.hasSvgNamespace(subject[0])).to.equal(true);
            expect(subject.attr()).to.eql({x:'5',y:'8', width:'10', height:'15'});
        });
      });

      describe('Pablo Collection uniqueness', function () {
        describe('a PabloCollection should never contain duplicate items', function () {
          it('with .push()/.add()', function () {
            var collection = Pablo('#test-subject-a');

            collection.add(Pablo('#test-subjects-a'));
            expect(collection.length).to.equal(1);
            expect(collection.attr('id')).to.equal('test-subject-a');

            collection = Pablo('#test-subject-a');

            collection.add(collection[0]);
            expect(collection.length).to.equal(1);
            expect(collection.attr('id')).to.equal('test-subject-a');

            collection = Pablo('#test-subject-a');

            collection.add(collection.eq(0));
            expect(collection.length).to.equal(1);
            expect(collection.attr('id')).to.equal('test-subject-a');
          });

          it('with .concat()', function () {
            var collection = Pablo('#test-subject-a');

            collection.concat(Pablo('#test-subjects-a'));
            expect(collection.length).to.equal(1);
            expect(collection.attr('id')).to.equal('test-subject-a');

            collection = Pablo('#test-subject-a');

            collection.concat(collection[0]);
            expect(collection.length).to.equal(1);
            expect(collection.attr('id')).to.equal('test-subject-a');

            collection = Pablo('#test-subject-a');

            collection.concat(collection.eq(0));
            expect(collection.length).to.equal(1);
            expect(collection.attr('id')).to.equal('test-subject-a');
          });

          it('a new Pablo Collection with an array of the same element', function () {
            var subject    = Pablo('#test-subject-a')[0],
                collection = Pablo([subject, subject, subject]);

            expect(collection.length).to.equal(1);
            expect(collection.attr('id')).to.equal('test-subject-a');
          });

          it('a new Pablo Collection with an array of the same element but one is Pablo wrapped', function () {
            var subject    = Pablo('#test-subject-a'),
                collection = Pablo([subject[0], subject[0], subject]);

            expect(collection.length).to.equal(1);
            expect(collection.attr('id')).to.equal('test-subject-a');
          });
        });
      });
    });

    describe('Pablo collection methods', function () {

      describe('Node Positioning', function () {
        describe('.append(element, [attributes])', function () {
          it('should return a Pablo collection', function () {
            expect(Pablo.circle().append(Pablo.rect()) instanceof Pablo.Collection).to.equal(true);
          });

          it('.append(elements) should append the specified element(s) as a child of the specific Pablo collection and return ', function () {
            var subject = Pablo.circle();
            subject.append(Pablo.rect());

            expect(subject[0].childNodes.length).to.equal(1);
            expect(subject[0].childNodes[0] instanceof SVGRectElement).to.equal(true);
          });

          it('.append(elementName, attributes) should create a new element as a child of the specific Pablo collection', function () {
            var subject = Pablo.circle();
            subject.append('rect', {foo: 'bar'});

            expect(subject[0].childNodes.length).to.equal(1);
            expect(subject[0].childNodes[0] instanceof SVGRectElement).to.equal(true);
            expect(subject[0].childNodes[0].getAttribute('foo')).to.equal('bar');
          });
        });

        describe('.appendTo(element, [attributes])', function () {
          it('should return a Pablo collection', function () {
            expect(Pablo.circle().appendTo(Pablo.rect()) instanceof Pablo.Collection).to.equal(true);
          });

          it('.appendTo(element) should append the subject collection to the passed in element', function () {
            var subject  = Pablo.circle({foo:'bar'}),
                subject2 = Pablo.rect();

            subject.appendTo(subject2);

            expect(subject2[0].childNodes.length).to.equal(1);
            expect(subject2[0].childNodes[0] instanceof SVGCircleElement).to.equal(true);
            expect(subject2[0].childNodes[0].getAttribute('foo')).to.equal('bar');
          });

          it('.appendTo(elementName, attributes) should append the subject collection to a newly created element respective of the passed arguments', function () {
            var subject = Pablo.circle({foo: 'bar'}),
                parent      = subject.appendTo('rect', {})[0].parentNode;
            
            expect(parent.childNodes.length).to.equal(1);
            expect(parent.childNodes[0] instanceof SVGCircleElement).to.equal(true);
            expect(parent.childNodes[0].getAttribute('foo')).to.equal('bar');
          });
        });

        describe('.prepend(elements, [attributes])', function () {
          it('should return a Pablo collection', function () {
            expect(Pablo.circle().prepend(Pablo.rect()) instanceof Pablo.Collection).to.equal(true);
          });

          it('.prepend(element) should prepend the passed element to the subject collection', function () {
            var subject = Pablo.circle().append(Pablo.rect()).append(Pablo.rect());
            subject.prepend(Pablo.ellipse({foo:'bar'}));

            expect(subject[0].childNodes.length).to.equal(3);
            expect(subject[0].childNodes[0] instanceof SVGEllipseElement).to.equal(true);
            expect(subject[0].childNodes[0].getAttribute('foo')).to.equal('bar');
          });

          it('.prepend(elementName, attributes) should prepend to a newly created element respective of the passed arguments', function () {
            var subject = Pablo.circle().append(Pablo.rect()).append(Pablo.rect());
            subject.prepend('ellipse', {foo:'bar'});

            expect(subject[0].childNodes.length).to.equal(3);
            expect(subject[0].childNodes[0] instanceof SVGEllipseElement).to.equal(true);
            expect(subject[0].childNodes[0].getAttribute('foo')).to.equal('bar');
          });
        });

        describe('.prependTo(elements, [attributes])', function () {
          it('should return a Pablo collection', function () {
            expect(Pablo.circle().prependTo(Pablo.rect()) instanceof Pablo.Collection).to.equal(true);
          });

          it('.prependTo(element) should prepend the subject collection to the passed element', function () {
            var subject = Pablo.circle().append(Pablo.rect()).append(Pablo.rect());
            Pablo.ellipse({foo:'bar'}).prependTo(subject);

            expect(subject[0].childNodes.length).to.equal(3);
            expect(subject[0].childNodes[0] instanceof SVGEllipseElement).to.equal(true);
            expect(subject[0].childNodes[0].getAttribute('foo')).to.equal('bar');
          });

          it('.prependTo(elementName, attributes) should prepend the subject collection to the a newly created element respective of the passed arguments', function () {
            var subject = Pablo.circle();
            subject.prependTo('ellipse', {foo:'bar'});

            expect(subject[0].parentNode instanceof SVGEllipseElement).to.equal(true);
            expect(subject[0].parentNode.getAttribute('foo')).to.equal('bar');
          });
        });

        describe('.before(element)', function () {
          it('.before(element)', function () {
            var subject = Pablo.rect().append(Pablo.circle()).append(Pablo.circle());
            Pablo(subject[0].childNodes).before(Pablo.ellipse({foo:'bar'}));

            expect(subject[0].childNodes.length).to.equal(4);
            expect(subject[0].childNodes[0] instanceof SVGEllipseElement).to.equal(true);
            expect(subject[0].childNodes[2] instanceof SVGEllipseElement).to.equal(true);
            expect(subject[0].childNodes[0].getAttribute('foo')).to.equal('bar');
            expect(subject[0].childNodes[2].getAttribute('foo')).to.equal('bar');
          });

          it('.before(element, [attributes])', function () {
            var subject = Pablo.rect().append(Pablo.circle()).append(Pablo.circle());
            Pablo(subject[0].childNodes).before('ellipse', {foo: 'bar'});

            expect(subject[0].childNodes.length).to.equal(4);
            expect(subject[0].childNodes[0] instanceof SVGEllipseElement).to.equal(true);
            expect(subject[0].childNodes[2] instanceof SVGEllipseElement).to.equal(true);
            expect(subject[0].childNodes[0].getAttribute('foo')).to.equal('bar');
            expect(subject[0].childNodes[2].getAttribute('foo')).to.equal('bar');
          });
        });

        describe('.after(element)', function () {
          it('.after(element)', function () {
            var subject = Pablo.rect().append(Pablo.circle()).append(Pablo.circle());
            Pablo(subject[0].childNodes).after(Pablo.ellipse({foo:'bar'}));

            expect(subject[0].childNodes.length).to.equal(4);
            expect(subject[0].childNodes[1] instanceof SVGEllipseElement).to.equal(true);
            expect(subject[0].childNodes[3] instanceof SVGEllipseElement).to.equal(true);
            expect(subject[0].childNodes[1].getAttribute('foo')).to.equal('bar');
            expect(subject[0].childNodes[3].getAttribute('foo')).to.equal('bar');
          });

          it('.after(element, [attributes])', function () {
            var subject = Pablo.rect().append(Pablo.circle()).append(Pablo.circle());
            Pablo(subject[0].childNodes).after('ellipse', {foo:'bar'});

            expect(subject[0].childNodes.length).to.equal(4);
            expect(subject[0].childNodes[1] instanceof SVGEllipseElement).to.equal(true);
            expect(subject[0].childNodes[3] instanceof SVGEllipseElement).to.equal(true);
            expect(subject[0].childNodes[1].getAttribute('foo')).to.equal('bar');
            expect(subject[0].childNodes[3].getAttribute('foo')).to.equal('bar');
          });
        });

        describe('.insertBefore(element)', function () {
          it('.insertBefore(element)', function () {
            var subject = Pablo.rect().append(Pablo.circle()).append(Pablo.circle());
            Pablo.ellipse({foo:'bar'}).insertBefore(subject[0].childNodes);

            expect(subject[0].childNodes.length).to.equal(4);
            expect(subject[0].childNodes[0] instanceof SVGEllipseElement).to.equal(true);
            expect(subject[0].childNodes[2] instanceof SVGEllipseElement).to.equal(true);
            expect(subject[0].childNodes[0].getAttribute('foo')).to.equal('bar');
            expect(subject[0].childNodes[2].getAttribute('foo')).to.equal('bar');
          });

          it('.insertBefore(element, [attributes])', function () {
            var subject = Pablo.rect().append(Pablo.circle()).append(Pablo.circle());
            Pablo('ellipse', {foo:'bar'}).insertBefore(subject[0].childNodes);

            expect(subject[0].childNodes.length).to.equal(4);
            expect(subject[0].childNodes[0] instanceof SVGEllipseElement).to.equal(true);
            expect(subject[0].childNodes[2] instanceof SVGEllipseElement).to.equal(true);
            expect(subject[0].childNodes[0].getAttribute('foo')).to.equal('bar');
            expect(subject[0].childNodes[2].getAttribute('foo')).to.equal('bar');
          });
        });

        describe('.insertAfter(element)', function () {
          it('.insertAfter(element)', function () {
            var subject = Pablo.rect().append(Pablo.circle()).append(Pablo.circle());
            Pablo.ellipse({foo:'bar'}).insertAfter(subject[0].childNodes);

            expect(subject[0].childNodes.length).to.equal(4);
            expect(subject[0].childNodes[1] instanceof SVGEllipseElement).to.equal(true);
            expect(subject[0].childNodes[3] instanceof SVGEllipseElement).to.equal(true);
            expect(subject[0].childNodes[1].getAttribute('foo')).to.equal('bar');
            expect(subject[0].childNodes[3].getAttribute('foo')).to.equal('bar');
          });

          it('.insertAfter(element, [attributes])', function () {
            var subject = Pablo.rect().append(Pablo.circle()).append(Pablo.circle());
            Pablo('ellipse', {foo:'bar'}).insertAfter(subject[0].childNodes);

            expect(subject[0].childNodes.length).to.equal(4);
            expect(subject[0].childNodes[1] instanceof SVGEllipseElement).to.equal(true);
            expect(subject[0].childNodes[3] instanceof SVGEllipseElement).to.equal(true);
            expect(subject[0].childNodes[1].getAttribute('foo')).to.equal('bar');
            expect(subject[0].childNodes[3].getAttribute('foo')).to.equal('bar');
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

            expect(cLength).to.equal(0);
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

            expect(length).to.equal(0);
          });
        });
      });

      describe('Node Traversal', function () {
        describe('.children([filterBy])', function () {
          it('should return the children of the subject Pablo collection', function () {
            var children = Pablo('#test-subjects').children();

            expect(children.length).to.equal(3);
            expect(children instanceof Pablo.Collection).to.equal(true);
            expect(children[0].id).to.equal('test-subject-a');
            expect(children[1].id).to.equal('test-subject-b');
            expect(children[2].id).to.equal('test-subject-c');
          });

          it('should allow the returned children to be filtered by a selector', function () {
            var children = Pablo('#test-subjects').children('li[id="test-subject-b"]');

            expect(children.length).to.equal(1);
            expect(children instanceof Pablo.Collection).to.equal(true);
            expect(children[0].id).to.equal('test-subject-b');
          });

          it('should allow the returned children to be filtered by a function', function () {
            var collection = Pablo('#test-subjects'),
                children = collection.children(function (item, i, thisp) {
                  expect(Pablo.isPablo(thisp)).to.equal(true);
                  expect(thisp.length).to.equal(3);
                  if (i !== 1) {
                    return true;
                  }
                });

            expect(children.length).to.equal(2);
            expect(children instanceof Pablo.Collection).to.equal(true);
            expect(children[0].id).to.equal('test-subject-a');
            expect(children[1].id).to.equal('test-subject-c');
          });

          it('should have the "this" context of the callback be the subject collection', function () {
            var collection = Pablo.rect();
            collection.children(function () {
              expect(this).to.equal(collection);
            });
          });
        });

        describe('.parent([filterBy])', function () {
          it('.parent() should return the parent element as a PabloCollection', function () {
            var child = document.getElementById('test-subject-a');
            expect(Pablo(child).parent()[0].id).to.equal('test-subjects');
            expect(Pablo(child).parent() instanceof Pablo.Collection).to.equal(true);
          });

          it('.parent([selector])', function () {
            var childA = document.getElementById('test-subject-a'),
                childB = document.getElementById('test-subject-b'),
                childC = document.getElementById('test-subject-c'),
                parent = Pablo([childA, childB, childC]).parent('ul');

            expect(parent[0].id).to.equal('test-subjects');
            expect(parent instanceof Pablo.Collection).to.equal(true);
          });

          it('should have the "this" context of the callback be the subject collection', function () {
            var collection = Pablo.rect();
            collection.parent(function () {
              expect(this).to.equal(collection);
            });
          });
        });

        describe('.parents([filterBy])', function () {
          it('.parents() should return all ancestors of the PabloCollection as a PabloCollection ordered by closest to oldest', function () {
            var child     = Pablo('#test-subject-a'),
                ancestors = child.parents(),
                expected  = Pablo('html').add(Pablo('body')).add(Pablo('#test-subjects'));

            expected.reverse();

            expect(ancestors).to.eql(expected);
            expect(ancestors instanceof Pablo.Collection).to.equal(true);
          });

          it('.parents([selector])', function () {
            var child    = Pablo('#test-subject-a'),
                filtered = child.parents('body');

            expect(filtered.length).to.equal(1);
            expect(filtered[0] instanceof HTMLBodyElement).to.equal(true);
          });

          it('should have the "this" context of the callback be the subject collection', function () {
            var collection = Pablo.rect();
            collection.parents(function () {
              expect(this).to.equal(collection);
            });
          });
        });

        describe('.parentsSvg([filterBy])', function () {
          it('.parentsSvg()', function () {
            var collection = Pablo(document.createElement('div')),
                deepChild,
                parents;

            collection.circle().ellipse().append('a', {});
            deepChild = collection.find('a');
            parents = deepChild.parentsSvg();

            expect(parents.length).to.equal(2);
            expect(parents[0] instanceof SVGEllipseElement).to.equal(true);
            expect(parents[1] instanceof SVGCircleElement).to.equal(true);
          });

          it('.parentsSvg([selector])', function () {
            var collection = Pablo(document.createElement('div')),
                deepChild,
                parents;

            collection.circle().circle().append('a', {});
            deepChild = collection.find('a');
            parents = deepChild.parentsSvg('circle');

            expect(parents.length).to.equal(2);
            expect(parents[0] instanceof SVGCircleElement).to.equal(true);
            expect(parents[1] instanceof SVGCircleElement).to.equal(true);
          });

          it('should have the "this" context of the callback be the subject collection', function () {
            var collection = Pablo.rect();
            collection.parentsSvg(function () {
              expect(this).to.equal(collection);
            });
          });
        });

        describe('.ancestor()', function () {
          it('.ancestor() should return the pablo wrapped document for an element in the DOM', function () {
              var subject = Pablo('#test-subjects'),
                  result  = subject.ancestor();

              expect(result.length).to.equal(1);
              expect(result[0] === document).to.equal(true);
          });
        });

        describe('.ancestor()', function () {
          it('.ancestor() for a detached element should return highest parent', function () {
              var ancestor = Pablo.g(),
                  subject  = ancestor.circle(),
                  result   = subject.ancestor();

              expect(result.length).to.equal(1);
              expect(result[0] === ancestor[0]).to.equal(true);
          });
        });

        describe('.ancestor()', function () {
          it('.ancestor() for an single, detached element should return an empty collection', function () {
              var subject = Pablo.g(),
                  result = subject.ancestor();

              expect(result.length).to.equal(0);
          });
        });

        describe('.root()', function () {
          it('.root() should return the pablo wrapped top most <svg> root element of each element in the Pablo collection.', function () {
            var subject = Pablo(document.createElement('div')),
                deepChild;

            subject.svg().circle().ellipse().g().rect().a();
            deepChild = subject.find('a');
            
            expect(deepChild.root()[0] instanceof SVGSVGElement).to.equal(true);
          });

          it('.root() should return the pablo wrapped top most <svg> root element of each element in the Pablo collection (multiple elements).', function () {
              var htmlContainer = Pablo(document.createElement('div')),
                  rootA         = Pablo.svg({id: 'A'}),
                  rootB         = Pablo.svg({id: 'B'}),
                  collection;

              rootA.svg().circle();
              rootB.svg().circle();

              htmlContainer.append([rootA, rootB]);

              collection = htmlContainer.find('circle');
              expect(collection.root().length).to.equal(2);
              expect(collection.root()[0].getAttribute('id')).to.equal('A');
              expect(collection.root()[1].getAttribute('id')).to.equal('B');
          });

          it('should have the "this" context of the callback be the subject collection', function () {
            var collection = Pablo.rect();
            collection.root(function () {
              expect(this).to.equal(collection);
            });
          });
        });

        describe('.owner()', function () {
          it('.owner() should return the closest <svg> ancestor element of the Pablo collection wrapped as a Pablo collection.', function () {
            var subject = Pablo(document.createElement('div')),
                deepChild;

            subject.svg().circle().svg({foo: 'bar'}).circle().g().a(),
            deepChild = subject.find('a');
            
            expect(deepChild.owner()[0].getAttribute('foo')).to.equal('bar');
          });
        });

        describe('.owners()', function () {
          it('.owners() should a pablo collection of the all <svg> ancestor element\'s of the Pablo collection from closest to furthest.', function () {
            var subject = Pablo(document.createElement('div')),
                deepChild;

            subject.svg({fiz: 'buz'}).circle().svg({foo: 'bar'}).circle().a(),
            deepChild = subject.find('a');
            
            expect(deepChild.owners()[0].getAttribute('foo')).to.equal('bar');
            expect(deepChild.owners()[1].getAttribute('fiz')).to.equal('buz');
          });
        });

        describe('.viewport', function () {
          it('should return the PabloCollection\'s closest viewport element', function () {
            var collection = Pablo.svg(),
                foundViewport;

            collection.circle().svg({'expected':'true'}).rect();
            foundViewport = collection.find('rect').viewport();

            expect(foundViewport.attr('expected')).to.equal('true');
            expect(foundViewport.length).to.equal(1);
          });

          it('should return the PabloCollection\'s (multiple) closest viewport element', function () {
            var collection = Pablo.rect(),
                testCollection,
                viewports;

            collection.svg().a().svg({'vp':'a'}).circle();
            collection.svg().a().svg({'vp':'b'}).ellipse();
          
            testCollection = Pablo([
                                collection.find('circle'),
                                collection.find('ellipse')
                              ]);

            viewports = testCollection.viewport();

            expect(viewports.length).to.equal(2);
            expect(viewports.eq(0).attr('vp')).to.equal('a');
            expect(viewports.eq(1).attr('vp')).to.equal('b');
          });

          it('should have the "this" context of the callback be the subject collection', function () {
            var collection = Pablo.rect();
            collection.viewport(function () {
              expect(this).to.equal(collection);
            });
          });
        });

        describe('.viewports', function () {
          it('should return the PabloCollection\'s viewport elements from the closest to furthest ancestor', function () {
            var collection = Pablo.svg({'vp':'b'}),
                foundViewports;

            collection.circle().svg({'vp':'a'}).rect();
            foundViewports = collection.find('rect').viewports();

            expect(foundViewports.length).to.equal(2);
            expect(foundViewports.eq(0).attr('vp')).to.equal('a');
            expect(foundViewports.eq(1).attr('vp')).to.equal('b');
          });

          it('should return the PabloCollection\'s (multiple) viewport elements from the closest to furthest ancestor', function () {
            var collection = Pablo.rect(),
                testCollection,
                viewports;

            collection.svg({'vp':'b'}).a().svg({'vp':'a'}).circle();
            collection.svg({'vp':'d'}).a().svg({'vp':'c'}).ellipse();
          
            testCollection = Pablo([
                                collection.find('circle'),
                                collection.find('ellipse')
                              ]);

            viewports = testCollection.viewports();

            expect(viewports.length).to.equal(4);
            expect(viewports.eq(0).attr('vp')).to.equal('a');
            expect(viewports.eq(1).attr('vp')).to.equal('b');
            expect(viewports.eq(2).attr('vp')).to.equal('c');
            expect(viewports.eq(3).attr('vp')).to.equal('d');
          });

          it('should have the "this" context of the callback be the subject collection', function () {
            var collection = Pablo.rect();
            collection.viewports(function () {
              expect(this).to.equal(collection);
            });
          });
        });

        describe('.siblings()', function () {
          it('.siblings() should return the sibling elements as PabloCollections', function () {
            var aSibling = document.getElementById('test-subject-a'),
                siblings = Pablo(aSibling).siblings();

            expect(siblings.length).to.equal(2);
            expect(siblings instanceof Pablo.Collection).to.equal(true);
            expect(siblings[0].id).to.equal('test-subject-b');
            expect(siblings[1].id).to.equal('test-subject-c');
          });

          it('should have the "this" context of the callback be the subject collection', function () {
            var collection = Pablo.rect();
            collection.siblings(function () {
              expect(this).to.equal(collection);
            });
          });
        });

        describe('.nextSiblings()', function () {
          it('.nextSiblings() should return the next sibling elements of the PabloCollections as PabloCollections', function () {
            var subject = Pablo.rect().append([Pablo.a(),
                Pablo.g(),
                Pablo.ellipse(),
                Pablo.circle()
              ]),
              siblings = subject.children().eq(1).nextSiblings();

            expect(siblings.length).to.equal(2);
            expect(siblings instanceof Pablo.Collection).to.equal(true);
            expect(siblings[0] instanceof SVGEllipseElement).to.equal(true);
            expect(siblings[1] instanceof SVGCircleElement).to.equal(true);
          });

          it('should have the "this" context of the callback be the subject collection', function () {
            var collection = Pablo.rect();
            collection.nextSiblings(function () {
              expect(this).to.equal(collection);
            });
          });
        });

        describe('.prevSiblings()', function () {
          it('.prevSiblings() should return the previous sibling elements of the PabloCollection as PabloCollections', function () {
            var subject = Pablo.rect().append([Pablo.a(),
              Pablo.g(),
              Pablo.ellipse(),
              Pablo.circle()
            ]),
            siblings = subject.children().eq(3).prevSiblings();

            siblings.reverse();

            expect(siblings.length).to.equal(3);
            expect(siblings instanceof Pablo.Collection).to.equal(true);
            expect(siblings[0] instanceof SVGAElement).to.equal(true);
            expect(siblings[1] instanceof SVGGElement).to.equal(true);
            expect(siblings[2] instanceof SVGEllipseElement).to.equal(true);
          });

          it('should have the "this" context of the callback be the subject collection', function () {
            var collection = Pablo.rect();
            collection.prevSiblings(function () {
              expect(this).to.equal(collection);
            });
          });
        });

        describe('.prev()', function () {
          it('.prev() should return the element\'s previous sibling as a PabloCollection', function () {
            var b = Pablo('#test-subject-b');

            expect(b.prev()[0].id).to.equal('test-subject-a');
            expect(b.prev() instanceof Pablo.Collection).to.equal(true);
          });

          it('should have the "this" context of the callback be the subject collection', function () {
            var collection = Pablo.rect();
            collection.prev(function () {
              expect(this).to.equal(collection);
            });
          });
        });

        describe('.next()', function () {
          it('.next() should return the element\'s next sibling as a PabloCollection', function () {
            var b = Pablo('#test-subject-b');

            expect(b.next()[0].id).to.equal('test-subject-c');
            expect(b.next() instanceof Pablo.Collection).to.equal(true);
          });

          it('should have the "this" context of the callback be the subject collection', function () {
            var collection = Pablo.rect();
            collection.next(function () {
              expect(this).to.equal(collection);
            });
          });
        });

        describe('.traverse()', function () {
          it('.traverse(propertyRoute, [function]) should return a new PabloCollection. This collection should comprise of every matching element of the passed property of each element until the function argument returns false.', function () {
            var subject = Pablo.g(),
                firstChild, traversed;

            Pablo.rect()
              .duplicate(4)
              .addClass(function(el, i){
                return 'child-' + i;
              })
              .appendTo(subject);

            firstChild = subject.children().eq(0);
            traversed = firstChild.traverse('nextSibling', function(el, i){
              expect(typeof i).to.equal('number');

              if (Pablo(el).attr('class') !== 'child-3'){
                return true;
              }
            });

            expect(traversed.length).to.equal(2);
            expect(Pablo(traversed[0]).attr('class')).to.equal('child-1');
            expect(Pablo(traversed[1]).attr('class')).to.equal('child-2');
          });
        });

        // TODO: test passing `null` to traverse()

        describe('.find()', function () {
          it('.find(selectors) should return a PabloCollection representative of the matched argument', function () {
            var subject = Pablo('#test-subjects').find('li');

            expect(subject instanceof Pablo.Collection).to.equal(true);
            expect(subject.length).to.equal(3);
            expect(subject[0].id).to.equal('test-subject-a');
            expect(subject[1].id).to.equal('test-subject-b');
            expect(subject[2].id).to.equal('test-subject-c');
          });
        });

        describe('.get()', function () {
          it('.get(index) should return the SVGElement or HTMLElement of the specified index', function () {
            var subject = Pablo('#test-subjects').children(),
                chosenOne   = subject[1];

            expect(chosenOne instanceof Pablo.Collection).to.equal(false);
            expect(chosenOne.id).to.equal('test-subject-b');
          });
        });

        describe('.eq()', function () {
          it('.eq(index) should a PabloCollection of the specified index', function () {
            var subject = Pablo('#test-subjects').children(),
                chosenOne   = subject.eq(1);

            expect(chosenOne instanceof Pablo.Collection).to.equal(true);
            expect(chosenOne[0].id).to.equal('test-subject-b');
          });
        });

        describe('.first()', function () {
          it('.first() returns the first element in a PabloCollection as a PabloCollection', function () {
            var first = Pablo('#test-subjects').children().first();

            expect(first[0].id).to.equal('test-subject-a');
            expect(first instanceof Pablo.Collection).to.equal(true);
          });
        });

        describe('.last()', function () {
          it('.last() returns the last element in a PabloCollection as a PabloCollection', function () {
            var last = Pablo('#test-subjects').children().last();

            expect(last[0].id).to.equal('test-subject-c');
            expect(last instanceof Pablo.Collection).to.equal(true);
          });
        });

        describe('.firstChild()', function () {
          it('firstChild() should return a PabloCollection', function () {
            var subject = Pablo.rect().append([Pablo.a(), Pablo.g(), Pablo.rect()]),
                child;

            expect(subject.firstChild()[0] instanceof SVGAElement).to.equal(true);
          });

          it('should have the "this" context of the callback be the subject collection', function () {
            var collection = Pablo.rect();
            collection.firstChild(function () {
              expect(this).to.equal(collection);
            });
          });
        });

        describe('.lastChild()', function () {
          it('lastChild() should return a PabloCollection', function () {
            var subject = Pablo.rect().append([Pablo.a(), Pablo.g(), Pablo.rect()]),
                child;

            expect(subject.lastChild()[0] instanceof SVGRectElement).to.equal(true);
          });

          it('should have the "this" context of the callback be the subject collection', function () {
            var collection = Pablo.rect();
            collection.lastChild(function () {
              expect(this).to.equal(collection);
            });
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
            expect(Pablo('#test-subjects').attr('id')).to.equal('test-subjects');
          });

          it('.attr(attributeName, attributeValue) should set the value of the specified attribute of the element', function () {
            var subject = Pablo('#test-subjects');
            subject.attr('foo', 'bar');

            expect(subject[0].getAttribute('foo')).to.equal('bar');

            subject[0].removeAttribute('foo');
          });

          it('.attr(attributes)', function () {
            var subject = Pablo('#test-subjects');

            subject.attr({
              'foo':'bar',
              'zoo':'zar'
            });

            expect(subject[0].getAttribute('foo')).to.equal('bar');
            expect(subject[0].getAttribute('zoo')).to.equal('zar');

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

            expect(subject[0].getAttribute('foo')).to.equal('bar');
            expect(subject[0].getAttribute('zip')).to.equal('zop');
            subject[0].removeAttribute('foo');
            subject[0].removeAttribute('zip');
          });

          it('.attr(attributes) attribute value as an Array', function () {
            var subject = Pablo('#test-subjects li');

            subject.attr({
              foo: ['a', 'b', 'c', 'd']
            });

            subject.attr('bar', ['d', 'e', 'f']);

            expect(subject[0].getAttribute('foo')).to.equal('a');
            expect(subject[1].getAttribute('foo')).to.equal('b');
            expect(subject[2].getAttribute('foo')).to.equal('c');
            expect(subject[0].getAttribute('bar')).to.equal('d');
            expect(subject[1].getAttribute('bar')).to.equal('e');
            expect(subject[2].getAttribute('bar')).to.equal('f');

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
            expect(subject[0].getAttribute('foo')).to.equal('bar');
            subject.removeAttr('foo');
            expect(subject[0].getAttribute('foo')).to.equal(null);
          });
        });

        describe('.transform()', function () {
          it('.transform(functionName, value) should add a transform attribute and value to the element', function () {
            var subject = Pablo([Pablo.rect(), Pablo.rect()]);

            subject.transform('rotate', '45 50 50');

            expect(subject[0].getAttribute('transform')).to.equal('rotate(45 50 50)');
            expect(subject[1].getAttribute('transform')).to.equal('rotate(45 50 50)');
          });
        });

        describe('.css()', function () {
          it('.css(property) should return the specified css property of the element', function () {
            expect(Pablo('#test-subjects').css('display')).to.equal('none');
          });

          it('.css(property, value) should set the specified css property of the element', function () {
            var subject = Pablo('#test-subjects');

            subject.css('font-size', '20px');

            expect(subject.css('font-size')).to.equal('20px');
            resetTestSubjectStyles();
          });

          it('.css(styles) should set the specified css properties of the element in relation to the styles map', function () {
            var subject = Pablo('#test-subjects').css({
                  'font-size':   '20px',
                  'font-weight': 'bold'
                }),
                result1 = subject.css('font-weight'),
                result2 = subject.css('font-size');

            expect(result1).to.be.a('string');
            expect(result1.length > 0).to.equal(true);
            expect(result2).to.be.a('string');
            expect(result2.length > 0).to.equal(true);
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

            expect(appliedWithPrefix).to.equal(true);

            resetTestSubjectStyles();
          });

          it('.cssPrefix(prop) should return the value of the css property of the element', function () {
            var subject = Pablo('#test-subjects');
            subject.cssPrefix('transition', 'opacity 0.5s');
            expect(subject.cssPrefix('transition').indexOf('opacity 0.5s')).to.equal(0);
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

            expect(appliedWithPrefix1).to.equal(true);
            expect(appliedWithPrefix2).to.equal(true);
          });
        });

        describe('.getValue()', function () {
          it('.getValue()', function () {
            var collection = Pablo(['g', 'a', 'rect']),
                val1 = 5,
                val2 = "foo",
                val3 = [1,2,3],
                val4 = function(el, i){
                  return el.nodeName + '-' + i;
                };

            collection.each(function(el, i){
              var result1 = this.getValue(val1, i),
                  result2 = this.getValue(val2, i),
                  result3 = this.getValue(val3, i),
                  result4 = this.getValue(val4, i);

              expect(result1).to.equal(val1);
              expect(result2).to.equal(val2);
              expect(result3).to.equal(val3[i]);
              expect(result4).to.equal(el.nodeName + '-' + i);
            });
          });
        });

        describe('.addClass()', function () {
          it('.addClass(className) should set the class attribute on the element with the passed string', function () {
            var subject = Pablo('#test-subjects');

            subject.addClass('foo');

            expect(subject[0].getAttribute('class')).to.equal('foo');

            subject[0].removeAttribute('class');
          });
        });

        describe('.removeClass()', function () {
          it('.removeClass(className) should remove the class of the element matching the passed string', function () {
            var subject = Pablo('#test-subjects');

            subject[0].setAttribute('class', 'foo');
            expect(subject[0].getAttribute('class')).to.equal('foo');

            subject.removeClass('foo');

            expect(subject[0].getAttribute('class')).to.equal('');
            subject[0].removeAttribute('class');
          });
        });

        describe('.hasClass', function () {
          it('.hasClass(className) should return true or false based on if the element has that class name', function () {
            var subject = Pablo('#test-subjects');

            subject[0].setAttribute('class', 'foo');

            expect(Pablo(subject).hasClass('foo')).to.equal(true);
            expect(Pablo(subject).hasClass('bar')).to.equal(false);

            subject[0].removeAttribute('class');
          });
        });

        describe('.toggleClass()', function () {
          it('.toggleClass(className) should set the class on the element if it does not already have it and vice versa', function () {
            var subject = Pablo('#test-subjects');

            subject[0].setAttribute('class', 'foo');

            expect(subject[0].getAttribute('class')).to.equal('foo');

            subject.toggleClass('foo');
            expect(subject[0].getAttribute('class')).to.equal('');

            subject.toggleClass('foo');
            expect(subject[0].getAttribute('class')).to.equal('foo');

            subject[0].removeAttribute('class');
          });
        });

        describe('.content()', function () {
          it('.content() should gets the textContent property of the element', function () {
            var subject = Pablo(document.createElement('a'));

            subject[0].textContent = 'foo';

            expect(subject.content()).to.equal('foo');
          });

          it('.content(text) should sets the textContent property of the element', function () {
            var subject = Pablo(document.createElement('a'));

            subject.content('foo');

            expect(subject[0].textContent).to.equal('foo');
          });
        });
      });

      describe('Collection manipulation', function () {
        describe('.toArray()', function () {
          it('.toArray()', function () {
            var subject = Pablo.a(),
                asArray     = subject.toArray();

            expect(asArray instanceof Array).to.equal(true);
            expect(asArray.css).to.equal(undefined);
          });
        });

        describe('.size()', function () {
          it('.size()', function () {
            var subject = Pablo('#test-subjects li');

            expect(subject.size() === subject.length)
              .to.equal(true);
          });
        });

        describe('.push() alias .add()', function () {
          it('.push(elements)/.add(elements) should mutate the Pablo Collection and return itself', function () {
            var subject = Pablo('#test-subjects li'),
                returned    = subject.push([Pablo.rect(), Pablo.circle()]);

            expect(returned).to.equal(subject);
            expect(subject.length).to.equal(5);
            expect(subject[0].id).to.equal('test-subject-a');
            expect(subject[1].id).to.equal('test-subject-b');
            expect(subject[2].id).to.equal('test-subject-c');
            expect(subject[3] instanceof SVGRectElement).to.equal(true);
            expect(subject[4] instanceof SVGCircleElement).to.equal(true);
          });
          it('.push(elements...)/.add(elements...) as argument list should mutate the Pablo Collection and return itself', function () {
            var subject = Pablo('#test-subjects li'),
                returned    = subject.push(Pablo.rect(), Pablo.circle());

            expect(returned).to.equal(subject);
            expect(subject.length).to.equal(5);
            expect(subject[0].id).to.equal('test-subject-a');
            expect(subject[1].id).to.equal('test-subject-b');
            expect(subject[2].id).to.equal('test-subject-c');
            expect(subject[3] instanceof SVGRectElement).to.equal(true);
            expect(subject[4] instanceof SVGCircleElement).to.equal(true);
          });
        });

        describe('.concat()', function () {
          it('.concat(elements) should return a Pablo Collection and maintain the original', function () {
            var subject = Pablo('#test-subjects li'),
                returned    = subject.concat([Pablo.rect(), Pablo.circle()]);

            expect(subject.length).to.equal(3);
            expect(returned.length).to.equal(5);
            expect(returned[0].id).to.equal('test-subject-a');
            expect(returned[1].id).to.equal('test-subject-b');
            expect(returned[2].id).to.equal('test-subject-c');
            expect(returned[3] instanceof SVGRectElement).to.equal(true);
            expect(returned[4] instanceof SVGCircleElement).to.equal(true);
          });

          it('.concat(elements...) as argument list should return a Pablo Collection and maintain the original', function () {
            var subject = Pablo('#test-subjects li'),
                returned    = subject.concat(Pablo.rect(), Pablo.circle());

            expect(subject.length).to.equal(3);
            expect(returned.length).to.equal(5);
            expect(returned[0].id).to.equal('test-subject-a');
            expect(returned[1].id).to.equal('test-subject-b');
            expect(returned[2].id).to.equal('test-subject-c');
            expect(returned[3] instanceof SVGRectElement).to.equal(true);
            expect(returned[4] instanceof SVGCircleElement).to.equal(true);
          });
        });

        describe('.unshift()', function () {
          it('.unshift(elements) should mutate the Pablo Collection and return itself', function () {
            var subject = Pablo('#test-subjects li'),
                returned    = subject.unshift([Pablo.rect(), Pablo.circle()]);

            expect(returned).to.equal(subject);
            expect(subject.length).to.equal(5);
            expect(subject[0] instanceof SVGRectElement).to.equal(true);
            expect(subject[1] instanceof SVGCircleElement).to.equal(true);
            expect(subject[2].id).to.equal('test-subject-a');
            expect(subject[3].id).to.equal('test-subject-b');
            expect(subject[4].id).to.equal('test-subject-c');
          });

          it('.unshift(elements...) as argument list should mutate the Pablo Collection and return itself', function () {
            var subject = Pablo('#test-subjects li'),
                returned    = subject.unshift(Pablo.rect(), Pablo.circle());

            expect(returned).to.equal(subject);
            expect(subject.length).to.equal(5);
            expect(subject[0] instanceof SVGRectElement).to.equal(true);
            expect(subject[1] instanceof SVGCircleElement).to.equal(true);
            expect(subject[2].id).to.equal('test-subject-a');
            expect(subject[3].id).to.equal('test-subject-b');
            expect(subject[4].id).to.equal('test-subject-c');
          });
        });

        describe('.pop()', function () {
          it('.pop() should returned the last element in a Pablo Collection and mutate the subject collection', function () {
            var subject = Pablo('#test-subjects li'),
                popped      = subject.pop();

            expect(subject.length).to.equal(2);
            expect(subject[0].id).to.equal('test-subject-a');
            expect(subject[1].id).to.equal('test-subject-b');
            expect(popped[0].id).to.equal('test-subject-c');
          });
        });

        describe('.shift()', function () {
          it('.shift() should return and mutate the subject Pablo Collection', function () {
            var subject = Pablo('#test-subjects li'),
                shifted     = subject.shift();

            expect(subject.length).to.equal(2);
            expect(subject[0].id).to.equal('test-subject-b');
            expect(subject[1].id).to.equal('test-subject-c');
            expect(shifted[0].id).to.equal('test-subject-a');
          });
        });

        describe('.slice()', function () {
          it('.slice(begin) should return a fresh Pablo Collection and maintain the old one', function () {
            var subject = Pablo('#test-subjects li'),
                newCopy     = subject.slice(1);

            expect(subject.length).to.equal(3);
            expect(newCopy.length).to.equal(2);
            expect(newCopy[0].id).to.equal('test-subject-b');
            expect(newCopy[1].id).to.equal('test-subject-c');
          });

          it('.slice(begin, [end]) should return a fresh Pablo Collection and maintain the old one', function () {
            var subject = Pablo('#test-subjects li'),
                newCopy     = subject.slice(0,2);

            expect(subject.length).to.equal(3);
            expect(newCopy.length).to.equal(2);
            expect(newCopy[0].id).to.equal('test-subject-a');
            expect(newCopy[1].id).to.equal('test-subject-b');
          });
        });

        describe('.reverse()', function () {
          it('.reverse() should mutate the PabloCollection by reversing its element order', function () {
            var a = Pablo.a(),
                rect = Pablo.rect(),
                ellipse = Pablo.ellipse(),
                subject  = Pablo([a, rect, ellipse]),
                expected;

            expect(subject[0].nodeName).to.equal('a');
            expect(subject[1].nodeName).to.equal('rect');
            expect(subject[2].nodeName).to.equal('ellipse');
            expected = subject.reverse();

            expect(subject).to.equal(expected);
            expect(subject[0].nodeName).to.equal('ellipse');
            expect(subject[1].nodeName).to.equal('rect');
            expect(subject[2].nodeName).to.equal('a');
          });
        });
      });
      
      describe('Collection iteration', function () {
        describe('.each()/.forEach()', function () {
          it('should iterate over a collection with only one element', function () {
            var subject = Pablo.rect(),
                iterationIndices = [],
                pabloItems       = [];

            subject.each(function (item, i) {
              iterationIndices.push(i);
              pabloItems.push(item);
            });

            expect(pabloItems.length).to.equal(1);
            expect(pabloItems[0] instanceof SVGRectElement).to.equal(true);
            expect(iterationIndices[0]).to.equal(0);
          });

          it('should iterate over a collection of multiple elements, passing each element to the callback', function () {
            var subject = Pablo([Pablo.rect(), Pablo.circle(), Pablo.a()]),
                iterationIndices = [],
                pabloItems       = [];

            subject.each(function (item, i) {
              iterationIndices.push(i);
              pabloItems.push(item);
            });

            expect(pabloItems.length).to.equal(3);
            expect(pabloItems[0] instanceof SVGRectElement).to.equal(true);
            expect(pabloItems[1] instanceof SVGCircleElement).to.equal(true);
            expect(pabloItems[2] instanceof SVGAElement).to.equal(true);
            expect(iterationIndices[0]).to.equal(0);
            expect(iterationIndices[1]).to.equal(1);
            expect(iterationIndices[2]).to.equal(2);
          });

          
          it('should not call callback if collection contains no elements', function () {
            var subject = Pablo(),
                iterationIndices = [],
                callbackCalled = false;

            subject.each(function (item, i) {
              iterationIndices.push(i);
              callbackCalled = true;
            });

            expect(iterationIndices.length).to.equal(0);
            expect(callbackCalled).to.equal(false);
          });

          it('should set the `this` context of the callback to the original if the collection contains one element', function () {
            var collection = Pablo.rect();
            collection.each(function () {
              expect(this).to.equal(collection);
            });
          });

          it('should set the `this` context of the callback to the original if the collection contains multiple elements', function () {
            var collection = Pablo.rect();
            collection.each(function () {
              expect(this).to.equal(collection);
            });
          });

          it('.each(callback, context)/.forEach(callback, context) should apply `this` within the callback to the passed context', function () {
            var subject      = Pablo([Pablo.rect(), Pablo.circle(), Pablo.a()]),
                iterationIndices = [],
                pabloItems       = [],
                context          = {foo:'bar'},
                contextWasCorrect;

            subject.each(function (item, i) {
              iterationIndices.push(i);
              pabloItems.push(item);
              if (this.foo === 'bar') {
                contextWasCorrect = true;
              }
            }, context);
            
            expect(pabloItems[0] instanceof SVGRectElement).to.equal(true);
            expect(pabloItems[1] instanceof SVGCircleElement).to.equal(true);
            expect(pabloItems[2] instanceof SVGAElement).to.equal(true);
            expect(iterationIndices[0]).to.equal(0);
            expect(iterationIndices[1]).to.equal(1);
            expect(iterationIndices[2]).to.equal(2);
            expect(contextWasCorrect).to.equal(true);
          });
        });

        describe('.map()', function () {
          it('.map(iterator) returns a new array comprising of the total returned elements from the iteration callback', function () {
            var mapped = Pablo([Pablo.rect(), Pablo.circle()]).map(function (item, i) {
              return item;
            });

            expect(mapped[0] instanceof SVGRectElement).to.equal(true);
            expect(mapped[1] instanceof SVGCircleElement).to.equal(true);
          });

          it('.map(iterator) within the map callback; returning a Pablo collection of 2 or more elements should have both in the returned Pablo collection', function () {
            var context = {foo:'bar'},
                mapped = Pablo([Pablo.rect(), Pablo.circle()]).map(function (item, i) {
                  return Pablo([Pablo.ellipse(), Pablo.a()]);
                }, context);

            expect(mapped[0] instanceof SVGEllipseElement).to.equal(true);
            expect(mapped[1] instanceof SVGAElement).to.equal(true);
            expect(mapped[2] instanceof SVGEllipseElement).to.equal(true);
            expect(mapped[3] instanceof SVGAElement).to.equal(true);
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

            expect(mapped[0] instanceof SVGRectElement).to.equal(true);
            expect(mapped[1] instanceof SVGCircleElement).to.equal(true);
            expect(contextWasCorrect).to.equal(true);
          });

          it('should have the "this" context of the callback be the subject collection', function () {
            var collection = Pablo.rect();
            collection.map(function () {
              expect(this).to.equal(collection);
            });
          });
        });

        describe('.sort()', function () {
          it('.sort(function) should sort the collection based on the negativity of the returned value callback iteration', function () {
            var unsorted = Pablo([Pablo.a({'n':2}), Pablo.a({'n':3}), Pablo.a({'n':1})]);

            unsorted.sort(function (a, b) {
              return parseInt(a.getAttribute('n')) - parseInt(b.getAttribute('n'));
            });

            expect(unsorted[0].getAttribute('n')).to.equal('1');
            expect(unsorted[1].getAttribute('n')).to.equal('2');
            expect(unsorted[2].getAttribute('n')).to.equal('3');
          });

          it('should have the "this" context of the callback be the subject collection', function () {
            var collection = Pablo.rect();
            collection.sort(function () {
              expect(this).to.equal(collection);
            });
          });
        });

        describe('.pluck()', function () {
          it('.pluck(property) should return an array of values of default type attributes for each element in the collection', function () {
            var subject = Pablo([
                                Pablo.rect({foo: '123'}),
                                Pablo.ellipse({foo: '456'})
                              ]),
                arr = subject.pluck('foo');

            expect(arr[0]).to.equal('123');
            expect(arr[1]).to.equal('456');
          });

          it('.pluck(property, [attr]) should return an array of values of the type attributes for each element in the collection', function () {
            var subject = Pablo([
                                Pablo.rect({foo: '123'}),
                                Pablo.ellipse({foo: '456'})
                              ]),
                arr = subject.pluck('foo','attr');

            expect(arr[0]).to.equal('123');
            expect(arr[1]).to.equal('456');
          });

          it('.pluck(property, [prop]) like above but with the type being a property set on the object', function () {
            var subject = Pablo([Pablo.rect(), Pablo.ellipse()]),
                arr;
            
            subject[0].foo = '123';
            subject[1].foo = '456';

            arr = subject.pluck('foo', 'prop');

            expect(arr[0]).to.equal('123');
            expect(arr[1]).to.equal('456');
          });

          it('.pluck(property, [data]) like above but with the type being a pablo data value', function () {
            var subject = Pablo([Pablo.rect(), Pablo.ellipse()]),
                arr;

            subject.eq(0).data('foo', '123');
            subject.eq(1).data('foo', '456');

            arr = subject.pluck('foo', 'data');

            expect(arr[0]).to.equal('123');
            expect(arr[1]).to.equal('456');
          });

          it('.pluck(property, [css]) like above but with the type being a css rule', function () {
            var subject = Pablo([
                  Pablo.g().css({display: 'block'}),
                  Pablo.g().css({display: 'inline'})
                ]),
                arr;

            arr = subject.pluck('display', 'css');

            expect(arr[0]).to.equal('block');
            expect(arr[1]).to.equal('inline');
          });

          it('.pluck(property, [cssPrefix]) like above but with the type being a prefixed css rule', function () {
            var subject = Pablo([Pablo.rect(), Pablo.ellipse()]),
                arr;

            subject.eq(0).cssPrefix('transition', 'opacity 0.1s');
            subject.eq(1).cssPrefix('transition', 'opacity 1s');
            
            arr = subject.pluck('transition', 'cssPrefix');

            // Note, in Firefox, style properties may be changed from the that supplied
            // to the css(key, val) setter
            expect(arr[0].indexOf('opacity 0.1s')).to.equal(0);
            expect(arr[1].indexOf('opacity 1s')).to.equal(0);
          });
        });

        describe('.select()', function () {
          it('.select(function) should return a new collection containing each element for which the callback function returns true', function () {
            var a = Pablo.a(),
                rect = Pablo.rect(),
                ellipse = Pablo.ellipse(),
                reference  = Pablo([a, rect, ellipse]),
                expected, subject1, subject2;

            subject1 = reference.select(function (el, i) {
              return true;
            });

            expect(subject1.length).to.equal(3);
            expect(subject1[0]).to.equal(a[0]);
            expect(subject1[1]).to.equal(rect[0]);
            expect(subject1[2]).to.equal(ellipse[0]);

            subject2 = reference.select(function (el, i) {
              if (el instanceof SVGAElement) {
                return true;
              }
            });

            expect(subject2.length).to.equal(1);
            expect(subject2[0]).to.equal(a[0]);
          });

          it('should have the "this" context of the callback be the subject collection', function () {
            var collection = Pablo.rect();
            collection.select(function () {
              expect(this).to.equal(collection);
            });
          });
        });

        describe('.every()', function () {
          it('.every(function) should return true if all values in the PabloCollection pass the test function', function () {
            var subject = Pablo([
                            Pablo.a({foo:'bar'}),
                            Pablo.a({foo:'bar'}),
                            Pablo.a({foo:'bar'})
                          ]),
                          outcome1, outcome2;

            function test (item, i) {
              if (item.getAttribute('foo') === 'bar') {
                return true;
              } else {
                return false;
              }
            }

            outcome1 = subject.every(test);
            subject[1].setAttribute('foo', 'wrong');
            outcome2 = subject.every(test);
            
            expect(outcome1).to.equal(true);
            expect(outcome2).to.equal(false);
          });

          it('.every(selector) should return true if all values in the PabloCollection pass the test selector)', function () {
            var subject = Pablo.circle();

            subject.add(Pablo.circle());
            subject.add(Pablo.circle());

            expect(subject.every('circle')).to.equal(true);

            subject.add(Pablo.rect());
            
            expect(subject.every('circle')).to.equal(false);
          });

          it('should have the "this" context of the callback be the subject collection', function () {
            var collection = Pablo.rect();
            collection.every(function () {
              expect(this).to.equal(collection);
            });
          });
        });
      });

      describe('Misc', function () {
        describe('.make()', function () {
          it('.make(svgName) should return a native SVG element with the supplied name', function () {
            var a       = Pablo.make('a'),
                ellipse = Pablo.make('ellipse'),
                circle  = Pablo.make('circle'),
                rect    = Pablo.make('rect');

            expect(a instanceof SVGAElement).to.equal(true);
            expect(ellipse instanceof SVGEllipseElement).to.equal(true);
            expect(circle instanceof SVGCircleElement).to.equal(true);
            expect(rect instanceof SVGRectElement).to.equal(true);
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
          it('.clone(false) should return a shallow DOM copy (excludes children) of the PabloCollection', function () {
            var original = Pablo.rect({foo: 'bar'}),
                clone;

            original.append(Pablo.rect());

            clone = original.clone(false);

            expect(clone instanceof Pablo.Collection).to.equal(true);
            expect(clone[0] instanceof SVGRectElement).to.equal(true);
            expect(clone[0].getAttribute('foo')).to.equal('bar');
            expect(clone[0].childNodes.length).to.equal(0);
          });

          it('.clone(true) should return a deep DOM copy of the PabloCollection', function () {
            var original = Pablo.rect({foo: 'bar'}),
                clone;

            original.append(Pablo.rect());

            clone = original.clone(true);

            expect(clone instanceof Pablo.Collection).to.equal(true);
            expect(clone[0] instanceof SVGRectElement).to.equal(true);
            expect(clone[0].getAttribute('foo')).to.equal('bar');
            expect(clone[0].childNodes.length).to.equal(1);
          });

          it('.clone() should return a deep DOM copy of the PabloCollection (like `true`)', function () {
            var original = Pablo.rect({foo: 'bar'}),
                clone;

            original.append(Pablo.rect());

            clone = original.clone();

            expect(clone instanceof Pablo.Collection).to.equal(true);
            expect(clone[0] instanceof SVGRectElement).to.equal(true);
            expect(clone[0].getAttribute('foo')).to.equal('bar');
            expect(clone[0].childNodes.length).to.equal(1);
          });

          it('.clone(), .clone(false) and .clone(true) excludes data of the PabloCollection', function () {
            var original = Pablo.rect({foo: 'bar'}),
                clone;

            original.data('foo', 'bar');

            [undefined, true, false].forEach(function(deepDom){
              clone = original.clone(deepDom);

              expect(clone instanceof Pablo.Collection).to.equal(true);
              expect(clone[0] instanceof SVGRectElement).to.equal(true);
              expect(clone[0].getAttribute('foo')).to.equal('bar');
              expect(clone.data('foo')).to.equal(undefined);
            });
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

          it('.clone(deepDom, true) should return data of the PabloCollection', function () {
            var original = Pablo.rect(),
                clone;

            original.data('foo', 'bar');

            [undefined, true, false].forEach(function(deepDom){
              clone = original.clone(deepDom, true);
              expect(clone.data('foo')).to.equal('bar');
            });
          });

          it('.clone(deepDom, true) should return a deep copy (includes events) of the PabloCollection', function (done) {
            var original = Pablo.rect(),
                clone, count = 0;

            original.on('foo', function () {
              count ++;
            });

            original
              .clone(false, true).trigger('foo')
              .clone(true, true).trigger('foo');

            expect(count).to.equal(2);
            done();
          });
        });

        describe('.duplicate()', function () {
          it('.duplicate() should change the length of the PabloCollection by duplicating it with itself', function () {
            var subject = Pablo.rect();

            subject.ellipse({foo: 'bar'});

            subject.duplicate();

            expect(subject.length).to.equal(2);
            expect(subject[0] instanceof SVGRectElement).to.equal(true);
            expect(subject[0].firstChild instanceof SVGEllipseElement).to.equal(true);
            expect(subject[0].firstChild.getAttribute('foo')).to.equal('bar');
            expect(subject[1] instanceof SVGRectElement).to.equal(true);
            expect(subject[1].firstChild instanceof SVGEllipseElement).to.equal(true);
            expect(subject[1].firstChild.getAttribute('foo')).to.equal('bar');
          });

          it('.duplicate([repeat]) should change the length of the array up to the specified integer by duplicating it with itself', function () {
            var subject = Pablo.rect();

            subject.ellipse({foo: 'bar'});

            subject.duplicate(2);

            expect(subject.length).to.equal(3);
            expect(subject[0] instanceof SVGRectElement).to.equal(true);
            expect(subject[0].firstChild instanceof SVGEllipseElement).to.equal(true);
            expect(subject[0].firstChild.getAttribute('foo')).to.equal('bar');
            expect(subject[1] instanceof SVGRectElement).to.equal(true);
            expect(subject[1].firstChild instanceof SVGEllipseElement).to.equal(true);
            expect(subject[1].firstChild.getAttribute('foo')).to.equal('bar');
            expect(subject[2] instanceof SVGRectElement).to.equal(true);
            expect(subject[2].firstChild instanceof SVGEllipseElement).to.equal(true);
            expect(subject[2].firstChild.getAttribute('foo')).to.equal('bar');
          });
        });

        describe('.some() alias .is()', function () {
          it('.some(function)/.is(function) should return true or false based on the testing function\'s evaluation', function () {
            var subject    = Pablo([Pablo.rect(), Pablo.rect()]),
                expectTrue,
                expectFalse;

            expectTrue = subject.some(function (item, i) {
              expect(item instanceof SVGRectElement).to.equal(true);
              expect(i).to.be.a('number');
              return true;
            });

            expectFalse = subject.some(function (item, i) {
              return false;
            });

            expect(expectTrue).to.equal(true);
            expect(expectFalse).to.equal(false);
          });

          it('.some(function, context)/.is(function, context) should return true or false based on the testing function\'s evaluation', function () {
            var subject    = Pablo([Pablo.rect(), Pablo.rect()]),
                expectTrue,
                expectFalse,
                context    = {foo: 'bar'};

            expectTrue = subject.some(function (item, i) {
              expect(item instanceof SVGRectElement).to.equal(true);
              expect(i).to.be.a('number');
              expect(this.foo).to.equal('bar');
              return true;
            }, context);

            expectFalse = subject.some(function (item, i) {
              expect(this.foo).to.equal('bar');
              return false;
            }, context);

            expect(expectTrue).to.equal(true);
            expect(expectFalse).to.equal(false);
          });

          it('.some(PabloCollection)/.is(PabloCollection) should return true if the matching PabloCollection is found in the PabloCollection', function () {
            var subject  = Pablo([Pablo.rect(), Pablo.ellipse()]),
                expected = subject.some(subject.eq(1));

            expect(expected).to.equal(true);
          });

          it('.some(HTMLElement)/.is(HTMLElement) should return true if the matching HTMLElement is found in the PabloCollection', function () {
            var subject  = Pablo([document.createElement('span'), document.createElement('a')]),
                expected = subject.some(subject[1]);

            expect(expected).to.equal(true);
          });

          it('.some(SVGElement)/.is(SVGElement) should return true if the matching SVGElement is found in the PabloCollection', function () {
            var subject  = Pablo([Pablo.rect(), Pablo.ellipse()]),
                expected = subject.some(subject[1]);
            
            expect(expected).to.equal(true);
          });

          it('.some(selector)/.is(selector) should return true if the matching tag selector is found in the PabloCollection', function () {
            var subject  = Pablo([Pablo.rect(), Pablo.ellipse()]),
                expected = subject.some('rect');
            
            expect(expected).to.equal(true);
          });

          it('.some(selector)/.is(selector) should return true if the matching id selector is found in the PabloCollection ', function () {
            var subject  = Pablo([Pablo.rect(), Pablo.ellipse({id: 'foo'})]),
                expected = subject.some('#foo');
            
            expect(expected).to.equal(true);
          });

          it('.some(selector)/.is(selector) should return true if the matching selector is found in the detached nested PabloCollection ', function () {
            var span = document.createElement('span'),
                anchor = span.appendChild(document.createElement('a')),
                subject = Pablo(['rect', anchor, 'g']);
            
            expect(subject.some('rect')).to.equal(true);
            expect(subject.some('span a')).to.equal(true);
            expect(subject.some('g')).to.equal(true);
          });

          it('should have the "this" context of the callback be the subject collection', function () {
            var collection = Pablo.rect();
            collection.some(function () {
              expect(this).to.equal(collection);
            });
          });
        });

        describe('.processList()', function () {
          it('processList(list, callback) should return an array of strings given a string of space delimited words', function () {
            var items = [];

            Pablo().processList('foo bar', function (item) {
              items.push(item);
            });

            expect(items[0]).to.equal('foo');
            expect(items[1]).to.equal('bar');
          });
        });

        describe('.canBeWrapped()', function () {
          it('.canBeWrapped(elem) should return true', function () {
            expect(Pablo.canBeWrapped(document.body)).to.equal(true);
          });

          it('.canBeWrapped(jQueryCollection) should return true', function () {
            expect(Pablo.canBeWrapped(jQuery('body'))).to.equal(true);
          });

          it('.canBeWrapped(pabloCollection) should return true', function () {
            expect(Pablo.canBeWrapped(Pablo('body'))).to.equal(true);
          });

          it('.canBeWrapped({}) should return false', function () {
            expect(Pablo.canBeWrapped({})).to.not.equal(true);
          });
        });

        describe('.indexOf/.lastIndexOf', function () {
          it('.indexOf(element)/.lastIndexOf(element) should return the index position in the PabloCollection of the matching node', function () {
            var subject = Pablo([Pablo.circle(), Pablo.a(), Pablo.g()]);

            expect(subject.indexOf(subject[2])).to.equal(2);
          });

          it('.indexOf(element)/.lastIndexOf(element) should return the index position in the PabloCollection of the matching PabloCollection', function () {
            var subject = Pablo([Pablo.circle(), Pablo.a(), Pablo.g()]);

            expect(subject.indexOf(subject.eq(2))).to.equal(2);
          });

          it('.indexOf(element)/.lastIndexOf(element) should return the index position of -1 if no matching node is not found in the PabloCollection', function () {
            var subject = Pablo([Pablo.circle(), Pablo.a(), Pablo.g()]);

            expect(subject.indexOf(Pablo.ellipse())).to.equal(-1);
          });

          it('should have the "this" context of the callback be the subject collection', function () {
            var collection = Pablo.rect();
            collection.indexOf(function () {
              expect(this).to.equal(collection);
            });
          });
        });

        describe('.isArrayLike()', function () {
          it('.isArrayLike(obj) should return true if an array is passed', function () {
            expect(Pablo.isArrayLike([])).to.equal(true);
          });

          it('.isArrayLike(obj) should return true if a PabloCollection is passed', function () {
            expect(Pablo.isArrayLike(Pablo('body'))).to.equal(true);
          });

          it('.isArrayLike(obj) should return true if a NodeList is passed', function () {
            var subject = Pablo('#test-subjects')[0].childNodes;
            expect(Pablo.isArrayLike(Pablo('#test-subjects')[0].childNodes)).to.equal(true);
          });

          it('.isArrayLike(obj) should return true if a jQueryCollection is passed', function () {
            expect(Pablo.isArrayLike(jQuery('body'))).to.equal(true);
          });

          it('.isArrayLike(obj) should return false if a generic object is passed', function () {
            expect(Pablo.isArrayLike({})).to.equal(false);
          });
        });

        describe('.isElement()', function () {
          it('.isElement(obj) should return true if a HTMLElement is passed', function () {
            expect(Pablo.isElement(document.createElement('a'))).to.equal(true);
          });

          it('.isElement(obj) should return true if a SVGElement is passed', function () {
            expect(Pablo.isElement(Pablo.circle()[0])).to.equal(true);
          });

          it('.isElement(obj) should return false if a NodeList is passed', function () {
            expect(Pablo.isElement(Pablo('#test-subjects')[0].childNodes)).to.equal(false);
          });

          it('.isElement(obj) should return false if a jQueryCollection is passed', function () {
            expect(Pablo.isElement(jQuery('body'))).to.equal(false);
          });

          it('.isElement(obj) should return false if a generic object is passed', function () {
            expect(Pablo.isElement({})).to.equal(false);
          });
        });

        describe('.isSVGElement()', function () {
          it('.isSVGElement(obj) should return true if a SVGElement is passed', function () {
            expect(Pablo.isSVGElement(Pablo.circle()[0])).to.equal(true);
          });

          it('.isSVGElement(obj) should return false if a HTMLElement is passed', function () {
            expect(Pablo.isSVGElement(document.createElement('a'))).to.equal(false);
          });

          it('.isSVGElement(obj) should return false if a NodeList is passed', function () {
            expect(Pablo.isSVGElement(Pablo('#test-subjects')[0].childNodes)).to.equal(false);
          });

          it('.isSVGElement(obj) should return false if a jQueryCollection is passed', function () {
            expect(Pablo.isSVGElement(jQuery('body'))).to.equal(false);
          });

          it('.isSVGElement(obj) should return false if a generic object is passed', function () {
            expect(Pablo.isSVGElement({})).to.equal(false);
          });
        });

        describe('.isNodeList()', function () {
          it('.isNodeList(obj) should return true if a NodeList is passed', function () {
            expect(Pablo.isNodeList(Pablo('#test-subjects')[0].childNodes)).to.equal(true);
          });

          it('.isNodeList(obj) should return false if a SVGElement is passed', function () {
            expect(Pablo.isNodeList(Pablo.circle()[0])).to.equal(false);
          });

          it('.isNodeList(obj) should return false if a HTMLElement is passed', function () {
            expect(Pablo.isNodeList(document.createElement('a'))).to.equal(false);
          });

          it('.isNodeList(obj) should return false if a jQueryCollection is passed', function () {
            expect(Pablo.isNodeList(jQuery('body'))).to.equal(false);
          });

          it('.isNodeList(obj) should return false if a generic object is passed', function () {
            expect(Pablo.isNodeList({})).to.equal(false);
          });
        });

        describe('.isDocument()', function () {
          it('.isDocument(obj) should return true if the HTML document object is passed', function () {
            expect(Pablo.isDocument(document)).to.equal(true);
          });

          it('.isDocument(obj) should return false if a NodeList is passed', function () {
            expect(Pablo.isDocument(Pablo('#test-subjects')[0].childNodes)).to.equal(false);
          });

          it('.isDocument(obj) should return false if a SVGElement is passed', function () {
            expect(Pablo.isDocument(Pablo.circle()[0])).to.equal(false);
          });

          it('.isDocument(obj) should return false if a HTMLElement is passed', function () {
            expect(Pablo.isDocument(document.createElement('a'))).to.equal(false);
          });

          it('.isDocument(obj) should return false if a jQueryCollection is passed', function () {
            expect(Pablo.isDocument(jQuery('body'))).to.equal(false);
          });

          it('.isDocument(obj) should return false if a generic object is passed', function () {
            expect(Pablo.isDocument({})).to.equal(false);
          });
        });

        describe('.isPablo()', function () {
          it('.isPablo(obj) should return true if a PabloCollection passed', function () {
            expect(Pablo.isPablo(Pablo())).to.equal(true);
          });

          it('.isPablo(obj) should return false if a NodeList is passed', function () {
            expect(Pablo.isPablo(Pablo('#test-subjects')[0].childNodes)).to.equal(false);
          });

          it('.isPablo(obj) should return false if a SVGElement is passed', function () {
            expect(Pablo.isPablo(Pablo.circle()[0])).to.equal(false);
          });

          it('.isPablo(obj) should return false if a HTMLElement is passed', function () {
            expect(Pablo.isPablo(document.createElement('a'))).to.equal(false);
          });

          it('.isPablo(obj) should return false if a jQueryCollection is passed', function () {
            expect(Pablo.isPablo(jQuery('body'))).to.equal(false);
          });

          it('.isPablo(obj) should return false if a generic object is passed', function () {
            expect(Pablo.isPablo({})).to.equal(false);
          });
        });
        
        describe('.hyphensToCamelCase()', function () {
          it('.hyphensToCamelCase() should return a camel cased string based of the passed hyphenated string', function () {
            var cc = Pablo.hyphensToCamelCase('water-the-plants');
            expect(cc).to.equal('waterThePlants');
          });
        });
      });
    });

    describe('Data', function () {
      it('a PabloCollection which had data previously deleted should have that data if it is added again', function () {
        var subject = Pablo.rect();

        subject.data('foo', 'bar');
        expect(subject.data('foo')).to.equal('bar');

        subject.removeData('foo');
        expect(subject.data('foo')).to.equal(undefined);

        subject.data('foo', 'bar');
        expect(subject.data('foo')).to.equal('bar');
      });

      describe('.data()', function () {
        it('.data(key) should return the set value matching the given key', function () {
          var subject = Pablo.rect();
          subject.data('foo', 'bar');
          expect(subject.data('foo')).to.equal('bar');
        });

        it('.data(key, [value]) should set the given value to the given key', function () {
          var subject = Pablo.rect();
          subject.data('foo', 'bar');
          expect(subject.data('foo')).to.equal('bar');
        });

        it('.data(option) should set a number of key/value pairs representative of the passed mapping', function () {
          var subject = Pablo.rect();

          subject.data({
            foo: 'bar',
            fiz: 123
          });

          expect(subject.data('foo')).to.equal('bar');
          expect(subject.data('fiz')).to.equal(123);
        });
      });

      describe('.removeData()', function () {
        it('.removeData() should remove all the key and value associated with the PabloCollection', function () {
          var subject = Pablo.rect();
          subject.data('foo', 'bar');
          subject.data('fiz', 'buz');
          
          expect(subject.data('foo')).to.equal('bar');
          expect(subject.data('fiz')).to.equal('buz');

          subject.removeData();

          expect(subject.data('foo')).to.equal(undefined);
          expect(subject.data('fiz')).to.equal(undefined);
        });

        it('.removeData([keys]) should remove the key and value associated with the PabloCollection', function () {
          var subject = Pablo.rect();
          subject.data('foo', 'bar');
          subject.data('fiz', 'buz');
          
          expect(subject.data('foo')).to.equal('bar');
          expect(subject.data('fiz')).to.equal('buz');

          subject.removeData('foo');

          expect(subject.data('foo')).to.equal(undefined);
          expect(subject.data('fiz')).to.equal('buz');
        });

        it('.removeData([keys]) multiple keys should remove the keys and values associated with the PabloCollection', function () {
          var subject = Pablo.rect();

          subject.data('foo', 'bar');
          subject.data('fiz', 'buz');
          subject.data('zip', 'zap');

          subject.removeData('foo fiz');

          expect(subject.data('foo')).to.equal(undefined);
          expect(subject.data('fiz')).to.equal(undefined);
          expect(subject.data('zip')).to.equal('zap');
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

          expect(lastEntry.foo).to.equal('bar');
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
          expect(Pablo.cache[lastKey]).to.equal(undefined);
        });
      });

      describe('.detach()', function () {
        it('.detach() should detach the PabloCollection\'s element from its parent but retain its set data', function () {
          var subject = Pablo.rect().append([Pablo.ellipse(), Pablo.line()]);

          subject.data('foo', 'bar');
          subject.children().eq(0).data('foo', 'bar');
          subject.children().eq(1).data('foo', 'bar');

          expect(subject.data('foo')).to.equal('bar');
          expect(subject.children().eq(0).data('foo')).to.equal('bar');
          expect(subject.children().eq(1).data('foo')).to.equal('bar');

          subject.detach();

          expect(subject.data('foo')).to.equal('bar');
          expect(subject.children().eq(0).data('foo')).to.equal('bar');
          expect(subject.children().eq(1).data('foo')).to.equal('bar');
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

          expect(subject.data('foo')).to.equal('bar');
          expect(subject.children().eq(0).data('foo')).to.equal('bar');
          expect(subject.children().eq(1).data('foo')).to.equal('bar');
          expect(subject.children().eq(0).firstChild().data('foo')).to.equal('bar');
          expect(subject.children().eq(1).firstChild().data('foo')).to.equal('bar');

          subject.remove();

          expect(subject.data('foo')).to.equal(undefined);
          expect(subject.children().eq(0).data('foo')).to.equal(undefined);
          expect(subject.children().eq(1).data('foo')).to.equal(undefined);
          expect(subject.children().eq(0).firstChild().data('foo')).to.equal(undefined);
          expect(subject.children().eq(1).firstChild().data('foo')).to.equal(undefined);
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

          expect(subject.data('foo')).to.equal('bar');
          expect(subject.children().eq(0).data('foo')).to.equal('bar');
          expect(subject.children().eq(1).data('foo')).to.equal('bar');
          expect(subject.children().eq(0).firstChild().data('foo')).to.equal('bar');
          expect(subject.children().eq(1).firstChild().data('foo')).to.equal('bar');

          subject.empty();

          expect(subject.data('foo')).to.equal('bar');
          expect(subject.children().eq(0).data('foo')).to.equal(undefined);
          expect(subject.children().eq(1).data('foo')).to.equal(undefined);
          expect(subject.children().eq(0).firstChild().data('foo')).to.equal(undefined);
          expect(subject.children().eq(1).firstChild().data('foo')).to.equal(undefined);
        });
      });
    });

    describe('Events', function () {
      it('.trigger() should trigger an event if the event is removed then added again', function (done) {
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
        it('.trigger(type) should trigger the event matching the passed event name of the PabloCollection', function (done) {
          var subject = Pablo.rect();

          subject.on('click', function () {
            done();
          });

          subject.trigger('click');
        });

        it('.trigger(types) should trigger multiple events matching the passed event names delimited by a space', function (done) {
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

        it('.trigger(types) should trigger on an empty PabloCollection', function (done) {
          var subject = Pablo(),
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

        it('.trigger() should pass arguments on to listener', function (done) {
          var subject = Pablo();

          subject.on('foo', function (event, a, b) {
            expect(event && event.target).to.equal(subject[0]);
            expect(a).to.equal(1);
            expect(b).to.equal(2);
            done();
          });

          subject.trigger('foo', 1, 2);
        });

        it('.trigger() should not fire on delegate elements, i.e. when a selector is given', function () {
          var subject1 = Pablo(),
              subject2 = Pablo('#test-subjects');

          subject1
            .on('foo', '.nonexistent', function (event) {
              new Error('The event should not have fired');
            })
            .trigger('foo', 1, 2);

          subject2.on('click', 'li', function (event, a, b) {
              new Error('The event should not have fired');
            })
            .trigger('click', 1, 2);
        });

        it('.trigger() should provide a custom event object', function () {
          var subject1 = Pablo(),
              subject2 = Pablo('#test-subjects'),
              complete = 0;

          subject1
            .on('foo', function (event) {
              // a delegate event should have the flag pablo `true`
              expect(event && event.pablo).to.equal(true);
              complete ++;
            })
            .trigger('foo', 1, 2);

          subject2.on('click', function (event, a, b) {
              // a delegate event should have the flag pablo `true`
              expect(event && event.pablo).to.equal(true);
              expect(event && typeof event.type).to.equal('string');
              expect(event && Pablo.isElement(event.target)).to.equal(true);
              complete ++;
            })
            .trigger('click', 1, 2);

          expect(complete).to.equal(2);
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

        it('.on(type, listener) should assign an event with an empty PabloCollection', function () {
          var subject = Pablo(),
              complete = 0;

          subject.on('foo', function () {
            complete ++;
          });

          subject.trigger('foo');
          expect(complete).to.equal(1);
        });

        it('.on(type, listener) should be triggered with the element as its scope', function () {
          var subject = Pablo(['g', 'a', 'text']),
              complete = 0;

          subject.on(
              'foo',
              function(event, el){
                expect(event.target).to.equal(el);
                expect(this).to.equal(el);
                complete ++;
              }
          )
          .each(function(el){
            Pablo(el).trigger('foo', el);
          });
          expect(complete).to.equal(3);
        });

        /* Temporarily removed as triggering delegated events doesn't currently work with selectors as expected
        it('.on(type, cssSelectors, listener) should be triggered with the element as its scope', function () {
          var subject = Pablo(['g', 'a', 'text']).append('circle'),
              complete = 0;

          subject.on(
              'foo',
              'circle',
              function(event){
                expect(event.target).to.equal(el);
                expect(this).to.equal(el);
                complete ++;
                console.log(complete);
              }
          )
          .each(function(el){
            Pablo(el).trigger('foo', el);
            console.log(el);
          });
          expect(complete).to.equal(3);
        });

        it('.on(type, selectorFunction, listener) should be triggered with the element as its scope', function () {
          var subject = Pablo(['g', 'a', 'text']).append('circle'),
              complete = 0;

          subject.on(
              'foo',
              function(el){
                return el.nodeName.toLowerCase() !== 'text';
              },
              function(event){
                expect(event.target).to.equal(el);
                expect(this).to.equal(el);
                complete ++;
                console.log(complete);
              }
          )
          .each(function(el){
            Pablo(el).trigger('foo', el);
            console.log(el);
          });
          expect(complete).to.equal(2);
        });
        */

        it('should have the "this" context of the callback be the subject collection', function () {
          var collection = Pablo.rect();
          collection.on('foo', function (e) {
            expect(this).to.equal(e.target);
          });
          collection.trigger('foo');
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
          }, 4);
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
          }, 4);
        });

        it('should have the "this" context of the callback be the subject collection', function () {
          var collection = Pablo.rect();
          collection.one('foo', function (e) {
            expect(this).to.equal(e.target);
          });
          collection.trigger('foo');
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
          }, 4);
        });

        it('should have the "this" context of the callback be the subject collection', function () {
          var collection = Pablo.rect();
          collection.oneEach('foo', function (e) {
            expect(this).to.equal(e.target);
          });
          collection.trigger('foo');
        });
      });

    });

    describe('.extend()', function () {
      it('.extend(source, target)', function () {
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

      it('.extend(source, target, target)', function () {
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

      it('.extend(source, target, target, withPrototype)', function () {
        function Foo(){this.earth = 1}
        Foo.prototype = {wind: 2};
        function Bar(){this.water = 3}
        Bar.prototype = {fire: 4};

        expect(Pablo.extend({}, new Foo(), new Bar(), true)).to.eql({
          earth: 1,
          wind:  2,
          water: 3,
          fire:  4
        });
      });

      it('.extend(source, target, withPrototype)', function () {
        function Foo(){this.earth = 1}
        Foo.prototype = {wind: 2};

        expect(Pablo.extend({}, new Foo(), true)).to.eql({
          earth: 1,
          wind:  2
        });
      });
    });

    describe('.template()', function () {
      it('.template(name, function) should set a new svg shape namespace on the pablo object and return what was returned in the argument function', function () {
        var square;

        Pablo.template('square', function () {
          return Pablo.rect({
            height: '50',
            width:  '50'
          });
        });

        square = Pablo.square();

        expect(square[0] instanceof SVGRectElement).to.equal(true);
        expect(square[0].getAttribute('height')).to.equal('50');
        expect(square[0].getAttribute('width')).to.equal('50');
      });
    });

    describe('Pablo.get()', function () {
      it('Pablo.get() loads resource', function (done) {
          Pablo.get('images/villain.svg', function(markup, xhr){
            if (
              typeof markup === 'string' &&
              typeof xhr.responseXML === 'object' &&
              xhr instanceof window.XMLHttpRequest
            ){
              done();
            }
            else {
              done(new Error('Ajax fail: Are you running on localhost?'));
            }
          });
      });
    });

    describe('Pablo.load()', function () {
      it('Pablo.load() loads SVG document', function (done) {
          Pablo.load('images/villain.svg', function(xhr){
            if (this.length === 1){
              done();
            }
            else {
              done(new Error('Ajax fail: Are you running on localhost?'));
            }
          });
      });
    });

    describe('collection.load()', function () {
      it('.load() loads SVG document into node', function (done) {
          var subject = Pablo.g();

          subject.load('images/villain.svg', function(collection, xhr){
            if (
              collection.length === 1 &&
              subject.children().length === 1 &&
              subject.firstChild()[0] === collection[0]
            ){
              done();
            }
            else {
              done(new Error('Ajax fail: Are you running on localhost?'));
            }
          });
      });
    });

    describe('.markup() SVG', function () {
      it('.markup() should return a markup string', function () {
          var subject = Pablo.g(),
              markup = subject.markup();

          // match <g></g> and <g/>
          expect(markup).to.match(/^(<g.*><\/g>|<g.*\/>)$/);
      });

      it('.markup() should export markup for multiple elements in the collection', function () {
          var subject = Pablo(['g', 'a']),
              markup = subject.markup();

          expect(markup).to.match(/^(<g.*><\/g>|<g.*\/>)(<a.*><\/a>|<a.*\/>)$/);
      });

      it('.markup() should be consistent on repeated use', function () {
          var subject = Pablo.svg({viewBox:'0 0 1 1'}).append([
                Pablo.g(),
                Pablo.circle({r:5})
              ]),
              markup = subject.markup(),
              attributes = subject.attr(),
              attrNames = Object.keys(attributes).sort(),
              copy = Pablo(markup),
              markupCopy = copy.markup(),
              attributesCopy = copy.attr(),
              attrNamesCopy = Object.keys(attributes).sort();

          expect(copy.length).to.equal(1);
          expect(copy.children().length).to.equal(2);

          expect(markupCopy).to.be.a('string');
          expect(markupCopy.length).to.be.at.least(1);

          expect(attrNames.length).to.equal(attrNamesCopy.length);
          attrNames.forEach(function(attr, i){
            expect(attr).to.equal(attrNamesCopy[i]);
          });
      });

      // Currently passes in Chrome and FF but fails in grunt mocha with PhantomJS
      it('.markup() should have consistent xlink ns on repeated use', function(){
          var subject = Pablo.svg({viewBox:'0 0 1 1'}).append([
                Pablo.g(),
                Pablo.circle({r:5})
              ]),
              markup = subject.markup(),
              copy = Pablo(markup),
              markupCopy = copy.markup();

          expect(markup.indexOf('xmlns:xlink')).to.not.equal(-1);
          expect(markupCopy.indexOf('xmlns:xlink')).to.not.equal(-1);
      });

      it('.markup() should export markup for multiple elements on repeated use', function () {
          var subject = Pablo(['g', 'a']),
              markup = subject.markup(),
              copy = Pablo(markup),
              markupCopy = copy.markup(),
              doubleCopy = Pablo(markupCopy);

          expect(copy.length).to.equal(2);
          expect(doubleCopy.length).to.equal(2);
          expect(copy[0].nodeName).to.equal('g');
          expect(copy[1].nodeName).to.equal('a');
          expect(doubleCopy[0].nodeName).to.equal('g');
          expect(doubleCopy[1].nodeName).to.equal('a');
      });

      it('.markup(true) should wrap elements in an <svg> element', function () {
          var subject = Pablo(['g', 'a']),
              markup = subject.markup(true),
              copy = Pablo(markup);

          expect(copy.length).to.equal(1);
          expect(copy.children().length).to.equal(2);
          expect(copy[0].nodeName).to.equal('svg');
          expect(copy.children()[0].nodeName).to.equal('g');
          expect(copy.children()[1].nodeName).to.equal('a');
      });

      it('.markup(true) should not create a new <svg> element when the collection is a single <svg> element', function () {
          var subject = Pablo.svg().append(['g', 'a']),
              markup = subject.markup(true),
              copy = Pablo(markup);

          expect(copy.length).to.equal(1);
          expect(copy.children().length).to.equal(2);
          expect(copy[0].nodeName).to.equal('svg');
          expect(copy.children()[0].nodeName).to.equal('g');
          expect(copy.children()[1].nodeName).to.equal('a');
      });

      it('.markup(true) should create a new <svg> element when the collection has multiple <svg> elements', function () {
          var subject = Pablo.svg().append(['g', 'a']).duplicate(),
              markup = subject.markup(true),
              copy = Pablo(markup);

          expect(copy.length).to.equal(1);
          expect(copy.children().length).to.equal(2);
          expect(copy.children().children().length).to.equal(4);
          expect(copy[0].nodeName).to.equal('svg');
          expect(copy.children()[0].nodeName).to.equal('svg');
          expect(copy.children()[1].nodeName).to.equal('svg');
      });
    });
    

    describe('.markup() HTML', function () {
      it('.markup() should return a markup string', function () {
          var subject = Pablo(document.createElement('div')),
              markup = subject.markup();

          // match <div></div> and <div/>
          expect(markup).to.match(/^(<div.*><\/div>|<div.*\/>)$/);
      });

      it('.markup() should export markup for multiple elements in the collection', function () {
          var subject = Pablo([
                document.createElement('div'),
                document.createElement('a')
              ]),
              markup = subject.markup();

          expect(markup).to.match(/^(<div.*><\/div>|<div.*\/>)(<a.*><\/a>|<a.*\/>)$/);
      });

      it.skip('.markup() should be consistent on repeated use', function () {
          var subject = Pablo(document.createElement('div')).append([
                Pablo(document.createElement('a'), {href:'#'}),
                Pablo(document.createElement('span'))
              ]),
              markup = subject.markup(),
              carboncopy = Pablo(markup);

          expect(carboncopy.length).to.equal(1);
          expect(carboncopy.children().length).to.equal(2);
          expect(carboncopy.markup()).to.equal(markup);
      });
    });


    describe('.bbox', function(){
      var svg = Pablo.svg({width: 500, height:190});
      var circle = svg.circle({cx:100, cy:100, r:10});
      var rect = svg.rect({x:200, y:100, width:50, height:90});
      var circlebbox = circle.bbox();

      it('.bbox() should objection containing x, y, width and height', function () {
        expect('x' in circlebbox).to.equal(true);
        expect('y' in circlebbox).to.equal(true);
        expect('width' in circlebbox).to.equal(true);
        expect('height' in circlebbox).to.equal(true);
      });

      it('.bbox() should give dimensions and position of a single element in the collection', function () {
        expect(circlebbox.x).to.equal(90);
        expect(circlebbox.y).to.equal(90);
        expect(circlebbox.width).to.equal(20);
        expect(circlebbox.height).to.equal(20);
      });

      it('.bbox() should give dimensions and position of the multiple elements in the collection', function () {
        var bbox = Pablo([circle, rect]).bbox();
        expect(bbox.x).to.equal(90);
        expect(bbox.y).to.equal(90);
        expect(bbox.width).to.equal(250);
        expect(bbox.height).to.equal(190);
      });

      it('.bbox() of <svg> element should give dimensions and position of the its children', function () {
        var bbox = svg.bbox();
        expect(bbox.x).to.equal(90);
        expect(bbox.y).to.equal(90);
        expect(bbox.width).to.equal(160);
        expect(bbox.height).to.equal(100);
      });
    });


    describe('.crop', function(){
      var svg = Pablo.svg({width: 500, height:190});
      var circle = svg.circle({cx:100, cy:100, r:10});
      var rect = svg.rect({x:200, y:100, width:50, height:90});

      it('.crop() should resize the svg element to its contents', function () {
        expect(svg[0].width.baseVal.value).to.equal(500);
        expect(svg[0].height.baseVal.value).to.equal(190);

        svg.crop();
        expect(svg[0].width.baseVal.value).to.equal(160);
        expect(svg[0].height.baseVal.value).to.equal(100);
        expect(svg.attr('viewBox')).to.equal('90 90 160 100');
      });

      it('.crop(collection) should resize the svg element to a single element in the collection', function () {
        svg.crop(rect);
        expect(svg[0].width.baseVal.value).to.equal(50);
        expect(svg[0].height.baseVal.value).to.equal(90);
        expect(svg.attr('viewBox')).to.equal('200 100 50 90');

        svg.crop(circle);
        expect(svg[0].width.baseVal.value).to.equal(20);
        expect(svg[0].height.baseVal.value).to.equal(20);
        expect(svg.attr('viewBox')).to.equal('90 90 20 20');
      });

      it('.crop(collection) should resize the svg element to the multiple elements in the collection', function () {
        svg.crop(Pablo([circle, rect]));
        expect(svg[0].width.baseVal.value).to.equal(160);
        expect(svg[0].height.baseVal.value).to.equal(100);
        expect(svg.attr('viewBox')).to.equal('90 90 160 100');
      });

      it('.crop() should resize the svg element to a specified bbox', function () {
        svg.crop({x:10, y:20, width:30, height:40});
        expect(svg[0].width.baseVal.value).to.equal(30);
        expect(svg[0].height.baseVal.value).to.equal(40);
        expect(svg.attr('viewBox')).to.equal('10 20 30 40');
      });
    });

    describe('.toImage("svg")', function(){
      var subject1 = Pablo.svg(),
          subject2 = Pablo.rect({width:1,height:1}),
          img1 = subject1.toImage('svg'),
          img2 = subject2.toImage('svg');

      if (Pablo.support.svgImage){
        it('.toImage("svg") returns a collection containing an HTML image element', function(){
          expect(Pablo.isPablo(img1)).to.equal(true);
          expect(Pablo.isPablo(img2)).to.equal(true);
          expect(img1[0]).to.be.an.instanceof(HTMLImageElement);
          expect(img2[0]).to.be.an.instanceof(HTMLImageElement);
        });

        it('.toImage("svg", callback) calls callback with collection containing HTML image element as first argument and collection as `this`', function(done){
          var count = 0;

          function testImage(collection){
            collection.toImage('svg', function(img){
              count++;

              expect(Pablo.isPablo(img)).to.equal(true);
              expect(img.length).to.equal(1);
              expect(img[0]).to.be.an.instanceof(HTMLImageElement);
              expect(this).to.equal(collection);

              if (this === subject1){
                expect(img[0].width).to.equal(0);
                expect(img[0].height).to.equal(0);
              }
              else if (this === subject2){
                expect(img[0].width).to.equal(1);
                expect(img[0].height).to.equal(1);
              }
              else {
                done(new Error('Incorrect `this` context'))
              }

              if (count === 2){
                done();
              }
            });
          }
          testImage(subject1);
          testImage(subject2);
        });
      }

      // No support for toImage('svg')
      else {
        it('.toImage("svg"), on failure, returns an object indicating an error', function(){
          expect(Pablo.isPablo(img1)).to.equal(false);
          expect(Pablo.isPablo(img2)).to.equal(false);
          expect('error' in img1).to.equal(true);
          expect('error' in img2).to.equal(true);
        });

        it('.toImage("svg", callback), on failure, calls callback with object indicating an error as first argument and collection as `this`', function(done){
          var count = 0;

          Pablo([subject1, subject2]).each(function(el){
            Pablo(el).toImage('svg', function(img){
              count++;

              expect(Pablo.isPablo(img)).to.equal(false);
              expect('error' in img).to.equal(true);

              if (count === 2){
                done();
              }
            });
          });
        });
      }
    });

    describe('.toCanvas()', function(){
      var existingCanvas = document.createElement('canvas'),
          subject1 = Pablo.svg(),
          subject2 = Pablo.rect({width:1,height:1}),
          canvas1 = subject1.toCanvas(),
          canvas2 = subject2.toCanvas();

      existingCanvas.width = existingCanvas.height = 25;

      if (Pablo.support.canvas){
        it('.toCanvas() returns a collection containing an HTML canvas element', function(){
          expect(Pablo.isPablo(canvas1)).to.equal(true);
          expect(Pablo.isPablo(canvas2)).to.equal(true);
          expect(canvas1[0]).to.be.an.instanceof(HTMLCanvasElement);
          expect(canvas2[0]).to.be.an.instanceof(HTMLCanvasElement);
        });

        it('.toCanvas(callback) calls callback with collection containing HTML canvas element as first argument and collection as `this`', function(done){
          var count = 0;

          function testCanvas(collection){
            collection.toCanvas(function(canvas){
              count++;

              expect(Pablo.isPablo(canvas)).to.equal(true);
              expect(canvas.length).to.equal(1);
              expect(canvas[0]).to.be.an.instanceof(HTMLCanvasElement);
              expect(this).to.equal(collection);
              
              if (this === subject1){
                expect(canvas[0].width).to.equal(0);
                expect(canvas[0].height).to.equal(0);
              }
              else if (this === subject2){
                expect(canvas[0].width).to.equal(1);
                expect(canvas[0].height).to.equal(1);
              }
              else {
                done(new Error('Incorrect `this` context'))
              }

              if (count === 2){
                done();
              }
            });
          }

          testCanvas(subject1);
          testCanvas(subject2);
        });

        it('.toCanvas(callback, canvas) allows an existing canvas element or collection to be passed in', function(done){
          expect(subject2.toCanvas(null, existingCanvas)[0]).to.equal(existingCanvas);

          subject2.toCanvas(function(canvas){
            expect(canvas[0]).to.equal(existingCanvas);
            done();
          }, existingCanvas);
        });

        it('.toCanvas(callback, canvas) allows an existing canvas element or collection to be passed in', function(done){
          subject2.toCanvas(function(canvas){
            expect(canvas[0].width).to.equal(25);
            expect(canvas[0].height).to.equal(25);
            done();
          }, existingCanvas);
        });
      }

      // No support for toImage('svg')
      else {
        it('.toCanvas(), on failure, returns an object indicating an error', function(){
          expect(Pablo.isPablo(canvas1)).to.equal(false);
          expect(Pablo.isPablo(canvas2)).to.equal(false);
          expect('error' in canvas1).to.equal(true);
          expect('error' in canvas2).to.equal(true);
        });

        it('.toCanvas(callback), on failure, calls callback with object indicating an error as first argument and collection as `this`', function(done){
          var count = 0;

          Pablo([subject1, subject2]).each(function(el){
            Pablo(el).toCanvas(null, function(canvas){
              count++;

              expect(Pablo.isPablo(canvas)).to.equal(false);
              expect('error' in canvas).to.equal(true);

              if (count === 2){
                done();
              }
            });
          });
        });
      }
    });


    /////


    describe('Pablo.ELEMENT_NAME([attributes]) shortcuts', function () {
      it('Pable.svg([attributes]) should return a Pablo collection of that element and with the attribute "version=1.1" on it', function () {
        var subject = Pablo.svg();

        expect(subject instanceof Pablo.Collection).to.equal(true);
        expect(subject[0].tagName.toLowerCase()).to.equal('svg');
        expect(subject[0].getAttribute('version')).to.equal('1.1');
      });

      it('Pable.svg([attributes]) should have namespaced attributes from Pablo.ns', function () {
        var subject = Pablo.svg();

        expect(subject instanceof Pablo.Collection).to.equal(true);
        expect(subject[0].tagName.toLowerCase()).to.equal('svg');
        expect(subject[0].getAttribute('version')).to.equal('1.1');
      });

      'a altGlyph altGlyphDef altGlyphItem animate animateColor animateMotion animateTransform circle clipPath color-profile cursor defs desc ellipse feBlend feColorMatrix feComponentTransfer feComposite feConvolveMatrix feDiffuseLighting feDisplacementMap feDistantLight feFlood feFuncA feFuncB feFuncG feFuncR feGaussianBlur feImage feMerge feMergeNode feMorphology feOffset fePointLight feSpecularLighting feSpotLight feTile feTurbulence filter font font-face font-face-format font-face-name font-face-src font-face-uri foreignObject g glyph glyphRef hkern image line linearGradient marker mask metadata missing-glyph mpath path pattern polygon polyline radialGradient rect script set stop style svg switch symbol text textPath title tref tspan use view vkern'
      .split(' ')
      .forEach(function (element) {
        it('Pablo.' + element + '([attributes]) should return a Pablo collection of that element', function () {
          var subject = Pablo[element]({foo:'bar'});

          expect(subject instanceof Pablo.Collection).to.equal(true);
          expect(subject[0].tagName.toLowerCase()).to.equal(element.toLowerCase());
          expect(subject[0].getAttribute('foo')).to.equal('bar');
        });
      });    
    });
  });

  function notDone () {
    assert.ok(false, 'Test not implemented'.toUpperCase());
  }

  function resetTestSubjectStyles () {
    document.getElementById('test-subjects').setAttribute('style', 'display:none;');
  }
}());