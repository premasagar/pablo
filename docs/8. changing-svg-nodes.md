---
category: reference
heading: "Changing SVG Nodes"
---

Pablo also has an assortment of methods for changing the properties of 
SVG nodes.

Attributes
----------

The `attr()` method can be used to set or get an objects attributes.

To add one or more attributes pass in an object map of the attribute name and 
its value.

Specifying an attribute already set on that node will replace it.

    var square = Pablo.rect({width: 100, fill: 'red'});

    // Add a height and replace the fill color
    square.attr({height: 100, fill: 'green'});

    Pablo($output[0]).root({height:100})._(square);

To remove an attribute use `removeAttr()` and pass the attribute name as a 
string.

    var square = Pablo().rect({width: 100, height: 100, fill: 'red'});

    // Remove the fill attribute (turns out black by default)
    square.removeAttr('fill');

    Pablo($output[0]).root({height:100})._(square);

CSS styles
----------

CSS properties carry over to SVG natively. 

This means you can use CSS to set SVG node properties by appending a style 
element and editing its content, using `style().content(css)`.

    // Create the root node.
    var paper = Pablo($output[0]).root({height:100});

    // Append a <style> element
    paper
        .style()
        // Change text content of style (Similar to jQuery's text() method)
        .content(
            '* {stroke-width:20}' +
            'circle {fill:green}'
        );

    paper._('circle', {stroke: 'red', cx:50, cy:50, r:25});



Hyperlinks
----------
The `a(options)` element method can be used to set up hyperlinked SVG elements.

In the example below `<a>` elements are created and SVG elements are appended 
as children.

    var paper  = Pablo($output[0]).root({height: 130}),
        circle = paper.circle({cx:60, cy:60, r:50, fill:'red'}),
        text   = paper.text({x:220, y:30}).content('we ♥ pablo');

    paper.a({
        _link: 'https://github.com/dharmafly/pablo',
        target: '_blank'
    })
    (circle);

    paper.a({
        _link: 'https://github.com/dharmafly',
        target: '_blank'
    })
    (text);