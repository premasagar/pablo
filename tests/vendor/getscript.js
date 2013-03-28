/*!
* getscript.js
*   github.com/premasagar/cmd.js/tree/master/lib/getscript.js
*
*//*
    a single script loader

    by Premasagar Rose
        dharmafly.com

    license
        opensource.org/licenses/mit-license.php
        
    v0.2

*//*global window */

/**
 * Load a script into a <script> element
 * @param {String} src The source url for the script to load
 * @param {Function} callback Called when the script has loaded
 */

// Load a script into a <script> element
function getscript(src, callback, options){
    "use strict";
    
    var document = window.document,
        head = document.head || document.getElementsByTagName("head")[0],
        script = document.createElement("script"),
        loaded = false;
    
    options = options || {};
        
    function finish(){
        // Clean up circular references to prevent memory leaks in IE
        script.onload = script.onreadystatechange = script.onerror = null;
        
        // Remove script element once loaded
        if (!options.keep){
            head.removeChild(script); 
        }                    
        callback && callback.call(options.target || window, loaded);
    }
    
    script.type = "text/javascript"; // This is the default for HTML5+ documents, but should should be applied for pre-HTML5 documents, or errors may be seen in some browsers.
    
    script.charset = options.charset || "utf-8";
    
    script.onload = script.onreadystatechange = function(){
        var state = this.readyState;
        
        if (!loaded && (!state || state === "complete" || state === "loaded")){
            loaded = true;
            finish();
        }
    };
    
    // NOTE: doesn't work in IE. Maybe IE9?
    script.onerror = finish;
    
    // Async loading (extra hinting for compliant browsers)
    script.async = true;
    
    // Apply the src, with an optional `noCache` setting, to bust browser cache
    script.src = src +
        (options.noCache ? "?v=" + (new Date()).getTime() : "");
    
    // Go...
    head.appendChild(script);
}
