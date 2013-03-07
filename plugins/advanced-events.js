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

        Note:
        `oneEach()` is not modified in this extension because it already
        passes all its arguments through to `on()` and `off()`
    */

    // TODO: implement `.off()` with no args to remove all listeners

    var prefix = '__events__'; 

    Pablo.fn.on = function(type, selectors, listener, useCapture, context){
        var boundContext, wrapper, event;

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
        event = {
            selectors:  selectors,
            listener:   listener,
            wrapper:    wrapper,
            useCapture: useCapture
        };

        // If there are multiple, space-delimited event type, then cycle through
        // each one
        return this.processList(type, function(type){
            var key = prefix + type;

            // Cycle through each element in the collection
            this.each(function(el){
                var node = Pablo(el),
                    // Retrieve the element's cached event data
                    eventCache = node.data(key);

                // Create a container for the cached event data
                if (!eventCache){
                    eventCache = [];
                    node.data(key, eventCache);
                }

                // Delegate events
                if (selectors){
                    wrapper = event.wrapper = function(event){
                        var target = event && event.target;
                        if (target){
                            if (Pablo(target).is(selectors, node)){
                                (boundContext || listener).apply(null, arguments);
                            }
                        }
                    };
                }

                // Add to cache
                eventCache.push(event);

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
            var key = prefix + type;

            this.each(function(el){
                var node = Pablo(el),
                    eventCache = node.data(key);

                if (eventCache){
                    // Use `some` rather than `forEach` to allow breaking 
                    // the loop. Use `some` rather than `for` as it's a 
                    // sparse array.
                    eventCache.some(function(event, i){
                        if (listener === event.listener &&
                            useCapture === event.useCapture &&
                            selectors === event.selectors
                        ){
                            // Remove from cache
                            delete eventCache[i];

                            // Remove DOM listener
                            el.removeEventListener(type, event.wrapper, useCapture);
                            return true;
                        }
                    }, this);
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
        // the first, and itself. The reason a wrapper listener is not used
        // instead of two separate listeners is to allow manual removal of
        // the original listener (with `.off()`) before it ever triggers.
        return this.on(type, selectors, listener,       useCapture, context)
                   .on(type, selectors, removeListener, useCapture, context);
    };

    // TODO: optional `context` as second argument?
    Pablo.fn.trigger = function(type /*, arbitrary args to pass to listener*/){
        var key = prefix + type,
            eventCache = this.data(key),
            args = Pablo.toArray(arguments).slice(1);

        if (eventCache){
            eventCache.forEach(function(event){
                event.wrapper.apply(this, args);
            }, this);
        }
        return this;
    };

}(window.Pablo));