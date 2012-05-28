# Pablo

A tiny JavaScript library for drawing vector graphics with [SVG](https://developer.mozilla.org/en/SVG).

* by [Premasagar Rose](http://premasagar.com) 
    ([Dharmafly](http://dharmafly.com))
* open source: [github.com/dharmafly/pablo](http://github.com/dharmafly/pablo) 
([MIT license](http://opensource.org/licenses/mit-license.php))

## Example

    // See the [index.html](https://github.com/dharmafly/pablo/blob/master/index.html) page for a demo
    
    if (pablo.isSupported){
        pablo(containerElement, 400, 400)
            .style('* {stroke-width:20}')
            ._('line', {x1:10, y1:10, x2:200, y2:350, stroke:'purple'})
            ._('circle', {cx:200, cy:150, r:50, fill:'#f33', stroke:'#050'});
    }