(function(Pablo){
    'use strict';

    if (!Pablo.isSupported){
        return;
    }
    // CACHE

    var cache = Pablo.cache = {},
        nextId = 1,
        expando = 'pablo';

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
            return;
        }

        // Delete a specific key
        data = cache[id];
        if (data){
            // Delete the key
            if (Object.keys(data).length > 1){
                delete cache[id][key];
            }

            // The data container is empty, so delete it
            delete cache[id];
        }
    }

    /////

    // DATA

    Pablo.fn.data = function(key, value){
        var id;

        // Get value
        if (typeof value === 'undefined'){
            id = getId(this[0]);

            if (id && id in cache){
                return cache[id][key];
            }
        }
        // Set value
        else {
            return this.each(function(el){
                var id = getId(el) || createId(el);

                if (!cache[id]){
                    cache[id] = {};
                }
                cache[id][key] = value;
            });
        }
    };

    Pablo.fn.removeData = function(keys){
        return this.each(function(el){
            this.processList(keys, function(key){
                removeData(el, key);
            });
        });
    };

    Pablo.fn.detach = Pablo.fn.remove;

    Pablo.fn.remove = function(){
        return this.removeData().detach();
    };

}(window.Pablo));