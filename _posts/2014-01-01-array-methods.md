--- 
category: reference
heading: Array methods
---

Pablo collections are essentially arrays, with some enhanced and additional methods. In general, [array methods][array-methods] and properties also apply to Pablo collections. Some array methods have been tailored to suit collections, while exhibiting the same, expected behaviour.

[array-methods]: https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array#Methods


`.toArray()`
------------

Returns a native Array of the elements in the collection.


`.size()` & `length`
--------------------

The `.size()` method and the `length` property give the number of elements in a collection.

	var collection = Pablo(['circle', 'line']);
	alert(collection.size()); // 2
	alert(collection.length); // 2


`.get(index)` & `[index]`
-------------------------

The `.get(index)` method returns the DOM element at `index` in the collection. Square-bracket array notation can also be used, e.g. `collection[3]`.

	var collection = Pablo(['circle', 'line']),
		el = collection.get(1); // same as `collection[1]`

	alert(el.nodeName); // 'line'


`.eq(index)`
------------

Returns a new collection, containing the element at `index`.

	var collection = Pablo([
			Pablo.circle({id:'john'}),
			Pablo.circle({id:'paul'}),
			Pablo.circle({id:'george'}),
			Pablo.circle({id:'ringo'})
		]),
	  	beatle = collection.eq(2);

	alert(beatle.attr('id')); // 'george'


`.push(elements)`
-----------------

Adds the elements to the end of the collection and returns the collection.

	var collection = Pablo(['circle', 'line']);

	collection.push(Pablo.path());
	alert(collection.length); // 3

This works in the same was as jQuery's `.add()` method.


`.add(elements)`
----------------

An alias for `.push()`.


`.concat(elements)`
----------------

An alias for `.push()`.


`.unshift(elements)`
--------------------

Adds the elements to the start of the collection and returns the collection.

	var collection = Pablo(['circle', 'line']);

	collection.unshift(Pablo.path());
	alert(collection[0].nodeName); // 'path'


`.pop()`
--------

Removes the last element in the collection and returns it, wrapped in a new collection.

	var paper = Pablo(demoElement).root({height:100}),
        collection = Pablo(['circle', 'line', 'rect']);

    // Removes and returns the last element, the <rect>
	collection.pop()
		.attr({width:100, height:100})
		.appendTo(paper);

	alert(collection.length); // 2


`.shift()`
----------

Removes the first element in the collection and returns it, wrapped in a new collection.

	var paper = Pablo(demoElement).root({height:100}),
        collection = Pablo(['circle', 'line', 'rect']);

    // Removes and returns the first element, the <circle>
	collection.shift()
		.attr({cx:50, cy:50, r:50})
		.appendTo(paper);

	alert(collection.length); // 2


`.slice(begin, [end])`
----------------------

Slices the collection from the `begin` index, to the `end` index (or to the end of the collection, if `end` is omitted). This works in the same manner as [Array.slice][array-slice].

If either of the arguments is a negative number, the index is counted backwards, from the end of the collection.

	var paper = Pablo(demoElement).root({height:100}),
        collection = Pablo(['circle', 'line', 'rect']);

    // Returns the <line> element
  	collection.slice(1, 2)
		.attr({y1:100, x2:100, stroke:'red', 'stroke-width':2})
		.appendTo(paper);

[array-slice]: https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/slice

	
`.each(callback)`
-----------------

Calls the callback function for each element in the collection and returns the collection. The callback is passed two arguments: the element and its index.


`.map(iterator)`
----------------

Passes each element in the collection through a callback function, returning a new collection from all the return values of the callback. The callback is passed two arguments: the element and its index.


`.filterElements(callback)`
-------------------

Passes each element in the collection through an iterator function, returning a new collection of all the elements for which the iterator returns true. The iterator is passed two arguments: the element and its index.

This method is called 'filterElements' because `.filter()` is a method to create an SVG `<filter>` method.


Other array methods
-------------------

The following methods are not modified from native array methods. See [MDN's Array reference for details][array-methods].


`.indexOf(element)`
-------------------

Returns the first index of the element within the collection, or -1 if not found.


`.lastIndexOf()`
----------------

Returns the last index of the element within the collection, or -1 if not found.


`.every(callback)`
------------------

Returns `true` if every element in the collection satisfies the provided testing function.


`.some(callback)`
-----------------

Returns true if at least one element in the collection satisfies the provided testing function.


`.reduce(callback)`
-------------------

Apply a function simultaneously against two elements of the collection (from left-to-right) as to reduce it to a single value.


`.reduceRight(callback)`
------------------------

Apply a function simultaneously against two elements of the collection (from right-to-left) as to reduce it to a single value.