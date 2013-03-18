var expect = chai.expect,
    assert = chai.assert;

describe('Catching errors for Pablo(document)', function () {
  describe('for the following methods of Pablo(document), errors should be caught by Pablo internally', function () {
    var d = Pablo(document);

    it('.append(elements)', function () {
      d.append(document.createElement('span'));
      d = Pablo(document);
    });

    it('.append(elementName, attributes)', function () {
      d.append('span', {});
      d = Pablo(document);
    });

    it('.appendTo(element)', function () {
      d.appendTo(document.createElement('a'));
      d = Pablo(document);
    });

    it('.appendTo(elementName, attributes)', function () {
      d.appendTo('span', {});
      d = Pablo(document);
    });

    it('.prepend(element)', function () {
      d.prepend(document.createElement('a'));
      d = Pablo(document);
    });

    it('.prepend(elementName, attributes)', function () {
      d.prepend('span', {});
      d = Pablo(document);
    });

    it('.prependTo(element)', function () {
      d.prependTo(document.createElement('a'));
      d = Pablo(document);
    });

    it('.prependTo(elementName, attributes)', function () {
      d.prependTo('span', {});
      d = Pablo(document);
    });

    it('.before(element)', function () {
      d.before(document.createElement('a'));
      d = Pablo(document);
    });

    it('.before(element)', function () {
      d.before('span', {});
      d = Pablo(document);
    });

    it('.after(element)', function () {
      d.after(document.createElement('a'));
      d = Pablo(document);
    });

    it('.after(element)', function () {
      d.after('span', {});
      d = Pablo(document);
    });

    it('.insertBefore(element)', function () {
      d.insertBefore(document.createElement('a'));
      d = Pablo(document);
    });

    it('.insertBefore(element)', function () {
      d.insertBefore('span', {});
      d = Pablo(document);
    });

    it('.insertAfter(element)', function () {
      d.insertAfter(document.createElement('a'));
      d = Pablo(document);
    });

    it('.insertAfter(element)', function () {
      d.insertAfter('span', {});
      d = Pablo(document);
    });

    it('.children', function () {
      d.children();
      d = Pablo(document);
    });

    it('.children(selector)', function () {
      d.children('body');
      d = Pablo(document);
    });

    it('.children(fn)', function () {
      d.children(function (item) {
        return item;
      });
      d = Pablo(document);
    });

    it('.parent()', function () {
      d.parent();
      d = Pablo(document);
    });

    it('.siblings()', function () {
      d.siblings();
      d = Pablo(document);
    });

    it('.prev()', function () {
      d.prev();
      d = Pablo(document);
    });

    it('.next()', function () {
      d.next();
      d = Pablo(document);
    });

    it('.find()', function () {
      d.find('body');
      d = Pablo(document);
    });

    it('.get()', function () {
      d.get(0);
      d = Pablo(document);
    });

    it('.eq()', function () {
      d.eq(0);
      d = Pablo(document);
    });

    it('.first()', function () {
      d.first();
      d = Pablo(document);
    });

    it('.last()', function () {
      d.last();
      d = Pablo(document);
    });

    it('.attr()', function () {
      d.attr();
      d = Pablo(document);
    });

    it('.attr(attributeName, attributeValue)', function () {
      d.attr('foo', 'bar');
      d = Pablo(document);
    });

    it('.attr(attributeName)', function () {
      d.attr('foo');
      d = Pablo(document);
    });

    it('.attr(options)', function () {
      d.attr({foo:'bar'});
      d = Pablo(document);
    });

    it('.removeAttr(attributeName)', function () {
      d.removeAttr('bar');
      d = Pablo(document);
    });

    it('.transform(functionName, value)', function () {
      d.transform('rotate', '45 50 50');
      d = Pablo(document);
    });

    it('.css(prop, val)', function () {
      d.css('background', 'white');
      d = Pablo(document);
    });

    it('.css(prop)', function () {
      d.css('background');
      d = Pablo(document);
    });      

    it('.css(styles)', function () {
      d.css({
        'background': 'white',
        'color': 'black'
      });
      d = Pablo(document);
    });

    it('.cssPrefix(prop, val)', function () {
      d.css('transition', 'opacity 0.5s');
      d = Pablo(document);
    });

    it('.cssPrefix(prop)', function () {
      d.css('transition');
      d = Pablo(document);
    });

    it('.cssPrefix(styles)', function () {
      d.css({'transition': 'opacity 0.5s'});
      d = Pablo(document);
    });

    it('.addClass(className)', function () {
      d.addClass('foo');
      d = Pablo(document);
    });

    it('.removeClass(className)', function () {
      d.removeClass('foo');
      d = Pablo(document);
    });

    it('.hasClass(className)', function () {
      d.hasClass('foo');
      d = Pablo(document);
    });

    it('.toggleClass(className)', function () {
      d.toggleClass('foo');
      d = Pablo(document);
    });

    it('.content()', function () {
      d.content();
      d = Pablo(document);
    });

    it('.toArray()', function () {
      d.toArray();
      d = Pablo(document);
    });

    it('.size()', function () {
      d.size();
      d = Pablo(document);
    });

    it('.push(elements)/.add(elements)', function () {
      d.push(document.createElement('a'));
      d = Pablo(document);
    });

    it('.push(elements...)/.add(elements...)', function () {
      d.push(document.createElement('a'), document.createElement('a'));
      d = Pablo(document);
    });

    it('.concat(elements)', function () {
      d.concat(document.createElement('a'));
      d = Pablo(document);
    });

    it('.concat(elements...)', function () {
      d.concat(document.createElement('a'), document.createElement('a'));
      d = Pablo(document);
    });

    it('.unshift(elements)', function () {
      d.unshift(document.createElement('a'), document.createElement('a'));
      d = Pablo(document);
    });

    it('.unshift(elements...)', function () {
      d.unshift(document.createElement('a'), document.createElement('a'));
      d = Pablo(document);
    });

    it('.pop()', function () {
      d.pop();
      d = Pablo(document);
    });

    it('.shift()', function () {
      d.shift();
      d = Pablo(document);
    });

    it('.slice(begin)', function () {
      d.slice(0);
      d = Pablo(document);
    });

    it('.slice(begin, end)', function () {
      d.slice(0, 1);
      d = Pablo(document);
    });

    it('.each(fn)', function () {
      d.each(function () {});
      d = Pablo(document);
    });

    it('.each(fn, context)', function () {
      d.each(function () {}, {});
      d = Pablo(document);
    });

    it('.map(fn)', function () {
      d.map(function () {});
      d = Pablo(document);
    });

    it('.map(fn, context)', function () {
      d.map(function () {}, {});
      d = Pablo(document);
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