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

    function removeData(el){
        var id = getId(el);
        delete(cache[id]);
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

    Pablo.fn.removeData = function(){
        return this.each(removeData);    
    };

    Pablo.fn.detach = Pablo.fn.remove;

    Pablo.fn.remove = function(){
        return this.removeData().detach();
    };

}(window.Pablo));