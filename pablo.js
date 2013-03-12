/*!
    Pablo <http://pablojs.com>

    by Premasagar Rose <http://premasagar.com>,
       Dharmafly <http://dharmafly.com>

    Repo: <https://github.com/dharmafly/pablo>
    MIT license: http://opensource.org/licenses/mit-license.php

*/
/*jshint newcap:false */
var Pablo = (function(document, Array, Element, SVGElement, NodeList, HTMLDocument){
    'use strict';
    
    var /* SETTINGS */
        pabloVersion = '0.3.0',
        svgVersion = 1.1,
        svgns = 'http://www.w3.org/2000/svg',
        xlinkns = 'http://www.w3.org/1999/xlink',
        vendorPrefixes = ['', '-moz-', '-webkit-', '-khtml-', '-o-', '-ms-'],

        testElement, arrayProto, supportsClassList, hyphensToCamelCase, cssClassApi, pabloCollectionApi, classlistMethod;

    
    function make(elementName){
        return typeof elementName === 'string' &&
            document.createElementNS(svgns, elementName) ||
            null;
    }


    /////


    // TEST BROWSER COMPATIBILITY

    testElement = document && 'createElementNS' in document && make('svg');
    
    // Incompatible browser
    if (!(
        testElement &&
        Array && Element && SVGElement && NodeList && HTMLDocument &&
        'createSVGRect' in testElement &&
        'querySelectorAll' in document &&
        'isArray' in Array &&
        'forEach' in Array.prototype &&
        'children' in document.body &&
        'previousElementSibling' in document.body
    )){
        // Return a simplified version of the Pablo API
        return {
            v: pabloVersion,
            isSupported: false
        };
    }

    supportsClassList = 'classList' in testElement;
    arrayProto = Array.prototype;

    
    /////
    
    
    // UTILITIES
    
    function extend(target/*, any number of source objects*/){
        var len = arguments.length,
            withPrototype = arguments[len-1] === true,
            i, obj, prop;
        
        if (!target){
            target = {};
        }

        for (i = 1; i < len; i++){
            obj = arguments[i];
            if (typeof obj === 'object'){
                for (prop in obj){
                    if (withPrototype || obj.hasOwnProperty(prop)){
                        target[prop] = obj[prop];
                    }
                }
            }
        }
        return target;
    }
    
    function toArray(obj){
        return arrayProto.slice.call(obj);
    }
    
    function getAttributes(el){
        var ret = {},
            attr, len, i;
            
        if (el){
            attr = el.attributes;
            for (i = 0, len = attr.length; i<len; i++){
                ret[attr[i].name] = attr[i].value;
            }
        }
        return ret;
    }

    function isArrayLike(obj){
        return !!(obj && typeof obj === 'object' && typeof obj.length === 'number');
    }
    
    function isElement(obj){
        return obj instanceof Element;
    }

    function isElementOrDocument(el){
        return isElement(el) || isHTMLDocument(el);
    }
    
    function isNodeList(obj){
        return obj instanceof NodeList;
    }
    
    function isHTMLDocument(obj){
        return obj instanceof HTMLDocument;
    }

    function hasSvgNamespace(obj){
        return obj && obj.namespaceURI && obj.namespaceURI === svgns;
    }
    
    function isSVGElement(obj){
        return obj instanceof SVGElement;
    }
    
    function canBeWrapped(obj){
        return Pablo.isPablo(obj) ||
            isElement(obj) ||
            isNodeList(obj) ||
            isHTMLDocument(obj) ||
            Array.isArray(obj) ||
            isArrayLike(obj) ||
            hasSvgNamespace(obj);
    }
    
    // Return node (with attributes) if a Pablo collection, otherwise create one
    function toPablo(node, attr){
        if (Pablo.isPablo(node)){
            return attr ? node.attr(attr) : node;
        }
        return Pablo(node, attr);
    }

    // Return CSS styles with browser vendor prefixes
    // e.g. cssPrefix({transform:'rotate(45deg)'}) will return the styles object, with additional properties containing CSS properties prefixed with the browser vendor prefixes - see vendorPrefixes
    // e.g. cssPrefix('transform', 'rotate(45deg)') will return a string sequence of prefixed CSS properties, each assigned the same value
    // e.g. cssPrefix('transform') will return a string sequence of CSS properties
    function cssPrefix(styles, value){
        var vendorPrefixes = Pablo.vendorPrefixes,
            prop, res, rule, setStyle;
        
        if (typeof styles === 'object'){
            setStyle = function(prefix){
                res[prefix + prop] = styles[prop];
            };

            res = {};
            for (prop in styles){
                if (styles.hasOwnProperty(prop)){
                    vendorPrefixes.forEach(setStyle);
                }
            }
        }

        if (typeof styles === 'string'){
            prop = styles;

            // e.g. cssPrefix('transform') -> 'transform,-webkit-transform,...'
            // useful for adding prefixed properties when setting active properties in a CSS transition
            if (typeof value === 'undefined'){
                res = vendorPrefixes.join(prop + ',') + prop;
            }

            // e.g. cssPrefix('transform', 'rotate(45deg)') -> 'transform:rotate(45deg);-webkit-transform:rotate(45deg);...'
            else {
                rule = prop + ':' + value + ';';
                res = vendorPrefixes.join(rule) + rule;
            }
        }
        return res;
    }
    
    // e.g. 'font-color' -> 'fontColor'
    hyphensToCamelCase = (function(){
        var firstLetter = /-([a-z])/g;

        return function (str){
            return str.replace(firstLetter, function(match, letter){
                return letter.toUpperCase();
            });
        };
    }());
    
    /*
    // e.g. 'fontColor' -> 'font-color'
    // NOTE: does not check for blank spaces, i.e. for multiple words 'font Color'
    var camelCaseToHyphens = (function(){
        var capitalLetters = /[A-Z]/g;

        return function (str){
            return str.replace(capitalLetters, function(letter){
                return '-' + letter.toLowerCase();
            });
        };
    });
    */

    // `behaviour` can be 'some', 'every' or 'filter'
    function matchSelectors(collection, selectors, ancestor, behaviour){
        var i, len, node, ancestors, matches, matchesCache, 
            ancestorsLength, isMatch, filtered;

        // The optional `ancestor` node is used to perform the selection on.
        if (ancestor){
            if (!Pablo.isPablo(ancestor)){
                ancestor = toPablo(ancestor);
            }
        }

        // Filter to as subset of the collection
        if (behaviour === 'filter'){
            filtered = Pablo();
        }

        for (i=0, len=collection.length; i<len; i++){
            node = collection.eq(i);

            // If no `ancestor` given, then find the element's root ancestor. If 
            // the element is currently in the DOM, this will be the `document`.
            if (!ancestor) {
                ancestor = node
                    .relations('parentNode', null, null, isElementOrDocument)
                    .last();
            }

            // Use ancestor to find element via a selector query
            if (ancestor.length){
                // Have we previously cached the result of the query?
                // E.g. when many elements in the same collection are being
                // queried against the `document` node
                matches = ancestors && matchesCache[ancestors.indexOf(ancestor)];

                if (!matches){
                    matches = ancestor.find(selectors);

                    // If more than one element in the collection, then
                    // we temporarily cache the result of the query (the cache
                    // expires when the function completes
                    if (len > 1){
                        // Create the cache containers
                        if (!matchesCache){
                            ancestors = [];
                            matchesCache = [];
                        }
                        // Cache the result
                        ancestorsLength = ancestors.push(ancestor);
                        matchesCache[ancestorsLength-1] = matches;
                    }
                }
            }

            // Element has no parent
            // If it is an element (e.g. not `document`), then clone it and 
            // append to a temporary element
            else if (isElement(node[0])){
                node = node.clone();
                ancestor = Pablo.g().append(node);
                matches = ancestor.find(selectors);
            }

            // Is node contained within the list of matches?
            isMatch = matches && matches.indexOf(node) >= 0;
            if (isMatch){
                // At least one element matched
                if (behaviour === 'some'){
                    return true;
                }
                // Add this element to the filtered subset
                if (behaviour === 'filter'){
                    filtered.push(node);
                }
            }
            // Not every element matched
            else if (behaviour === 'every'){
                return false;
            }
        }

        // If filtering, return the collection; otherwise a boolean.
        return behaviour === 'filter' ? filtered :
              (behaviour === 'every'  ? true : false);
    }
    
    
    /////
    
    
    // PABLO COLLECTIONS
    
    function PabloCollection(node, attr){
        if (node){
            this.push(node);
            
            // Apply attributes
            if (attr){
                this.attr(attr);
            }
        }
    }
    pabloCollectionApi = PabloCollection.prototype = [];

    extend(pabloCollectionApi, {
        collection: null,
        constructor: PabloCollection,
        pablo: pabloVersion,


        /////

        // ARRAY-LIKE BEHAVIOUR

        toArray: function(){
            return toArray(this);
        },
        
        size: function(){
            return this.length;
        },
        
        get: function(index){
            return this[index];
        },
        
        eq: function(index){
            return index >= 0 ?
                // Return zero-indexed node
                Pablo(this[index]) :
                // Return node, counting backwards from end of elements array
                (index < -1 ? this.slice(index, index + 1) : this.slice(index));
        },

        first: function(){
            return this.eq(0);
        },

        last: function(){
            return this.eq(this.length-1);
        },

        add: function (node/*, node..., prepend*/){
            var numNodes = arguments.length,
                prepend, toBeAdded;

            // Either multiple nodes or `prepend` boolean passed
            if (numNodes > 1){
                node = toArray(arguments);

                // `prepend` boolean passed as last argument
                if (typeof node[numNodes-1] === 'boolean'){
                    prepend = node[numNodes-1];
                    numNodes -= 1;
                    node = numNodes === 1 ?
                        node[0] : node.slice(0, -1);
                }
            }

            if (numNodes === 1){
                // Create new element from elementName
                if (typeof node === 'string'){
                    node = make(node);
                    toBeAdded = true;
                }

                // Is an existing element
                // TODO: document where hasSvgNamespace() is required, e.g. on iOS Safari
                else if (isElement(node) || isHTMLDocument(node) || hasSvgNamespace(node)){
                    // If element is already in collection then skip
                    if (this.indexOf(node) >= 0){
                        return this;
                    }
                    toBeAdded = true;
                }

                // Add element to collection
                if (toBeAdded){
                    arrayProto[prepend ? 'unshift' : 'push'].call(this, node);
                    return this;
                }
            }
            
            // Convert to an array of nodes
            if (!Array.isArray(node)){
                // A Pablo collection
                if (Pablo.isPablo(node)){
                    // See extensions/functional.js for example usage of node.collection
                    node = (node.collection || node).toArray();
                }

                // A nodeList (e.g. result of a selector query, or childNodes)
                // or is an object like an array, e.g. a jQuery collection
                else if (isNodeList(node) || isArrayLike(node)){
                    node = toArray(node);
                }

                // Whatever it is, it isn't supported
                else {
                    return this;
                }
            }

            // Add each element in the list
            while (node.length){
                if (prepend){
                    this.add(node.pop(), prepend);
                }
                else {
                    this.add(node.shift());
                }
            }
            return this;
        },

        concat: function(){
            return Pablo(this.add.apply(this, arguments));
        },
        
        // Add new node(s) to the collection; accepts arrays or nodeLists
        unshift: function(){
            var args = toArray(arguments);
            args.push(true);
            return this.add.apply(this, args);
        },
        
        // Remove node from end of the collection
        pop: function(){
            return Pablo(arrayProto.pop.call(this));
        },
        
        shift: function(){
            return Pablo(arrayProto.shift.call(this));
        },
        
        slice: function(begin, end){
            return Pablo(arrayProto.slice.call(this, begin, end));
        },

        reverse: function(){
            arrayProto.reverse.call(this);
            return this;
        },

        sort: function(fn){
            arrayProto.sort.call(this, fn);
            return this;
        },

        indexOf: function(node){
            if (Pablo.isPablo(node)){
                node = node[0];
            }
            return arrayProto.indexOf.call(this, node);
        },
        
        each: function(fn, context){
            arrayProto.forEach.call(this, fn, context || this);
            return this;
        },
        
        map: function(fn, context){
            return Pablo(arrayProto.map.call(this, fn, context || this));
        },

        some: function(fnOrSelector, context){
            return typeof fnOrSelector === 'string' ?
                matchSelectors(this, fnOrSelector, context, 'some') :
                arrayProto.some.call(this, fnOrSelector, context || this);
        },

        every: function(fnOrSelector, context){
            return typeof fnOrSelector === 'string' ?
                matchSelectors(this, fnOrSelector, context, 'every') :
                arrayProto.every.call(this, fnOrSelector, context || this);
        },

        // Note: this method is analogous to Array.filter but is called `select`
        // here (as in Underscore.js) because Pablo's filter() method is used to
        // create a `<filter>` SVG element
        select: function(fnOrSelector, context){
            return typeof fnOrSelector === 'string' ?
                matchSelectors(this, fnOrSelector, context, 'filter') :
                Pablo(arrayProto.filter.call(this, fnOrSelector, context || this));
        },


        /////


        // TRAVERSAL

        // See below for traversal shortcuts using `relations()` e.g. `parents()`

        relations: function(prop, selectors, ancestor, doWhile){
            var collection = Pablo(),
                isFn = typeof doWhile === 'function';

            this.each(function(el){
                el = el[prop];
                while (el && (isFn ? doWhile(el) : true)){
                    collection.push(el);
                    el = doWhile ?
                        el[prop] : null;
                }
            });
            return selectors ? collection.select(selectors, ancestor) : collection;
        },

        siblings: function(selectors){
            return this.prevSiblings(selectors)
                       .push(this.nextSiblings(selectors));
        },

        // Find each element's SVG root element
        root: function(selectors){
            return this.owners(selectors).last();
        },
        
        find: function(selectors){
            var found = Pablo();
            
            this.each(function(el){
                found.push(el.querySelectorAll(selectors));
            });
            return found;
        },


        /////


        // MANIPULATION
        
        remove: function(){
            return this.each(function(el){
                var parentNode = el.parentNode;
                if (parentNode){
                    parentNode.removeChild(el);
                }
            });
        },
        
        empty: function(){
            // We use these DOM methods, instead of remove(), to ensure textNodes
            // are also removed
            this.each(function(el){
                while (el.firstChild){
                    el.removeChild(el.firstChild);
                }
            });
            return this;
        },
        
        // NOTE: the following append-related functions all require attr to exist, even as a blank object, if a new element is to be created. Otherwise, if the first argument is a string, then a selection operation will be performed.
        // TODO: If appending pre-existing elements, then append to just first element in the collection?
        append: function(node, attr){
            this.each(function(el){
                toPablo(node, attr).each(function(child){
                    el.appendChild(child);
                });
            });
            return this;
        },
        
        appendTo: function(node, attr){
            toPablo(node, attr).append(this);
            return this;
        },
        
        child: function(node, attr){
            return toPablo(node, attr).appendTo(this);
        },
        
        before: function(node, attr){
            return this.each(function(el){
                var parentNode = el.parentNode;
                if (parentNode){
                    toPablo(node, attr).each(function(toInsert){
                        parentNode.insertBefore(toInsert, el);
                    });
                }
            });
        },
        
        after: function(node, attr){
            return this.each(function(el){
                var parentNode = el.parentNode;
                if (parentNode){
                    toPablo(node, attr).each(function(toInsert){
                        parentNode.insertBefore(toInsert, el.nextSibling);
                    });
                }
            });
        },

        // Insert every element in the set of matched elements after the target.
        insertAfter: function(node, attr){
            toPablo(node, attr).after(this);
            return this;
        },
        
        // Insert every element in the set of matched elements before the target.
        insertBefore: function(node, attr){
            toPablo(node, attr).before(this);
            return this;
        },

        prepend: function(node, attr){
            return this.each(function(el){
                var first = el.firstChild;
                toPablo(node, attr).each(function(child){
                    el.insertBefore(child, first);
                });
            });
        },
        
        prependTo: function(node, attr){
            toPablo(node, attr).prepend(this);
            return this;
        },
        
        clone: function(deep){
            deep = (deep || false);
            return this.map(function(el){
                return el.cloneNode(deep);
            });
        },
        
        duplicate: function(repeats){
            var duplicates;

            if (repeats !== 0){
                duplicates = Pablo();

                if (typeof repeats !== 'number' || repeats < 0){
                    repeats = 1;
                }
                
                // Clone the collection
                while (repeats --){
                    duplicates.push(this.clone(true)[0]);
                }

                // Insert in the DOM after the collection
                this.after(duplicates)
                    // Add new elements the collection
                    .push(duplicates);
            }
            return this;
        },

        getValue: function(val, i){
            if (Array.isArray(val)){
                // If array is shorter than collection, then cycle back to start
                // of array
                i = i % val.length;
                val = val[i];
            }
            else if (typeof val === 'function'){
                val = val.call(this, this[i], i);
            }
            return val;
        },
        
        attr: function(attr, value){
            var el, attributeName, colonIndex, nsPrefix, nsURI;

            if (typeof attr === 'undefined'){
                return getAttributes(this[0]);
            }

            if (typeof attr === 'string'){
                // Get attribute
                if (typeof value === 'undefined'){
                    el = this[0];

                    if (!el){
                        return;
                    }

                    // Namespaced attributes
                    colonIndex = attr.indexOf(':');

                    if (colonIndex >= 0){
                        nsPrefix = attr.slice(0, colonIndex);
                        nsURI = Pablo.ns[nsPrefix];
                        attr = attr.slice(colonIndex+1);
                        return el.getAttributeNS(nsURI || null, attr);
                    }
                    return el.getAttribute(attr);
                }

                // Create attributes object
                attributeName = attr;
                attr = {};
                attr[attributeName] = value;
            }
            
            // Set multiple attributes
            this.each(function(el, i){
                var prop, val;
                
                for (prop in attr){
                    if (attr.hasOwnProperty(prop)){
                        val = this.getValue(attr[prop], i);
                    
                        // Namespaced attributes, e.g. 'xlink:href'
                        colonIndex = prop.indexOf(':');
                        if (colonIndex >= 0){
                            nsPrefix = prop.slice(0, colonIndex);
                            nsURI = Pablo.ns[nsPrefix];
                        }
                        el.setAttributeNS(nsURI || null, prop, val);
                    }
                }
            }, this);
            return this;
        },

        // Return an array of values from an attribute for each element 
        // in the collection
        pluck: function(attr){
            return toArray(this).map(function(el){
                return Pablo(el).attr(attr);
            });
        },

        transform: function(functionName, value/* , additional values*/){
            // Additional arguments are space-delimited as part of the value
            if (arguments.length > 2){
                value = toArray(arguments).slice(1).join(' ');
            }

            return this.each(function(el, i){
                // TODO: replace `node = Pablo(el)` with 
                // `node = this.length === 1 ? this : Pablo(el)` everywhere that
                // is appropriate, to avoid unnecessary Pablo collection creation
                var node = Pablo(el),
                    transformAttr = node.attr('transform'),
                    newTransformAttr, pos, posEnd, transformAttrEnd,
                    functionString = functionName + '(' + this.getValue(value, i) + ')';

                // There's already a transform attribute
                if (transformAttr){
                    // Start position for the function
                    pos = (' ' + transformAttr).indexOf(' ' + functionName + '(');

                    // Function name already present
                    if (pos >= 0){
                        transformAttrEnd = transformAttr.slice(pos);
                        // End position for the function
                        posEnd = transformAttrEnd.indexOf(')');

                        // Insert modified function
                        // TODO: use splice() instead?
                        newTransformAttr = transformAttr.slice(0, pos) + 
                            functionString + transformAttrEnd.slice(posEnd + 1);
                    }

                    // Function not yet present
                    else {
                        newTransformAttr = transformAttr + ' ' + functionString;
                    }
                }

                // Set transform attribute
                node.attr('transform', newTransformAttr || functionString);
            }, this);
        },
        
        removeAttr: function (attr) {
            var colonIndex = attr.indexOf(':'),
                nsPrefix, nsURI;

            if (colonIndex >= 0){
                nsPrefix = attr.slice(0, colonIndex);
                nsURI = Pablo.ns[nsPrefix];
                attr = attr.slice(colonIndex+1);
            }
            return this.each(function (el){
                // TODO: does `removeAttribute` behave differently?
                el.removeAttributeNS(nsURI || null, attr);
            });
        },
        
        content: function(text){
            var el;

            // Get first element's textContent
            if (typeof text === 'undefined'){
                el = this[0];
                return el && el.textContent || '';
            }

            // Set every element's textContent
            return this.each(function(el, i){
                el.textContent = this.getValue(text, i);
            }, this);
        },

        css: function(styles, value){
            var el, styleProperty;

            if (typeof styles === 'string'){
                // Get style
                if (typeof value === 'undefined'){
                    el = this[0];
                    return el && el.style.getPropertyValue(styles);
                    // or document.defaultView.getComputedStyle(el, null).getPropertyValue(styles);
                }

                // Create styles object
                styleProperty = styles;
                styles = {};
                styles[styleProperty] = value;
            }

            return this.each(function(el, i){
                var style = el.style,
                    prop, val;
                
                for (prop in styles){
                    if (styles.hasOwnProperty(prop)){
                        val = this.getValue(styles[prop], i);
                        style.setProperty(prop, val, '');
                    }
                }
            }, this);
        },

        // Add prefixed CSS styles to elements in collection
        cssPrefix: function(styles, value){
            var styleProperty;
            
            if (typeof styles === 'string' && typeof value !== 'undefined'){
                // Create styles object
                styleProperty = styles;
                styles = {};
                styles[styleProperty] = value;
            }
            return this.css(cssPrefix(styles));
        }
    });


    /////


    // DOM EVENTS

    // TODO: support getValue for `type`?
    function addRemoveListener(domMethod){
        return function(type, listener, useCapture){
            // `type` can be a single event type, or a space-delimited list
            return this.processList(type, function(type){
                this.each(function(el){
                    // Add or remove the listener
                    el[domMethod](type, listener, useCapture || false);
                });
            });
        };
    }

    extend(pabloCollectionApi, {
        processList: function(item, fn){
            var collection = this;

            // Multiple items
            if (item && item.indexOf(' ') > 0){
                item.split(' ').forEach(function(item){
                    collection.processList(item, fn, this);
                });
            }
            // Single item
            else {
                fn.call(this, item);
            }
            return this;
        },

        on: addRemoveListener('addEventListener'),

        // Note that if a listener has been added multiple times to an element, 
        // then it must be removed as many times.
        off: addRemoveListener('removeEventListener'),

        // Trigger listener once per collection
        one: function(type, listener, useCapture, context){
            var collection = this;

            function removeListener(){
                // Remove listener and additional listener
                collection.off(type, listener,       useCapture, context)
                          .off(type, removeListener, useCapture, context);
            }

            // Add the original listener, and an additional listener that removes
            // the first, and itself. The reason a wrapper listener is not used
            // instead of two separate listeners is to allow manual removal of
            // the original listener (with `.off()`) before it ever triggers.
            return this.on(type, listener,       useCapture, context)
                       .on(type, removeListener, useCapture, context);
        },

        // Trigger listener once per element in the collection
        oneEach: function(){
            var args = arguments;

            return this.each(function(el){
                var node = Pablo(el);
                node.one.apply(node, args);
            });
        }
    });


    /////


    // API SHORTCUTS

    function walk(prop, doWhile){
        return function(selectors, ancestor){
            return this.relations(prop, selectors, ancestor, doWhile);
        };
    }

    extend(pabloCollectionApi, {
        // Traversal methods
        children:     walk('childNodes',             null),
        firstChild:   walk('firstChild',             null),
        lastChild:    walk('lastChild',              null),
        prev:         walk('previousElementSibling', null),
        prevSiblings: walk('previousElementSibling', true),
        next:         walk('nextElementSibling',     null),
        nextSiblings: walk('nextElementSibling',     true),
        viewport:     walk('viewportElement',        null),
        viewports:    walk('viewportElement',        true),
        owner:        walk('ownerSVGElement',        null),
        owners:       walk('ownerSVGElement',        true),
        parent:       walk('parentNode',             null),
        parents:      walk('parentNode',             isElement),
        parentsSvg:   walk('parentNode',             isSVGElement),

        // Alias methods
        elements: pabloCollectionApi.toArray,
        push:     pabloCollectionApi.add,
        forEach:  pabloCollectionApi.each,
        is:       pabloCollectionApi.some
    });


    /////

    
    // CSS CLASSES

    // Supports space-delimited multiple classNames, as well as attribute values
    // and function values
    if (supportsClassList){
        classlistMethod = function(method){
            return function(className){
                return this.each(function(el, i){
                    var val = this.getValue(className, i);
                    this.processList(val, function(className){
                        el.classList[method](className);
                    });
                }, this);
            };
        };

        // Browser supports native classLists in SVG, e.g. Firefox
        cssClassApi = {
            // Return true if _any_ element has className
            hasClass: function(className){
                return this.some(function(el, i){
                    var val = this.getValue(className, i);
                    return el.classList.contains(val);
                }, this);
            },
            addClass: classlistMethod('add'),
            removeClass: classlistMethod('remove'),
            toggleClass: classlistMethod('toggle')
        };
    }

    // Browser doesn't support native classLists in SVG, e.g. IE9, Chrome 21
    else {
        cssClassApi = {
            // Return true if _any_ element has className
            hasClass: function(className){
                return this.some(function(el, i){
                    var node = Pablo(el),
                        val = this.getValue(className, i),
                        classString = node.attr('class');

                    return classString && (' ' + classString + ' ')
                        .indexOf(' ' + val + ' ') >= 0;
                }, this);
            },

            addClass: function(className){
                return this.each(function(el, i){
                    var node = Pablo(el),
                        val = this.getValue(className, i),
                        classString;

                    this.processList(val, function(className){
                        if (!node.hasClass(className)){
                            classString = node.attr('class');
                            classString = classString ? (classString + ' ') : '';
                            node.attr('class',  classString + className);
                        }
                    });
                });
            },

            removeClass: function(className){
                return this.each(function(el, i){
                    var node = Pablo(el),
                        val = this.getValue(className, i);

                    this.processList(val, function(className){
                        // TODO: avoid excessive RegExp creation
                        var classPattern = new RegExp('(?:^|\\s)' + className + '(\\s|$)'),
                            classString;

                        if (node.hasClass(className)){
                            classString = node.attr('class');
                            classString = classString.replace(classPattern, '$1');
                            node.attr('class', classString);
                        }
                    });
                });
            },

            toggleClass: function(className){
                return this.each(function(el, i){
                    var node = Pablo(el),
                        val = this.getValue(className, i);

                    this.processList(val, function(className){
                        if (node.hasClass(className)){
                            node.removeClass(className);
                        }
                        else {
                            node.addClass(className);
                        }
                    });
                });
            }
        };
    }

    extend(pabloCollectionApi, cssClassApi);

    /* For alternative implementations of class manipulation, see:
        * https://gist.github.com/1319121
        * https://developer.mozilla.org/media/uploads/demos/p/a/paulrouget/8bfba7f0b6c62d877a2b82dd5e10931e/hacksmozillaorg-achi_1334270447_demo_package/classList/classList.js
        * https://hacks.mozilla.org/2010/01/classlist-in-firefox-3-6/
    */


    /////


    // PABLO API

    // Create Pablo: return a PabloCollection instance
    function createPablo(node, attr){
        return new PabloCollection(node, attr);
    }
    
    // Select existing nodes in the document
    function selectPablo(selectors, context){
        // Valid selectors
        if (selectors && typeof selectors === 'string'){
            return Pablo((context || document).querySelectorAll(selectors));
        }
        // Return empty Pablo collection
        return createPablo();
    }

    
    // **
    

    // Pablo main function
    function Pablo(node, attr){
        if (!node || attr || Pablo.canBeWrapped(node)){
            return Pablo.create(node, attr);
        }
        else {
            return Pablo.select(node);
        }
    }
    
    // Pablo methods
    extend(Pablo, {
        v: pabloVersion,
        isSupported: true,
        ns: {
            svg: svgns,
            xlink: xlinkns
        },
        svgVersion: svgVersion,
        Collection: PabloCollection,
        fn: pabloCollectionApi,

        // methods
        make: make,
        create: createPablo,
        select: selectPablo,
        isArrayLike: isArrayLike,
        isElement: isElement,
        isSVGElement: isSVGElement,
        isNodeList: isNodeList,
        isHTMLDocument: isHTMLDocument,
        // isPablo is overwritten in functional.js extension
        isPablo: function(obj){
            return obj instanceof Pablo.Collection;
        },
        extend: extend,
        toArray: toArray,
        getAttributes: getAttributes,
        canBeWrapped: canBeWrapped,
        hyphensToCamelCase: hyphensToCamelCase,

        // css related
        vendorPrefixes: vendorPrefixes,
        cssPrefix: cssPrefix,
            // e.g. Pablo('svg').style().content('#foo{' + Pablo.cssPrefix('transform', 'rotate(45deg)') + '}');
            // e.g. myElement.css({'transition-property': Pablo.cssPrefix('transform')});

        // TODO: support `collection.append('myTemplate')`
        template: function(name, callback){
            // e.g. Pablo.star()
            Pablo[name] = function(){
                return callback.apply(null, arguments);
            };
            // e.g. collection.star()
            pabloCollectionApi[name] = function(){
                var args = arguments;
                return this.map(function(el){
                    return Pablo[name].apply(el, args).appendTo(el);
                });
            };
            return this;
        }
    });


    /////

    
    // SVG ELEMENT METHODS
    'a altGlyph altGlyphDef altGlyphItem animate animateColor animateMotion animateTransform circle clipPath color-profile cursor defs desc ellipse feBlend feColorMatrix feComponentTransfer feComposite feConvolveMatrix feDiffuseLighting feDisplacementMap feDistantLight feFlood feFuncA feFuncB feFuncG feFuncR feGaussianBlur feImage feMerge feMergeNode feMorphology feOffset fePointLight feSpecularLighting feSpotLight feTile feTurbulence filter font font-face font-face-format font-face-name font-face-src font-face-uri foreignObject g glyph glyphRef hkern image line linearGradient marker mask metadata missing-glyph mpath path pattern polygon polyline radialGradient rect script set stop style svg switch symbol text textPath title tref tspan use view vkern'.split(' ')
        .forEach(function(nodeName){
            var camelCase = hyphensToCamelCase(nodeName),
                createElement = function(attr){
                    return Pablo.create(nodeName, attr);
                };

            if (nodeName === 'svg'){
                createElement = function(attr){
                    attr = extend(attr, {version: svgVersion});
                    return Pablo.create(nodeName, attr);
                };
            }
            
            // Add a new method namespace for each element name
            Pablo.template(nodeName, createElement);

            // Create methods aliases to allow camelCase element name
            Pablo[camelCase] = Pablo[nodeName];
            pabloCollectionApi[camelCase] = pabloCollectionApi[nodeName];
        });

    
    /////
    
    return Pablo;
}(window.document, window.Array, window.Element, window.SVGElement, window.NodeList, window.HTMLDocument));
