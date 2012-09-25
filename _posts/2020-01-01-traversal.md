--- 
category: reference
heading: Traversal
---


`.children()`
-------------

Returns a collection containing the direct child nodes for each element in the collection.

	// Create SVG root
	var paper = Pablo(demoElement).root({height:120}),

		// Text label
	    label = paper.text({
	    	y:100,
			'font-size':'30px',
			'font-family':'sans-serif'
		}),

		// Array of IDs
		ids = ['rebbie', 'jackie', 'tito', 'jermaine',
			'la-toya', 'marlon', 'michael', 'randy', 'janet'],

		// 9 <circle>'s
		circles = Pablo.circle().duplicate(8),

		// <g> group element
		jacksons = paper.g({id:'jacksons'})
			// Change label on interaction
			.on('mouseover touchstart', function(event){
				label.content(event.target.id);
			})

			// Append children and switch to children context
			.append(circles, {
		    	r: 30, cy: 30,
		    	// Apply IDs in sequence
		    	id: ids,
				cx: function(el, i){return 40 * i + 30;},
				fill: function(el){
					return el.id === 'michael' ?
						'gold' : 'rgba(90,30,30,0.5)';
				}
			}),

		// Child nodes
		children = jacksons.children();

	// Change label - '9 jacksons'
	label.content(children.length + ' ' + jacksons.attr('id'));

	
`.parent()`
-----------

Returns a collection containing the parent node for each element in the collection.

	Pablo('#michael').parent()
		.attr('id'); // 'jackson'

	
`.siblings()`
-------------

Returns a collection containing elements that have the same parent as elements in the collection.

	Pablo('#michael').siblings()
		.length; // 8

	
`.prevSibling()`
----------------

Returns a collection containing the previous sibling element of each element in the collection.

	Pablo('#michael').prevSibling()
		.attr('id'); // 'marlon'

	
`.nextSibling()`
----------------

Returns a collection containing the next sibling element of each element in the collection.

	Pablo('#michael').nextSibling()
		.attr('id'); // 'randy'

	
`.find(selectors)`
------------------

Returns a collection containing elements that are descendents of elements in the collection and that match the supplied CSS selector or comma-separated list of selectors.

	parent.find('circle#jermaine')
		.length; // 1

See also `Pablo(selectors)`, which can find elements in the whole of the current document.