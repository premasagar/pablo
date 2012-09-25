--- 
category: reference
heading: Attributes
---


`.attr()`
--------

Returns an object listing all the attributes from the first element in the collection.

    var paper = Pablo(demoElement).root({height:100}),
        rect  = paper.rect({
            width: 200,
            height:100,
            fill: 'gold'
        }),
        attributes = rect.attr();

    alert(JSON.stringify(attributes));
    // {width:200, height:100, fill:'gold'}


`.attr(attributeName)`
---------------------

Returns the value of the named attribute on the first element in the collection.

    var paper = Pablo(demoElement).root({height:100}),
        rect  = paper.rect({
            width: 200,
            height:100,
            fill: 'gold'
        }),
        value = rect.attr('fill');

    alert(value); // 'gold'


`.attr(attributeName, value)`
----------------------------

Sets the named attribute to the specified value, on all elements in the collection and returns the collection.

    var paper = Pablo(demoElement).root({height:100}),
        rect  = paper.rect({
            width: 200,
            height:100,
            fill: 'gold'
        });

    rect.attr('fill', 'silver');


`.attr(attributes)`
------------------

Sets multiple attributes (supplied as an object), on all elements in the collection and returns the collection.

    var paper = Pablo(demoElement).root({height:220}),
    rect  = paper.rect();

    rect.attr({
        x: 50,
        y: -50,
        width: 200,
        height:100,
        fill: 'orange',
        transform: 'rotate(45)'
    });


Attribute value functions
-------------------------

Attribute values may alternatively be supplied as a callback function. The callback is passed two arguments: the element and its index in the collection. This can be used for varying the attribute value for successive elements in a collection:

    var paper = Pablo(demoElement).root({height:220}),
        circle = paper.circle({
            cy:110,
            fill:'rgba(120,150,90,0.2)',
            stroke:'#777'
        });

    circle.duplicate(20)
          .attr({
              cx: function(el, i){
                  return i * 10 + ((i + 1) * 10);
              },
              r: function(el, i){
                  return i * 5 + 10;
              }
          });


Attribute value arrays
----------------------

Attribute values may alternatively be supplied as an array. For each element in the collection, the element's index in the collection is used to pluck a value from the array:

    var paper  = Pablo(demoElement).root({height:100}),
        circle = paper.circle({cy:50, r:50}),
        colors = ['red', 'green', 'blue', 'yellow', 'purple'],
        cx     = [50, 150, 250, 350, 450];

    circle.duplicate(4)
          .attr({fill:colors, cx:cx});


`.removeAttr(attributeName)`
---------------------------

Removes an attribute and returns the collection.

    var paper = Pablo(demoElement).root({height:100}),
        rect  = paper.rect({
            width: 200,
            height:100,
            fill: 'gold'
        });

    rect.removeAttr('fill');
    // the default fill is black


`.transform(functionName, value)`
---------------------------------

Modifies the value of a _transform function_ in each element's `transform` attribute, and returns the collection. Each transform function can be modified individually.

    var paper = Pablo(demoElement).root({height:160});

    paper.rect({width:100, height:100, fill:'red'})
         .transform('translate', '180 30')
         .transform('rotate', '45 50 50');

The method can also accept the `value` as a function or array, as with `.attr()` and other methods:

    var paper = Pablo(demoElement).root({height:210})
        squares = paper.rect({
            x:90, y:110,
            width:80, height:80,
            fill:'rgba(120,30,0,0.3)',
            stroke:'rgba(30,60,90,0.7)'
        }).duplicate(11);
        
    squares.transform('rotate', function(el, i){
        return i * 30 + ' 110 105';
    });