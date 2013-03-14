/*jshint newcap:false */
(function(Pablo, Array){
    'use strict';

    // Set additional requirement for support
    Pablo.isSupported = Pablo.isSupported && 'keys' in Object;

    if (!Pablo.isSupported){
        return;
    }

    // CACHE

    var cache = Pablo.cache = {},
        nextId = 1,
        expando = 'pablo-data';

    function getId(el){
        return el[expando];
    }

    function createId(el){
        var id = el[expando] = nextId ++;
        cache[id] = {};
        return id;
    }

    function removeData(el, key){
        var id = getId(el),
            data;

        // Delete all keys
        if (!key){
            delete cache[id];
        }

        else {
            // Delete a specific key
            data = cache[id];
            if (data){
                // Delete the key
                if (Object.keys(data).length > 1){
                    delete cache[id][key];
                }
                // The data container is empty, so delete it
                else {
                    delete cache[id];
                }
            }
        }
    }

    // NOTE: a more brittle alternative, perhaps with better performance, would 
    // be to increment a size counter upon creating a new cache container, and 
    // decrement on deletion. The success of deletion would have to be 
    // determined before decrementing the counter. If `Pablo.cache` was 
    // manipulated by external code, the counter would become incorrect, which 
    // could potentially result in a memory leak. Probably not worth it.
    function numKeys(){
        return Object.keys(cache).length;
    }

    /////

    // DATA

    Pablo.fn.data = function(key, value){
        var id, data;

        if (typeof key === 'string'){
            // Get value
            if (typeof value === 'undefined'){
                if (this.length){
                    // Use the id of the first element in the collection
                    id = getId(this[0]);

                    // Return the cached value, by key
                    if (id && id in cache){
                        return cache[id][key];
                    }
                }
                return;
            }

            // Prepare object to set
            data = {};
            data[key] = value;
        }

        // First argument is an object of key-value pairs
        else {
            data = key;
        }

        // Set value
        // Allow binding and triggering events on empty collections by create a 
        // container object to store state.
        if (!this.length){
            // TODO: change to arrayProto
            Array.prototype.push.call(this, {});
        }
        
        return this.each(function(el){
            var id = getId(el) || createId(el),
                key;

            if (!cache[id]){
                cache[id] = {};
            }

            for (key in data){
                if (data.hasOwnProperty(key)){
                    cache[id][key] = data[key];
                }
            }
        });
    };

    Pablo.fn.removeData = function(keys){
        // Remove single or multiple, space-delimited keys
        if (keys){
            return this.processList(keys, function(key){
                this.each(function(el){
                    removeData(el, key);
                });
            });
        }
        // Remove everything
        return this.each(removeData);
    };

    Pablo.fn.detach = Pablo.fn.remove;

    Pablo.fn.remove = function(){
        // If the cache has any contents
        if (numKeys()){
            // Remove data for each element in the collection
            this.removeData()
                // Remove data for each descendent of each element
                .find('*').removeData();
        }

        // Remove from the DOM
        return this.detach();
    };

    Pablo.fn.empty = function(){
        // If the cache has any contents
        if (numKeys()){
            // Remove data for each descendent of elements in the collection
            this.find('*').removeData();
        }

        // Remove elements, text and other nodes
        // This uses native DOM methods, rather than `detach()`, to ensure that
        // non-element nodes are also removed.
        return this.each(function(el){
            while (el.firstChild){
                el.removeChild(el.firstChild);
            }
        });
    };

}(window.Pablo, window.Array));