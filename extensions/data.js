
if (window.Pablo.isSupported){
    (function(Pablo){
        'use strict';

        var cache = {},
        	nextId = 1,
        	expando = 'pabloId';

        function getId(el){
        	return el[expando];
        }

        function createId(el){
        	var id = el[expando] = nextId ++;
    		cache[id] = {};
    		return id;
        }

        function removeId(el){
        	var id = getId(el);
			if (id && id in cache){
				delete cache[id];
			}
        }

        // -> Pablo.dataType()
        function createCache(cacheType){
        	return function(key, value){
	        	var id;

	        	// Get value
	        	if (typeof value === 'undefined'){
	        		id = getId(this[0]);

	        		if (id && id in cache && cacheType in cache[id]){
	        			return cache[id][cacheType][key];
	        		}
	        	}
	        	// Set value
	        	else {
	        		return this.each(function(el){
	        			var id = getId(el) || createId(el);

	        			if (!cache[id]){
	        				cache[id] = {};
	        			}
	        			if (!(cacheType in cache[id])){
	        				cache[id][cacheType] = {};
	        			}
						cache[id][cacheType][key] = value;
	        		});
	        	}
	        };
        }

        Pablo.fn.data = createCache('data');

        Pablo.fn.removeData = function(){
        	return this.each(removeId);	
        }

        Pablo.fn.detach = Pablo.fn.remove;

        Pablo.fn.remove = function(){
        	return this.removeData().detach();
        }

    }(window.Pablo));
}