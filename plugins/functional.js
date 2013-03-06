// Create a functional API for wrapped Pablo collections
// enable with: Pablo.useFunctional()
// turn off with Pablo.useFunctional(false)

(function(Pablo){
    'use strict';

    if (!Pablo.isSupported){
        return;
    }

    var createPabloDefault = Pablo.create,
        isPabloDefault = Pablo.isPablo,
        pabloCollectionApi;

    function refreshCachedElements(target, source){
        var prop;
        
        // Copy over elements from pabloCollection - e.g. pabloCollection[0], pabloCollection[1], etc
        for (prop in source){
            if (source.hasOwnProperty(prop) && !isNaN(Number(prop)) && prop !== 'length'){
                target[prop] = source[prop];
            }
        }
    }

    pabloCollectionApi = Pablo.extend(
        {},
        Pablo.fn,
        {
            toArray: function(){
                return this.collection.toArray();
            },
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
    );

    // enhanced console.log response
    if (JSON && JSON.stringify){
        pabloCollectionApi.toString = function(){
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
        };
    }
    
    // Return a function wrapper around a pabloCollection instance
    function createPabloFn(node, attr){
        var extend = Pablo.extend,
            pabloCollection = createPabloDefault(node, attr),
            api = extend(
                function(node, attr){
                    if (attr || Pablo.canBeWrapped(node)){
                        pabloCollection.append(node, attr);
                        return api;
                    }
                    else {
                        return Pablo(pabloCollection.find(node));
                    }
                },
                pabloCollectionApi
            );

        api.collection = pabloCollection;
        refreshCachedElements(api, pabloCollection);
        return api;
    }

    Pablo.isPablo = function(obj){
        return isPabloDefault(obj) || !!obj && obj.collection instanceof Pablo.Collection;
    };

    // Turn on or off the functional wrapper API. The default API returns when functional wrapper is switched off.
    Pablo.useFunctional = function(yes){
        Pablo.create = (yes !== false) ? createPabloFn : createPabloDefault;
        return this;
    };

}(window.Pablo, window.JSON));