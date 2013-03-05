if (window.Pablo.isSupported){
    (function(Pablo){
        'use strict';

        // EVENTS
        /*
        	Features:
        	* Optional `context` argument
        	* Events can be triggered manually
        	* Custom event types can be created
        */

        // TODO: process space-delimited list of event types
        // TODO: implement `.off()` with no args to remove all listeners

        var prefix = '__events__',
        	_on  = Pablo.fn.on,
        	_off = Pablo.fn.off;

        Pablo.fn.on = function(type, listener, useCapture, context){
        	var key = prefix + type,
        		eventCache = this.data(key),
        		wrapper;

        	if (!eventCache){
        		eventCache = [];
        		this.data(key, eventCache);
        	}
			if (context){
				wrapper = function(){
					listener.apply(context, arguments);
				};
			}
			eventCache.push({
				listener:   listener,
				wrapper:    wrapper,
				useCapture: useCapture || false
			});
			_on.call(this, type, wrapper || listener, useCapture);

        	return this;
        }

        Pablo.fn.off = function(type, listener, useCapture){
        	var key = prefix + type,
        		eventCache = this.data(key),
        		wrapper;

        	if (eventCache){
        		useCapture || (useCapture = false);

        		// Use `some` rather than `forEach` to allow breaking the loop.
        		// Only defined array elements appear, unlike with a `for` loop.
        		eventCache.some(function(event, id){
        			if (event.listener === listener && event.useCapture === useCapture){
        				wrapper = event.wrapper;
        				delete eventCache[id];
        				_off.call(this, type, wrapper || listener, useCapture);
        				return true;
        			}
        		}, this);
        	}
        	return this;
        }

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