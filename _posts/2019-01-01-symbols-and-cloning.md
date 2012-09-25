--- 
category: reference
heading: Symbols & cloning
---

See also the documentation on 'Plugins and templates'.


The native approach: `<use>` & `<symbol>`
-----------------------------------------

The SVG [`<use>`][use] element creates an cloned instance of another element. Here, a [`<symbol>`][symbol] in a [`<defs>`][defs] element is the reference element to be cloned:

    var paper = Pablo(demoElement).root({height:200}),
        defs = paper.defs();

    defs.symbol({id:'sign', 'stroke-width':15})
        .append('circle', {
            cx:48, cy:40, r:30,
            stroke:'#dc241f', fill:'none'
        })
        .append('line', {
            x1:2, y1:40, x2:94, y2:40,
            stroke:'#0019a8'
        });

    paper.use({x:0, y:0}).link('#sign');
    paper.use({x:200, y:0}).link('#sign');
    paper.use({x:0, y:100}).link('#sign');
    paper.use({x:200, y:100}).link('#sign');
    paper.use({x:100, y:50, transform:'rotate(45 148 90)'})
        .link('#sign');


`.clone(deep)`
--------------

Creates cloned copies of all elements in the collection, and returns the copies in a new collection. `deep` is a boolean value to indicate if the entire child node structure of the cloned nodes should be included (default `false`).

In this example, click anywhere to clone and append a new square:

    var paper = Pablo(demoElement).root({height:40})
        square = paper.rect({width:40, height:40}),
        x = 0;

    paper.on('click', function(){
        x += 50;
        square.clone()
            // Set x position
            .attr('x', x)
            .appendTo(paper);
    });


`.duplicate([repeats])`
---------------------

Performs a _deep_ clone on all the elements in the collection, inserts the new elements _after_ the original elements in the DOM, and adds the new elements to the collection (i.e. it modifies the length of the original collection). `repeats` is an optional number of times to duplicate the elements (default `1`).

In this example, a square is duplicated five times:

    var paper = Pablo(demoElement).root({height:40})
        square = paper.rect({width:40, height:40});

    square.duplicate(5)
        // Set x position for each element
        .attr('x', function(el, i){
            return i * 50;
        });


[use]: https://developer.mozilla.org/en-US/docs/SVG/Element/use
[symbol]: https://developer.mozilla.org/en-US/docs/SVG/Element/symbol
[defs]: https://developer.mozilla.org/en-US/docs/SVG/Element/defs