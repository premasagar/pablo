# Pablo

[Pablo][pablo-site] is a lightweight, expressive JavaScript library to create interactive drawings with [SVG][svg] (Scalable Vector Graphics).

Pablo exposes a simple interface to create and manipulate SVG elements and complex structures, giving access to all of SVG's granularity and power. The library stays lean by targetting the most recent desktop and mobile browsers, and failing gracefully in older browsers.

- By [Premasagar Rose][prem] ([Dharmafly][df])
- Repo: [github.com/dharmafly/pablo][repo]
- Open source: [MIT license][mit]
- &lt;3KB [minified & gzipped][pablo-min]

**For full documentation and interactive examples, see [pablojs.com][pablo-site].**


## Getting started

For production, download <a href="https://github.com/downloads/dharmafly/pablo/pablo.min.js" target="_blank">the minified script</a> and call it from your HTML:

    <script src="pablo.min.js"></script>

Start drawing:

    if (Pablo.isSupported){
        // Inside an HTML element, append an <svg> root
        var paper = Pablo(demoElement).root({height:160});

        // Append SVG elements, specifying their attributes
        paper.circle({
            r:80, cx:80, cy:80,
            fill:'orange'
        });
    }

Pablo can do anything that SVG can do, in a simple, expressive way. See the [API Reference][reference] to discover Pablo's extensive API.

The [Changelog][changelog] lists API changes. Please add bug reports and feedback on the GitHub ['Issues' page][issues] or contact [@premasagar][prem-twitter].


[prem]: http://premasagar.com
[prem-twitter]: https://twitter.com/premasagar
[df]: http://dharmafly.com
[mit]: http://opensource.org/licenses/mit-license.php
[svg]: https://developer.mozilla.org/en/SVG
[pablo-site]: http://pablojs.com
[repo]: https://github.com/dharmafly/pablo
[issues]: https://github.com/dharmafly/pablo/issues
[changelog]: http://pablojs.com/details/#changelog
[pablo-min]: https://github.com/downloads/dharmafly/pablo/pablo.min.js