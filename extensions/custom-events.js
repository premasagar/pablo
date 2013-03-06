if (window.Pablo.isSupported){
    (function(Pablo){
        'use strict';

        // EVENTS
        /*
        	Features:
        	* Optional `context` argument
        	* Events can be triggered manually
        	* Custom event types can be created

        	Note:
        	`one()` and `oneEach()` are not modified in this extension but they
        	anyway utilise the optional `context` argument in Pablo core
        */

        // TODO: implement `.off()` with no args to remove all listeners
        // TODO: implement delegate events (will need to change core one/oneEach too)

        var prefix = '__events__'; 

        Pablo.fn.on = function(type, listener, useCapture, context){
        	var wrapper, event;

			if (context){
				wrapper = function(){
					listener.apply(context, arguments);
				};
			}
			event = {
				listener:   listener,
				wrapper:    wrapper,
				useCapture: useCapture || false
			};

			return this.processList(type, function(type){
				var key = prefix + type;

				this.each(function(el){
	        		var node = Pablo(el),
	        			eventCache = node.data(key);

		        	if (!eventCache){
		        		eventCache = [];
		        		node.data(key, eventCache);
		        	}

		        	// Add to cache
					eventCache.push(event);

					// Add DOM listener
					el.addEventListener(type, wrapper || listener, useCapture);
	        	});
			});
        };

        Pablo.fn.off = function(type, listener, useCapture){
        	return this.processList(type, function(type){
        		var key = prefix + type;

        		if (typeof useCapture === 'undefined'){
        			useCapture = false;
        		}

        		this.each(function(el){
        			var node = Pablo(el),
        				eventCache = this.data(key);

        			if (eventCache){
		        		// Use `some` rather than `forEach` to allow breaking 
		        		// the loop. Use `some` rather than `for` as it's a 
		        		// sparse array.
		        		eventCache.some(function(event, id){
		        			var wrapper;
		        			if (event.listener === listener && event.useCapture === useCapture){
		        				wrapper = event.wrapper;

		        				// Remove from cache
		        				delete eventCache[id];

		        				// Remove DOM listener
								el.removeEventListener(type, wrapper || listener, useCapture);
		        				return true;
		        			}
		        		}, this);
		        	}
        		});
        	});
        };

        Pablo.fn.trigger = function(type){
        	var key = prefix + type,
        		eventCache = this.data(key),
        		args = Pablo.toArray(arguments).slice(1);

        	if (eventCache){
        		eventCache.forEach(function(event){
        			(event.wrapper || event.listener).apply(this, args);
        		}, this);
        	}
        	return this;
        };

    }(window.Pablo));
}