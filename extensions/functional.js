// Create a functional API for wrapped Pablo collections
// enable with: Pablo.useFunctional()
// turn off with Pablo.useFunctional(false)
(function(Pablo){
    'use strict';

    var createPabloDefault = Pablo.create;

    // Console.log response
    function toString(){
        var elementList = '';
        
        this.each(function(el){
            elementList += '<' + el.nodeName.toLowerCase();
            if (el.attributes.length && JSON && JSON.stringify){
                elementList += ' ' + JSON.stringify(Pablo.getAttributes(el))
                    .replace(/","/g, '", ')
                    .replace(/^{"|}$/g, '')
                    .replace(/":"/g, '="');
            }
            elementList += '>, ';
        });
        // Remove trailing slash
        elementList = elementList.slice(0,-2);

        return '(' + elementList + ')';
    }

    function refreshCachedElements(target, source){
        var prop;
        
        // Copy over elements from pabloNode - e.g. pabloNode[0], pabloNode[1], etc
        for (prop in source){
            if (source.hasOwnProperty(prop) && !isNaN(Number(prop)) && prop !== 'length'){
                target[prop] = source[prop];
            }
        }
    }
    
    // Return a function wrapper around a PabloNode instance
    function createPabloFn(node, attr){
        var extend = Pablo.extend,
            pabloNode = createPabloDefault(node, attr),
            api = extend(
                function(node, attr){
                    if (attr || Pablo.canBeWrapped(node)){
                        pabloNode.append(node, attr);
                        return api;
                    }
                    else {
                        return Pablo(pabloNode.find(node));
                    }
                },
                Pablo.fn,
                {
                    collection: pabloNode,
                    toString: toString, // Used for console logging
                    size: function(){
                        return this.collection.size();
                    },
                    push: function(node){
                        this.collection.push(node);
                        this[this.size() -1] = this.collection.slice(-1);
                        return this;
                    },
                    unshift: function(node){
                        this.collection.unshift(node);
                        refreshCachedElements(this, this.collection);
                        return this;
                    },
                    pop: function(){
                        // Remove last element
                        delete this [this.size() -1];
                        this.collection.pop();
                        return this;
                    },
                    shift: function(){
                        // Remove last element
                        delete this [this.size() -1];
                        this.collection.shift();
                        refreshCachedElements(this, this.collection);
                        return this;
                    },
                    each: function(fn){
                        this.collection.each(fn);
                        return this;
                    }
                },
                true
            ),
            prop;

        refreshCachedElements(api, pabloNode);
        return api;
    }

    // Turn on or off the functional wrapper API. The default API returns when functional wrapper is switched off.
    Pablo.useFunctional = function(yes){
        Pablo.create = (yes !== false) ? createPabloFn : createPabloDefault;
        return this;
    };
}(window.Pablo));