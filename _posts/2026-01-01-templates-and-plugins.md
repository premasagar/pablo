--- 
category: reference
heading: Templates & plugins
---

In the 'Symbols & duplication' section, some ways are describe to create multiple, repeating SVG structures:

* SVG's native `<symbol>` and `<use>` elements, which are a built-in way to create multiple instances of elements and nested structures. They can be created with Pablo's `.symbol()` and `.use()` element methods.
* The collection methods, `.clone()` and `.duplicate()`, to replicate existing SVG elements and nested structures.

In addition to these, and described below, there is a `Pablo.template()`, which allows _fine-grained control_ of each instance of a template structure, and a `Pablo.fn` object that can be extended to provide new methods to Pablo collections.


`Pablo.template(namespace, constructor)`
----------------------------------------

Allows variable, repeatable SVG structures to be created, e.g. polygons, stars, or any other complex collection of elements. Each structures can be assigned a namespace, so that creating new instances is as simple as creating any of the basic SVG elements with Pablo.

Unlike SVG's built in `<use>` and `<symbol>` elements, `Pablo.template()` allows _fine-grained control_ of each instance of the template structure.

The method accepts a `namespace` (e.g. `star`) and a `constructor` function that, when called, will create a new instance of the template. The constructor can accept any number arguments (e.g. `Pablo.star('red', 50, {foo:'bar'})`).

As with Pablo element methods, new instances of the namespace can either be created via the `Pablo` object (e.g. `Pablo.star()`) or as a new child of an element or collection (e.g. `Pablo.g().star()`). If the latter, then the `this` context inside the constructor will be the parent element, otherwise `this` will be null.


    Pablo.template('star', function(options){
        var points = options.points || 6,
            size = options.size || 50,
            x = options.x || 0,
            y = options.y || 0,
            theta = 360 / points,
            pathString = 'm' + size*1.5 + ',' + size*0.75,
            // Should be 1/points to 0.5*points
            depth = points * 0.375,
            angle = 0, i, x1, y1, x2, y2;

        size = (size * 8) / (points+5.5);
        for (i=0; i<points; i++){
            angle = Math.PI * theta * i / 180; 
            x1 = size * Math.cos(angle); 
            y1 = size * Math.sin(angle);
            angle = Math.PI * theta * (i+depth) / 180; 
            x2 = size * Math.cos(angle); 
            y2 = size * Math.sin(angle);
            pathString += 'l'+x1+','+y1+'l'+x2+','+y2;
        }
        return Pablo.path({
            d: pathString,
            transform: 'translate('+x+','+y+')'
        });
    });

    var paper = Pablo(demoElement).root({height:120});

    // Pablo.star() is now available
    Pablo.star({points:5})
        .attr({fill:'red'})
        .appendTo(paper);

    // And so is collection.star()
    paper.star({points:7, x:120})
        .attr({fill:'orange'});
        
    paper.star({points:13, x:245})
        .attr({fill:'blue'});


`Pablo.fn`
----------

Pablo collections can be given a new method by extending the `Pablo.fn` object with a Pablo plugin. `Pablo.fn` is the Pablo collections `prototype` object, containing all the methods available to collections.

    // Create Pablo plugin: - rotate an element by 45 degrees
    Pablo.fn.rotate45 = function(value){
        return this.attr('transform', 'rotate(45)');
    };

    var paper = Pablo(demoElement).root({height:110});

    paper.rect({width:100, height:50, x:25, y:-25, fill:'blue'})
         .rotate45();

    paper.ellipse({cx:125, cy:-60, rx:50, ry:25, fill:'orange'})
         .rotate45();