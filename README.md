# Pablo

**For full documentation and interactive examples, see [pablojs.com][pablo-site].**


**[Pablo][pablo-site]** is a high-performance JavaScript library for creating and manipulating SVG ([scalable vector graphics][svg]). Its API is inspired by [jQuery][jquery], [Underscore][_] and [Raphaël][raphael]. It targets modern desktop and mobile browsers, and is less than 5KB, with no dependencies.

_Some example uses:_ interactive drawings, data visualisation, games, responsive graphics and rich visual interfaces.

Pablo is low-level, lightweight and expressive. It exposes a simple interface that gives access to all of SVG's granularity and power, creating and manipulating collections of SVG elements. The library stays fast and lean by targetting the most recent desktop and mobile browsers, while failing gracefully elsewhere.

Pablo can create anything that SVG can. It simplifies the task of generating, modifying and interacting with the graphics, and connecting it to the other parts of a JavaScript program.

[See the API Reference][api] for Pablo's extensive API.

- By [Premasagar Rose][prem] ([Dharmafly][df])
- Repo: [github.com/dharmafly/pablo][repo]
- Open source: [MIT license][mit]
- <5KB [minified & gzipped][pablo-min]


## Getting started

For production, download <a href="https://raw.github.com/dharmafly/pablo/master/build/pablo.min.js" target="_blank">the minified script</a> and call it from your HTML:

    <script src="pablo.min.js"></script>


Check that the browser supports basic SVG:

    if (Pablo.isSupported){
        /* Pablo code here */
        alert('Yes!');
    }
    else {
        /* Alternative content */
        alert("Noo");
    }


Start drawing:

    /* Inside an HTML element, append an <svg> root */
    var paper = Pablo(demoElement).svg({height:220}),
        /* Create <circle> element, with attributes */
        circle = paper.circle({
            cy: '50%',
            fill: 'rgba(127, 159, 95, 0.2)',
            stroke: '#777'
        });

    /* Duplicate the element */
    circle.duplicate(20)
        /* Modify attributes */
        .attr({
            /* Attribute functions, called for each element */
            cx: function(el, i) {return i * 4 + 1 + '%'},
            r:  function(el, i) {return i + 1 + '%'}
        })
        /* Add a listener for mouseover & touchstart events */
        .on('mouseover touchstart', function(){
            /* Wrap this element in a Pablo collection */
            var circle = Pablo(this),
                /* Create a random position and colour */
                r = parseInt(circle.attr('r'), 10),
                xMax = 100 - r * 2,
                cx = xMax * Math.random() + r + '%',
                hue = Math.random() * 360,
                color = 'hsla(' + hue + ', 90%, 50%, 0.2)';

            / * Apply new attributes to the <circle> element */
            circle.attr({cx:cx, fill:color});
        });


**See the [API Reference][api] for full details.**

## Tests

The (currently incomplete) [test suite][tests] is available to run in the browser at `tests/index.html`.

## Extra

It's early days, so your feedback is welcome. For bug reports and requests, please use the GitHub ['Issues' page][issues] or contact [@premasagar][prem-twitter].

[Pull requests][pull-requests] are welcome. To update the pages on [pablojs.com][pablo-site], the [Markdown][markdown-syntax] files in the [/docs folder][docs-folder] should be changed.


[prem]: http://premasagar.com
[prem-twitter]: https://twitter.com/premasagar
[df]: http://dharmafly.com
[mit]: http://opensource.org/licenses/mit-license.php
[svg]: https://developer.mozilla.org/en/SVG
[pablo-site]: http://pablojs.com
[repo]: https://github.com/dharmafly/pablo
[issues]: https://github.com/dharmafly/pablo/issues
[tests]: https://github.com/dharmafly/pablo/tree/master/tests
[changelog]: http://pablojs.com/details/#changelog
[pablo-min]: https://github.com/downloads/dharmafly/pablo/pablo.min.js
[raphael]: http://raphaeljs.com
[jquery]: http://jquery.com
[_]: http://underscorejs.org
[api]: http://pablojs.com/api/
[docs-folder]: https://github.com/dharmafly/pablo/tree/master/docs
[pull-requests]: https://help.github.com/articles/using-pull-requests
[markdown-syntax]: http://daringfireball.net/projects/markdown/syntax