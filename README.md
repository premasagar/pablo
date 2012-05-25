# TinySVG

A weeny JavaScript library for drawing with SVG

## Example

    var svg = tinySvg.create(document.body, 400, 400);
    
    tinySvg
        .draw(svg, 'line', {x1:10, y1:10, x2:200, y2:350, stroke:'blue', 'stroke-width':20})
        .draw(svg, 'circle', {cx:50, cy:50, r:30, 'fill':'#f00'});

* by [Premasagar Rose](http://premasagar.com) 
    ([Dharmafly](http://dharmafly.com))
* source: [github.com/dharmafly/tinysvg](http://github.com/dharmafly/tinysvg) 
([MIT license](http://opensource.org/licenses/mit-license.php))