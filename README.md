# Pablo

is a lightweight, expressive JavaScript library for creating and manipulating Scalable Vector Graphics ([SVG][svg]).

- by [Premasagar Rose][prem] 
    ([Dharmafly][df]
- [github.com/dharmafly/pablo][pablo-repo]
- open source: [MIT license][mit]
- ~3KB minified & gzipped

[prem]: http://premasagar.com
[df]: http://dharmafly.com
[mit]: http://opensource.org/licenses/mit-license.php
[svg]: https://developer.mozilla.org/en/SVG
[pablo-repo]: https://github.com/dharmafly/pablo
[demo]: https://github.com/dharmafly/pablo/blob/master/index.html "Pablo demo"


## Examples

See the [demo page][demo]; view its source.
    

### Check browser supports Pablo

````js
if (pablo.isSupported){
    drawSomething();
}
````
            
### `pablo.root()`: Create SVG root node

````js
var paper = pablo.root('#paper', {width:460, height:460})
````

Optional arguments:

1. HTML DOM element or CSS selector to act as a container for the SVG
2. Attributes to be added to the SVG element

### `style().content()`: CSS styles, which apply to all elements in the current SVG document

````js
// Append <style> element
paper.style()
    // Change text content (like jQuery's text() method)
    .content(
        '* {stroke-width:20}' +
        'text {font-family:sans-serif; font-size:16px}'
    );
])
````

### Append SVG elements

All SVG elements supported. See [MDN's SVG element reference](https://developer.mozilla.org/en/SVG/Element).

For example, these graphical elements:
````js
paper
    ('line', {x1:10, y1:5, x2:200, y2:350, stroke:'purple'})
    ('circle', {cx:200, cy:150, r:50, fill:'#f33', stroke:'#050'})
    ('ellipse', {
        cx:200,
        cy:270,
        rx:80,
        ry:40,
        stroke:'#222',
        fill:'#777',
        opacity:0.5,
        // Override `<style>` element above with a `style` attribute
        style:'stroke-width:10'
    })
    ('polyline', {
        points:'120,100 200,25 280,100',
        stroke:'#444',
        fill:'none',
        // Hyphenated attribute names must be passed as strings
        // since CamelCased attribute names are not (yet) supported
        'stroke-linejoin':'round',
        'stroke-linecap':'round'
    })
````

### Example: Text on a path

````js
paper
    (
        pablo.defs()
        ('path', {
            id:'squiggle',
            transform:'rotate(-90 300 170)',
            d:'M 20 320 C 120 220 220 120 320 220 C 420 320 520 420 620 320'
        })
    )
    (
        pablo.text()
        ('textPath', {
            _link:'#squiggle',
            _content:'★ In Xanadu, did Kublah Khan a stately pleasuredome decree…',
            fill:'#997099'
        })
    )
````

### Example: Hyperlinked text

````js
paper
    (
        pablo.a({
            _link:'https://github.com/dharmafly/pablo',
            target:'_blank'
        })
        ('text', {
            _content:'we ♥ pablo',
            x:300,
            y:170,
            fill:'#777',
            transform:'rotate(-45 300 170)'
        })
    );
````

### Example: Animate, on mouse events

````js
paper('circle')
    .attr({style:'cursor:pointer'})
    .on('mouseover', function(event){
        pablo(event.target)
            .empty()
            ('animate', {
                attributeName:'fill',
                from:'#ff3',
                to:'#005',
                dur:'1.62s',
                repeatCount:'indefinite'
            })
            ('animate', {
                attributeName:'r',
                from:45,
                to:60,
                dur:'6s',
                repeatCount:'indefinite'
            })
    })
    .on('mouseout', function(event){
        pablo(event.target).empty();
    })
    .on('mousedown', function(event){
        pablo(event.target).attr({stroke:'#fff'});
    })
    .on('mouseup', function(event){
        pablo(event.target).attr({stroke:'#050'});
    });
````

### More examples
For more detailed examples, view the source of the [demo page][demo].


## Resources

* [SVG reference on MDN](https://developer.mozilla.org/en/SVG)
* [SVG elements reference](https://developer.mozilla.org/en/SVG/Element)
* [SVG attributes reference](https://developer.mozilla.org/en/SVG/Attribute)
* [W3C spec for SVG 1.1](http://www.w3.org/TR/SVG11/)
* [CSS reference](https://developer.mozilla.org/en/CSS/CSS_Reference)
* [SVG animation with SMIL](https://developer.mozilla.org/en/SVG/SVG_animation_with_SMIL)
* [Kevin Lindsay's SVG tutorials](http://kevlindev.com/tutorials/basics/index.htm)
* [SVG Basics](http://www.svgbasics.com)
* [SVG Wow](http://svg-wow.org)
* [Browser compatibility table](https://en.wikipedia.org/wiki/Comparison_of_web_browsers#Image%5Fformat%5Fsupport)
* [Browser support for aspects of SVG](http://caniuse.com/#search=svg)


## Related libraries

* [Raphaël](http://raphaeljs.com)
* [jQuery SVG](http://keith-wood.name/svg.html)