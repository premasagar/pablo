--- 
category: overview
heading: Getting started
---

For production, <a href="https://github.com/downloads/dharmafly/pablo/pablo.min.js" target="_blank">download the minified script</a>.

Include it in your HTML:

	<script src="pablo.min.js"></script>

Start drawing:

	if (Pablo.isSupported){
		// Wrap an HTML element (or CSS selector, array or nodeList)
		Pablo(demoElement)
			// Create an <svg> root element
			.root({height:200})
			// Add SVG elements
			.circle({cx:100, cy:100, r:100, fill:'blue'});
	}

The rest is just details...
See the [Reference section][reference] to discover Pablo's extensive API.

The [Changelog][pablo-changelog] lists API changes. Please add bug reports and feedback on the GitHub ['Issues' page][pablo-issues] or contact [@premasagar][prem-twitter].*

[reference]: reference/
[pablo-issues]: https://github.com/dharmafly/pablo/issues
[pablo-changelog]: http://pablojs.com/details/#changelog
[prem-twitter]: https://twitter.com/premasagar