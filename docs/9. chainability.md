---
category: reference
---

Pablo supports chainability for some of its methods.

    var paper = Pablo($output[0]).root({width:300, height:320});

    paper
        ._('circle', {cx:200, cy:150, r:50, fill:'#f33', stroke:'#050'})
        ._('ellipse', {
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
        ._('polyline', {
            points:'120,100 200,25 280,100',
            stroke:'#444',
            fill:'none',
            // Hyphenated attribute names must be passed as strings
            // since CamelCased attribute names are not (yet) supported
            'stroke-linejoin':'round',
            'stroke-linecap':'round'
        });

Pablo allows for chaining off svg shorthands like `.defs()` or `.text()`.

    var paper = Pablo($output[0]).root({height:320});

    // Make a svg definition element and append a path element to it
    paper
        .defs()
        ._('path', {
            id:'squiggle',
            d:'M 20 80 C 20 120 120 20 220 120 C 320 220 420 320 420 120'
        });

    // Make a text element and append a textPath element to it.
    paper
        .text()
        ._('textPath', {
            _link:'#squiggle',
            _content:'★ In Xanadu, did Kublah Khan a stately pleasuredome decree…',
            fill:'#997099'
        })