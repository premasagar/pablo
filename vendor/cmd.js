/*!
* cmd
*   github.com/premasagar/cmd.js
*
*//*
    a lightweight, asynchronous flow controller / file loader

    by Premasagar Rose
        premasagar.com

    license
        opensource.org/licenses/mit-license.php
        
    v0.2

*/
var cmd = (function(window){
    "use strict";

    // Array methods, from underscore.js
    var slice = Array.prototype.slice,
        toString = Object.prototype.toString,
        isArray = function(obj){
            return toString.call(obj) === "[object Array]";
        };
    
    /////

    // Load a script into a <script> element
    function getscript(src, callback, options){
        var document = window.document,
            head = document.head || document.getElementsByTagName("head")[0],
            script = document.createElement("script"),
            loaded = false;
            
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
        
        // NOTE: doesn't work in IE6-8, so 'failure' callbacks will not fire. Works in IE9+ and other browsers
        // Currently, if you need to have a 'failure' callback in IE6-8, then setTimeout in the calling script and if the success callback hasn't fired within, say 30 seconds, then assume that the script failed to load. Future versions of cmd.js may allow `option.timeout`, to handle this situation.
        script.onerror = finish;
        
        // Async loading (extra hinting for compliant browsers)
        script.async = true;
        
        // Apply the src, with an optional `noCache` setting, to bust browser cache
        script.src = (options.path || "") + src +
            (options.noCache ? "?v=" + (new Date()).getTime() : "");
        
        // Go...
        head.appendChild(script);
    }
    
    /////

    function flow(){
        var queue = slice.call(arguments),
            lastItem = queue[queue.length - 1],
            options = {}; // Create a blank `options` object, to be re-used for each subsequent script load.
        
        // Retrieve options
        if (typeof lastItem === "object" && !isArray(lastItem)){
            options = lastItem;
            queue = queue.slice(0, -1);
        }
        
        ////
        
        // Process the next item in the queue
        // (We run this straight away, to set the chain in motion)
        (function nextItem(response){
            var item = queue.shift(),
                i, numItems, pending, groupStatus, individualCallback;
                
            // Only proceed if the item is 'truthy'
            // This allows conditionals to be used, e.g. to load scripts under certain circumstances, such as
            // cmd("1.js", isTheSkyBlue ? "2.js" : null, "3.js")
            if (item !== null){
                // script src
                if (typeof item === "string"){
                    getscript(item, nextItem, options);
                }
                
                // Callback function - pass it the response of the previous item
                else if (typeof item === "function"){
                    nextItem(
                        item.call(options.target || window, response)
                    );
                }
                
                // Array of script src's - a group of items
                else if (isArray(item)){
                    // Track whether all scripts in this group have been successfully loaded
                    groupStatus = true;
                    numItems = pending = item.length;
                    
                    individualCallback = function(response){
                        // If the script failed to load (or the callback returned false), then change the groupStatus
                        if (response === false){
                            groupStatus = response;
                        }
                        
                        // Reduce the counter
                        pending --;
                        
                        // Check if we're finished
                        if (!pending){
                            nextItem(groupStatus);
                        }
                    };
                    
                    // Process all items in the group
                    for (i = 0; i < numItems; i++){
                        cmd(item[i], individualCallback, options);
                    }
                }
            }
        }());
    }
    
    return flow;
}(this));
/*jslint white: true, nomen: true, plusplus: true, maxerr: 50, indent: 4 */