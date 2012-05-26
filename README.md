# TinySVG

A weeny JavaScript library for drawing with SVG.

## Example

    // See the index.html page for a demo
    
    if (tinySvg.isSupported){
        tinySvg(containerElement, 400, 400)
            .style('* {stroke-width:20}')
            .draw('line', {x1:10, y1:10, x2:200, y2:350, stroke:'purple'})
            .draw('circle', {cx:200, cy:150, r:50, fill:'#f33', stroke:'#050'});
    }

* by [Premasagar Rose](http://premasagar.com) 
    ([Dharmafly](http://dharmafly.com))
* source: [github.com/dharmafly/tinysvg](http://github.com/dharmafly/tinysvg) 
([MIT license](http://opensource.org/licenses/mit-license.php))