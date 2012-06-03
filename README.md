# Pablo

A tiny JavaScript library for drawing [SVG](https://developer.mozilla.org/en/SVG) vector graphics.

* by [Premasagar Rose](http://premasagar.com) 
    ([Dharmafly](http://dharmafly.com))
* open source: [github.com/dharmafly/pablo](http://github.com/dharmafly/pablo) 
([MIT license](http://opensource.org/licenses/mit-license.php))
* < 1KB of code, minified & gzipped

## Example

See the [index.html](https://github.com/dharmafly/pablo/blob/master/index.html) page for a demo; view its source.
    
````js
        // Check browser supports Pablo
        if (pablo.isSupported){
            
            // Create SVG root node
            // Optional: pass in HTML DOM element or CSS selector to act as a
            // container for the SVG
            var paper = pablo.root('#paper', {width:460, height:460})
            
                // CSS to be sandboxed within the SVG context
                // This creates a <style> element within the parent
                .styles([
                    '* {stroke-width:20}',
                    'text {font-family:sans-serif; font-size:16px}'
                ])
                
                // Graphical elements
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
                    // Override <style> element above with a `style` attribute
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
                
                
                // Text on a path
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
                
                
                // Hyperlinked text
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
                
                
                // Animate red circle on mouse events
                paper('circle')[0]
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
                    

                // Animated pattern - prepended background circle
                paper
                (
                    pablo.defs()
                    (
                        pablo('pattern', {
                            id: 'triangle',
                            width:10,
                            height:10,
                            patternUnits: 'userSpaceOnUse'
                        })
                        (
                            pablo('polygon', {
                                points:'5,0 10,10 0,10',
                                fill:'#bdd'
                            })
                            ('animateTransform', {
                                attributeName:'transform',
                                type:'rotate',
                                from:'0 10 10',
                                to:'360 10 10',
                                dur:'16.2s',
                                repeatCount:'indefinite'
                            })
                        )
                    )
                )
                // With prepend, this will be rendered underneath other elements
                .prepend(
                    pablo.circle({
                        cx:10,
                        cy:10,
                        r:250,
                        fill:'url(#triangle)'
                    })
                    ('animate', {
                        attributeName:'opacity',
                        from:0,
                        to:1,
                        dur:'16.2s',
                        repeatCount:1
                    })
                    ('animateTransform', {
                        attributeName:'transform',
                        type:'rotate',
                        from:'0 7.5 7.5',
                        to:'360 7.5 7.5',
                        dur:'618s',
                        repeatCount:'indefinite'
                    })
                );
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
* [SVG Basics](http://www.svgbasics.com)
* [SVG Wow](http://svg-wow.org)
* [Browser compatibility table](https://en.wikipedia.org/wiki/Comparison_of_web_browsers#Image%5Fformat%5Fsupport)
* [Browser support for aspects of SVG](http://caniuse.com/#search=svg)


## Related libraries

* [Raphaël](http://raphaeljs.com)
* [jQuery SVG](http://keith-wood.name/svg.html)