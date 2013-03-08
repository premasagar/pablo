(function(Pablo, Array){
    'use strict';

    // Set additional requirement for support
    Pablo.isSupported = Pablo.isSupported && 'keys' in Object;

    if (!Pablo.isSupported){
        return;
    }

    // EVENTS
    /*
        Features:
        * Supports optional `context` argument
        * Events can be triggered manually
        * Custom event types can be created
        * Remove all events from an element, or all events of a particular type from an element

        Note:
        `oneEach()` is not modified in this extension because it already
        passes all its arguments through to `on()` and `off()`
    */

    var namespace = '__events__'; 

    Pablo.fn.on = function(type, selectors, listener, useCapture, context){
        var boundContext, wrapper, eventData;

        // `selectors` argument not given
        if (typeof selectors === 'function'){
            context = useCapture;
            useCapture = listener;
            listener = selectors;
            selectors = null;
        }
        if (typeof useCapture === 'undefined'){
            useCapture = false;
        }

        // Allow binding and triggering events on empty collections
        // Create a container object to store state
        if (!this.length){
            Array.prototype.push.call(this, {});
        }

        // `listener` is the original callback function
        // `wrapper` is the function actually applied to the DOM element, and 
        // may modify the original listener, e.g. by changing the `this` object
        wrapper = listener;

        // If a `this` object is given, then bind the listener to the required 
        // `this` context
        if (context){
            boundContext = function(){
                listener.apply(context, arguments);
            };
            wrapper = boundContext;
        }

        // Prepare data to cache about the event
        eventData = {
            selectors:  selectors,
            listener:   listener,
            wrapper:    wrapper,
            useCapture: useCapture
        };

        // If there are multiple, space-delimited event types, then cycle 
        // through each one
        return this.processList(type, function(type){
            // Cycle through each element in the collection
            this.each(function(el){
                var node = this.length === 1 ? this : Pablo(el),
                    eventsCache = node.data(namespace),
                    cache;

                if (!eventsCache){
                    eventsCache = {};
                    node.data(namespace, eventsCache);
                }
            
                cache = eventsCache[type];
                if (!cache){
                    cache = eventsCache[type] = [];
                }

                // `selectors` have been supplied, to set a delegate event
                if (selectors){
                    // Overwrite the wrapper to make it check that the event
                    // originated on an element matching the selectors
                    wrapper = function(event){
                        if (event && event.target){
                            if (Pablo(event.target).is(selectors, node)){
                                (boundContext || listener).apply(null, arguments);
                            }
                        }
                    };
                    // Overwrite the wrapper in the data to be cached
                    eventData.wrapper = wrapper;
                }

                // Add to cache
                cache.push(eventData);

                // Add DOM listener
                if ('addEventListener' in el){
                    el.addEventListener(type, wrapper, useCapture);
                }
            });
        });
    };

    Pablo.fn.off = function(type, selectors, listener, useCapture){
        // `selectors` argument not given
        if (typeof selectors === 'function'){
            useCapture = listener;
            listener = selectors;
            selectors = null;
        }
        if (typeof useCapture === 'undefined'){
            useCapture = false;
        }
        
        // If there are multiple, space-delimited event types, then cycle 
        // through each one
        return this.processList(type, function(type){
            this.each(function(el){
                var node = this.length === 1 ? this : Pablo(el),
                    eventsCache = node.data(namespace),
                    cache, cachedType;

                if (!eventsCache){
                    return;
                }

                // Remove all event listeners
                if (!type){
                    for (cachedType in eventsCache){
                        if (eventsCache.hasOwnProperty(cachedType)){
                            node.off(cachedType);
                        }
                    }
                    return;
                }

                cache = eventsCache[type];
                if (!cache || !cache.length){
                    return;
                }

                // Remove DOM listeners and delete from cache. This uses a `some`
                // loop rather than `forEach` to allow breaking. And it uses
                // `some` rather than a `for` loop as the cache is a sparse array.
                cache.some(function(eventData, i){
                    if (
                        // If a listener has been passed, is this it?
                        (listener  === eventData.listener &&
                        useCapture === eventData.useCapture &&
                        selectors  === eventData.selectors) ||

                        // Or if no listener was passed...
                        (!listener && (
                            !selectors || selectors === eventData.selectors
                        )
                    )){
                        // Remove DOM listener
                        if ('removeEventListener' in el){
                            el.removeEventListener(type, eventData.wrapper, useCapture);
                        }

                        // If looking for a specific listener, remove from cache
                        // and break the loop. NOTE: if the listener was set 
                        // multiple times, it will need removal multiple times.
                        if (listener){
                            delete cache[i];
                            return true;
                        }
                    }
                });

                // Delete the cache container for this event type, if empty
                if (!listener || !Object.keys(eventsCache[type]).length){
                    delete eventsCache[type];
                }
                // Delete the events container for this element, if empty
                if (!Object.keys(eventsCache).length){
                    node.removeData(namespace); 
                }
            });
        });
    };

    Pablo.fn.one = function(type, selectors, listener, useCapture, context){
        var collection = this;

        // `selectors` argument not given
        if (typeof selectors === 'function'){
            context = useCapture;
            useCapture = listener;
            listener = selectors;
            selectors = null;
        }

        function removeListener(){
            // Remove listener and additional listener
            collection.off(type, selectors, listener,       useCapture, context)
                      .off(type, selectors, removeListener, useCapture, context);
        }

        // Add the original listener, and an additional listener that removes
        // the first, and itself. The reason a single wrapper is not used
        // instead of two separate listeners is to allow manual removal of
        // the original listener (with `.off()`) before it ever triggers.
        return this.on(type, selectors, listener,       useCapture, context)
                   .on(type, selectors, removeListener, useCapture, context);
    };

    // TODO: optional `context` as second argument?
    Pablo.fn.trigger = function(type /*, arbitrary args to pass to listener*/){
        var args = arguments.length > 1 ?
            Pablo.toArray(arguments).slice(1) : null;

        return this.each(function(el){
            var node = this.length === 1 ? this : Pablo(el),
                eventsCache = node.data(namespace);

            if (eventsCache){
                // If there are multiple, space-delimited event types, then cycle 
                // through each one
                this.processList(type, function(type){
                    var cache = eventsCache[type];
                    if (cache){
                        cache.forEach(function(eventData){
                            eventData.wrapper.apply(node, args);
                        }, node);
                    }
                });
            }
        });
    };

}(window.Pablo, window.Array));