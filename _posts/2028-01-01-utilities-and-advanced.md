--- 
category: reference
heading: Utilities & advanced
---

`Pablo.extend(target, source, [source2], [deep]`)
-------------------------------------------------

Copies properties from the `source` object to the `target` object and returns the target.

    var obj = Pablo.extend({foo:1}, {bar:2});
    alert(JSON.stringify(obj)); // {"foo":1,"bar":2}

If more than one source object is passed, then each one will be copied across from right-to-left. Only the target object is modified.

If `deep` is `true` then properties from the sources' prototype chains will also be copied. If the target is not an object, a new blank object will be created first.


`Pablo.cssPrefix(property)`
---------------------------

Returns a comma-separated list of vendor-prefixed property values.

    alert(Pablo.cssPrefix('transform'));

This is useful, for example, in setting transition properties:

    shape.cssPrefix({
        transform:  'rotate(45deg)',
        transition: Pablo.cssPrefix('transform')
    });


`Pablo.cssPrefix(property, value)`
----------------------------------

Returns a semicolon-separated list vendor-prefixed CSS rules.

    alert(Pablo.cssPrefix('transform', 'rotate(45deg)'));

This is useful, for example, when creating a CSS ruleset for a stylesheet:

    var style = Pablo('svg').style();
    style.content('#foo{' + Pablo.cssPrefix('transform', 'rotate(45deg)') + '}');


`Pablo.vendorPrefixes`
----------------------

An array of vendor-prefixes that are used by the `.cssPrefix()` and `Pablo.cssPrefix()` methods. This can be modified to serve new browsers.

    Pablo.vendorPrefixes.push('-foo-');
    alert(Pablo.cssPrefix('transform'));

(Note, by default, the array includes a blank string, to allow the non-prefixed version of CSS properties to be set.)


`Pablo.toArray(obj)`
--------------------

Converts the array-like object into a true array.

    var obj = Pablo.toArray({0:'foo', 1:'bar', length:2});
    alert(JSON.stringify(obj)); // ["foo", "bar"]


`Pablo.isPablo(obj)`
--------------------

Returns boolean `true` if the object is an instance of a Pablo collection; otherwise `false`.

    var collection = Pablo.circle();
    alert(Pablo.isPablo(collection)); // true


`Pablo.isElement(obj)`
----------------------

Returns boolean `true` if the object is an HTML, SVG or other element; otherwise `false`.

    alert(Pablo.isElement(document.body)); // true


`Pablo.isSvg(obj)`
------------------

Returns boolean `true` if the object is an SVG element; otherwise `false`.

    var el = Pablo.circle()[0];
    alert(Pablo.isSvg(el)); // true


`Pablo.isNodeList(obj)`
-----------------------

Returns boolean `true` if the object is DOM NodeList - e.g. the result of a selector query or child nodes of an element; otherwise `false`.

    var el = Pablo.g()[0];
    alert(Pablo.isNodeList(el.childNodes)); // true


`Pablo.isArrayLike(obj)`
------------------------

Returns boolean `true` if the argument is an object and can be iterated like an Array; otherwise `false`.

    var obj = Pablo.toArray({0:'foo', 1:'bar', length:2});
    alert(Pablo.isArrayLike(obj));


`Pablo.hyphensToCamelCase(string)`
----------------------------------

Converts the hyphenated-string to a camelCase string.

    alert(Pablo.hyphensToCamelCase('foo-bar-three'));


`Pablo.getAttributes(element)`
------------------------------

Returns the attributes of an element as an object, similarly to the `.attr()` method.

    var obj = Pablo.getAttributes(Pablo.root()[0]);
    alert(JSON.stringify(obj));


`Pablo.canBeWrapped(obj)`
-------------------------

Returns `true` if the node can be wrapped by Pablo into a collection - e.g. if the object is an HTML or SVG element, NodeList, Pablo collection, jQuery collection or array of elements.

    alert(Pablo.canBeWrapped(document.body)); // true


`Pablo.create(elements, [attributes])`
--------------------------------------

The method used internally when `Pablo(elements, [attributes])` is called.


`Pablo.select(selectors)`
--------------------------------------

The method used internally when `Pablo(selectors)` is called.


`Pablo.Collection`
------------------

The constructor function used internally for creating a new Pablo collection.


`Pablo.svgVersion`
------------------

The version of SVG used internally on SVG root elements. Currently `1.1`.


`Pablo.svgns`
-------------

The SVG namespace URI used internally when creating SVG elements. Currently `"http://www.w3.org/2000/svg"`.


`Pablo.xlinkns`
-------------

The Xlink namespace URI used internally when creating links. Currently `"http://www.w3.org/1999/xlink"`.


`Pablo.v`
---------

The current version of the Pablo library. E.g. `"1.2.23"`.