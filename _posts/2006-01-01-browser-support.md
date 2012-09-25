--- 
category: reference
heading: Browser support
---
   
`Pablo.isSupported`
-------------------

Boolean `true` or `false`, denoting whether or not the current browser supports the web technologies required by Pablo.

	if (Pablo.isSupported){
        alert('Pablo works!');
    }
    else {
        alert('Not supported!');
    }

Use this check in unknown environments to ensure that Pablo-specific code is only executed if the browser supports it.

Some discrepancies between browsers are supported, but Pablo's code is kept lean by targeting only modern desktop and mobile browsers. The browser must provide [basic SVG support][svg-support], as well as some [ECMAScript5 features][ecma5-support] (the browsers that support SVG also usually support ECMAScript5). Pablo exits gracefully in non-supported browsers.

[svg-support]: http://caniuse.com/#search=svg
[ecma5-support]: http://kangax.github.com/es5-compat-table/