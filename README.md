# Pablo

A tiny JavaScript library for drawing [SVG](https://developer.mozilla.org/en/SVG) vector graphics.

* by [Premasagar Rose](http://premasagar.com) 
    ([Dharmafly](http://dharmafly.com))
* open source: [github.com/dharmafly/pablo](http://github.com/dharmafly/pablo) 
([MIT license](http://opensource.org/licenses/mit-license.php))
* < 1KB of code, minified & gzipped

## Example

See the [index.html](https://github.com/dharmafly/pablo/blob/master/index.html) page for a demo
    
````js
if (pablo.isSupported){
    // optional: pass in an HTML DOM element to contain the SVG, or the element's `id` as a string
    pablo(document.body)
        // optional: add CSS styles; they will target only these SVG elements
        .style('* {stroke-width:20}; line: {stroke-linecap:round}')
        // draw a line
        ._('line', {x1:10, y1:10, x2:200, y2:350, stroke:'purple'})
        // draw a circle
        ._('circle', {cx:200, cy:150, r:50, fill:'#f33', stroke:'#050'})
        // draw an ellipse; override the above CSS styles with a `style` attribute
        ._('ellipse', {
            cx:200,
            cy:270,
            rx:80,
            ry:40,
            fill:'none',
            stroke:'#777',
            style:'stroke-width:10'
        });
}
````


## Resources

* [SVG reference on MDN](https://developer.mozilla.org/en/SVG)
* [SVG elements reference](https://developer.mozilla.org/en/SVG/Element)
* [SVG attributes reference](https://developer.mozilla.org/en/SVG/Attribute)
* [W3C spec for SVG 1.1](http://www.w3.org/TR/SVG11/)
* [CSS reference](https://developer.mozilla.org/en/CSS/CSS_Reference)
* [SVG animation with SMIL](https://developer.mozilla.org/en/SVG/SVG_animation_with_SMIL)
* [Kevin Lindsay's SVG tutorials](http://kevlindev.com/tutorials/basics/index.htm)
* [Browser compatibility table](https://en.wikipedia.org/wiki/Comparison_of_web_browsers#Image%5Fformat%5Fsupport)
* [Browser support for aspects of SVG](http://caniuse.com/#search=svg)


## Related libraries

* [Raphaël](http://raphaeljs.com)
* [jQuery SVG](http://keith-wood.name/svg.html)