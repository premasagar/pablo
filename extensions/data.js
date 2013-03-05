
if (window.Pablo.isSupported){
    (function(Pablo){
        'use strict';

        var data = {},
        	nextId = 1,
        	expando = 'pabloId';

        function getId(el){
        	return el[expando];
        }

        function createId(el){
        	var id = el[expando] = nextId ++;
    		data[id] = {values: {}};
    		return id;
        }

        Pablo.fn.data = function(key, value){
        	var id;

        	if (typeof value === 'undefined'){
        		id = getId(this[0]);
        		if (id in data){
        			return data[id].values[key];
        		}
        	}
        	else {
        		return this.each(function(el){
        			var id = getId(el) || createId(el);
        			data[id].values[key] = value;
        		});
        	}
        };

        Pablo.fn.removeData = function(){
        	return this.each(function(el){
    			var id = getId(el);
    			if (id in data){
    				delete data[id];
    			}
    		});	
        }

        Pablo.fn.detach = Pablo.fn.remove;

        Pablo.fn.remove = function(){
        	return this.removeData().detach();
        }

    }(window.Pablo));
}