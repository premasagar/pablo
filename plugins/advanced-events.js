(function(Pablo){
    'use strict';

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

        wrapper = listener;

        // If a `this` object is given, then the listener is bound to a wrapper 
        // function that uses the required `this` context
        if (context){
            boundContext = function(){
                listener.apply(context, arguments);
            };
            wrapper = boundContext;
        }

        // Prepare data to be cached about the event
        eventData = {
            selectors:  selectors,
            listener:   listener,
            wrapper:    wrapper,
            useCapture: useCapture
        };

        // If there are multiple, space-delimited event type, then cycle through
        // each one
        return this.processList(type, function(type){
            // Cycle through each element in the collection
            this.each(function(el){
                var node = Pablo(el),
                    eventsCache = node.data(namespace),
                    cache, nodeEventData;

                if (!eventsCache){
                    eventsCache = {};
                    node.data(namespace, eventsCache);
                }
            
                cache = eventsCache[type];
                if (!cache){
                    cache = eventsCache[type] = [];
                }

                // Delegate events
                if (selectors){
                    wrapper = function(event){
                        var target = event && event.target;
                        if (target){
                            // Find elements matching selectors within this element
                            if (Pablo(target).is(selectors, node)){
                                (boundContext || listener).apply(null, arguments);
                            }
                        }
                    };
                    nodeEventData = Pablo.extend({wrapper:wrapper}, eventData);
                }

                // Add to cache
                cache.push(nodeEventData || eventData);

                // Add DOM listener
                el.addEventListener(type, wrapper, useCapture);
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

        return this.processList(type, function(type){
            this.each(function(el){
                var node = Pablo(el),
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

                // Remove event listeners of a specific type
                if (!listener){
                    // Remove DOM listeners
                    cache.forEach(function(eventData){
                        if (!selectors || (selectors && selectors === eventData.selectors)){
                            el.removeEventListener(type, eventData.wrapper, eventData.useCapture);
                        }
                    });

                    // Remove cache for this type
                    delete eventsCache[type];
                    // TODO: delete cache container if empty
                    return;
                }

                // Use `some` rather than `forEach` to allow breaking 
                // the loop. Use `some` rather than `for` as it's a 
                // sparse array.
                cache.some(function(eventData, i){
                    if (listener   === eventData.listener &&
                        useCapture === eventData.useCapture &&
                        selectors  === eventData.selectors
                    ){
                        // Remove DOM listener
                        el.removeEventListener(type, eventData.wrapper, useCapture);

                        // Remove from cache
                        delete eventData[i];
                        // TODO: delete cache container if empty
                        return true;
                    }
                });
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
        // the first, and itself. The reason a wrapper listener is not used
        // instead of two separate listeners is to allow manual removal of
        // the original listener (with `.off()`) before it ever triggers.
        return this.on(type, selectors, listener,       useCapture, context)
                   .on(type, selectors, removeListener, useCapture, context);
    };

    // TODO: optional `context` as second argument?
    Pablo.fn.trigger = function(type /*, arbitrary args to pass to listener*/){
        var eventsCache = this.data(namespace),
            args;

        if (!eventsCache){
            return this;
        }

        // Additional arguments are passed on to the triggered listeners
        if (arguments.length > 1){
            args = Pablo.toArray(arguments).slice(1);
        }

        return this.processList(type, function(type){
            var cache = eventsCache[type];
            if (cache){
                cache.forEach(function(eventData){
                    eventData.wrapper.apply(this, args);
                }, this);
            }
        });
    };

}(window.Pablo));