/*!
    Pablo <http://pablojs.com>

    by Premasagar Rose <http://premasagar.com>,
       Dharmafly <http://dharmafly.com>

    Repo: <https://github.com/dharmafly/pablo>
    MIT license

*/
/*jshint newcap:false */

(function(root, Object, Array, Element, SVGElement, NodeList, HTMLDocument, document, XMLHttpRequest){
    'use strict';
    
    var /* SETTINGS */
        pabloVersion = '0.3.2',
        svgVersion = 1.1,
        svgns = 'http://www.w3.org/2000/svg',
        xlinkns = 'http://www.w3.org/1999/xlink',
        vendorPrefixes = ['', 'moz', 'webkit', 'khtml', 'o', 'ms'],
        svgElements = 'a altGlyph altGlyphDef altGlyphItem animate animateColor animateMotion animateTransform circle clipPath color-profile cursor defs desc ellipse feBlend feColorMatrix feComponentTransfer feComposite feConvolveMatrix feDiffuseLighting feDisplacementMap feDistantLight feFlood feFuncA feFuncB feFuncG feFuncR feGaussianBlur feImage feMerge feMergeNode feMorphology feOffset fePointLight feSpecularLighting feSpotLight feTile feTurbulence filter font font-face font-face-format font-face-name font-face-src font-face-uri foreignObject g glyph glyphRef hkern image line linearGradient marker mask metadata missing-glyph mpath path pattern polygon polyline radialGradient rect script set stop style svg switch symbol text textPath title tref tspan use view vkern',
        cacheExpando = 'pablo-data',
        eventsNamespace = '__events__',

        head, testElement, arrayProto, supportsClassList, hyphensToCamelCase, 
        camelCaseToHyphens, toSvg, cssClassApi, pabloCollectionApi, classlistMethod, 
        cssPrefixes, cache, cacheNextId, matchesProp, Events;

    
    function make(elementName){
        return typeof elementName === 'string' &&
            document.createElementNS(svgns, elementName) ||
            null;
    }

    function getPrefixedProperty(prop, context){
        var capitalized = prop.slice(0,1).toUpperCase() + prop.slice(1),
            found;

        if (!context){
            context = root;
        }
        vendorPrefixes.some(function(prefix){
            var prefixedProp = prefix ? prefix + capitalized : prop;
            if (prefixedProp in context){
                found = prefixedProp;
                return true;
            }
        });
        return found;
    }


    /////


    // TEST BROWSER COMPATIBILITY

    if (document){
        testElement = 'createElementNS' in document && make('svg');
        head = document.head || document.getElementsByTagName('head')[0];
        arrayProto = Array && Array.prototype;
        matchesProp = getPrefixedProperty('matches', testElement) ||
            getPrefixedProperty('matchesSelector', testElement);
    }

    if (!(
        testElement && head && arrayProto && matchesProp &&
        Element && SVGElement && NodeList && HTMLDocument && 
        'createSVGRect' in testElement &&
        'attributes' in testElement &&
        'querySelectorAll' in testElement &&
        'previousElementSibling' in testElement &&
        'childNodes' in testElement && // see note on svgElement.children, below
        'create'     in Object &&
        'keys'       in Object &&
        'isArray'    in Array &&
        'forEach'    in arrayProto &&
        'map'        in arrayProto &&
        'some'       in arrayProto &&
        'every'      in arrayProto &&
        'filter'     in arrayProto
    )){
        // Incompatible browser: return a simplified version of the Pablo API
        root.Pablo = {
            v: pabloVersion,
            isSupported: false
        };
        return;
    }

    supportsClassList = 'classList' in testElement;

    cssPrefixes = vendorPrefixes.map(function(prefix){
        return prefix ? '-' + prefix + '-' : '';
    });

    
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
        return obj &&
            (typeof obj === 'object' || typeof obj === 'function') &&
            typeof obj.length === 'number';
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

    // Check if obj is an element from this or another document
    function hasSvgNamespace(obj){
        return obj && obj.namespaceURI && obj.namespaceURI === svgns;
    }
    
    function isSVGElement(obj){
        return obj instanceof SVGElement;
    }
    
    function canBeWrapped(obj){
        return typeof obj === 'string' ||
            Pablo.isPablo(obj) ||
            isElement(obj) ||
            isNodeList(obj) ||
            isHTMLDocument(obj) ||
            Array.isArray(obj) ||
            isArrayLike(obj) ||
            hasSvgNamespace(obj);
    }
    
    // Return node (with attributes) if a Pablo collection, otherwise create one.
    function toPablo(node, attr){
        if (Pablo.isPablo(node)){
            return attr ? node.attr(attr) : node;
        }
        return Pablo(node, attr);
    }

    // Return CSS styles with browser vendor prefixes

    // e.g. cssPrefix({transform:'rotate(45deg)'}) returns an object containing 
    // the original rule, plus vendor-prefixed versions of it - see vendorPrefixes
    
    // e.g. cssPrefix('transform', 'rotate(45deg)') returns a string of prefixed
    // CSS properties, each assigned the same value
    
    // e.g. cssPrefix('transform') returns a string of prefixed CSS properties
    function cssPrefix(styles, value){
        var prop, res, rule, setStyle;
        
        if (typeof styles === 'object'){
            res = {};
            setStyle = function(prefix){
                res[prefix + styleProperty] = styles[styleProperty];
            };
            for (var styleProperty in styles){
                if (styles.hasOwnProperty(styleProperty)){
                    cssPrefixes.forEach(setStyle);
                }
            }
        }

        else if (typeof styles === 'string'){
            prop = styles;

            // e.g. cssPrefix('transform') returns 'transform,-webkit-transform,...'
            // useful for adding prefixed properties when setting active properties in a CSS transition
            if (typeof value === 'undefined'){
                res = cssPrefixes.join(prop + ',') + prop;
            }

            // e.g. cssPrefix('transform', 'rotate(45deg)') returns
            // 'transform:rotate(45deg);-webkit-transform:rotate(45deg);...'
            else {
                rule = prop + ':' + value + ';';
                res = cssPrefixes.join(rule) + rule;
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
    
    // e.g. 'fontColor' -> 'font-color'
    // NOTE: does not check for blank spaces within multiple words, e.g. 'font Color'.
    // To achieve that, use `capitalLetters = /\s*[A-Z]/g` and `letter.trim().toLowerCase()`
    camelCaseToHyphens = (function(){
        var capitalLetters = /[A-Z]/g;

        return function (str){
            return str.replace(capitalLetters, function(letter){
                return '-' + letter.toLowerCase();
            });
        };
    }());

    toSvg = (function(){
        var prefix = '<svg version="' + svgVersion + '" xmlns="' + svgns + '">',
            suffix = '</svg>',
            container;

        return function(markup){
            // Create container on first usage
            if (!container){
                container = Pablo(document.createElement('div'));
            }
            container[0].innerHTML = prefix + markup + suffix;
            return container.firstChild().children().detach();
        };
    }());

    // Data cache
    cache = {};
    cacheNextId = 1;
    
    
    /////
    
    
    // PABLO COLLECTIONS
    
    function PabloCollection(node, attrOrContext){
        var hasContext;

        if (node){
            hasContext = attrOrContext && canBeWrapped(attrOrContext);

            if (hasContext){
                // Find the node within the context, e.g. Pablo('g', 'body')
                node = Pablo(attrOrContext).find(node);
            }
            else if (typeof node === 'string' && attrOrContext){
                // Create a named element, e.g. Pablo('circle', {})
                node = make(node);
            }

            // Add the results to the collection
            this.add(node);

            // Apply attributes
            if (!hasContext && attrOrContext){
                this.attr(attrOrContext);
            }
        }
    }
    pabloCollectionApi = PabloCollection.prototype = [];

    extend(pabloCollectionApi, {
        constructor: PabloCollection,
        pablo: pabloVersion,
        collection: null,


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

        add: (function(){
            // Detect `<` as the first non-whitespace character
            var openTag = /^\s*</;

            return function (/*node, node,..., prepend*/){
                var nodes = arguments,
                    numNodes = nodes.length,
                    prepend = false,
                    node, toAdd, nodeInArray, i;

                // `prepend` 
                if (numNodes > 1 && typeof nodes[numNodes-1] === 'boolean'){
                    prepend = nodes[numNodes-1];
                    numNodes -= 1;

                    if (prepend){
                        nodes = arrayProto.slice.call(nodes, 0, numNodes).reverse();
                    }
                }

                for (i=0; i<numNodes; i++){
                    node = nodes[i];

                    // An SVG or HTML element, or HTML document
                    if (isElement(node) || isHTMLDocument(node) || hasSvgNamespace(node)){
                        // Add element, if it is not already in the collection
                        if (arrayProto.indexOf.call(this, node) === -1){
                            arrayProto[prepend ? 'unshift' : 'push'].call(this, node);
                        }
                    }

                    // A Pablo collection
                    else if (Pablo.isPablo(node)){
                        // See extensions/functional.js for example usage of node.collection
                        // TODO: remove support for functional.js?
                        node = toArray(node.collection || node);
                        toAdd = node.collection || node;
                    }

                    // A string outside of an array - either SVG markup or CSS selector
                    else if (typeof node === 'string'){
                        // SVG markup
                        // If `<` is the first non-whitespace character
                        if (openTag.test(node)){
                            toAdd = toSvg(node);
                        }

                        // CSS selector
                        else {
                            toAdd = document.querySelectorAll(node);
                        }
                    }

                    // A nodeList (e.g. result of a selector query, or childNodes)
                    // or is an object like an array, e.g. a jQuery collection
                    else if (isNodeList(node) || isArrayLike(node)){
                        toAdd = node;
                    }

                    // `node` is an array or collection
                    if (toAdd || Array.isArray(node)){
                        // Convert to an array of nodes
                        if (toAdd){
                            node = toArray(toAdd);
                        }

                        while (node.length){
                            // Whether prepending or appending, always process arrays and
                            // array-like collections in forwards order
                            nodeInArray = prepend ? node.pop() : node.shift();

                            // A string inside an array is converted to an element
                            if (typeof nodeInArray === 'string'){
                                nodeInArray = make(nodeInArray);
                            }

                            // Add to collection
                            this.add(nodeInArray, prepend);
                        }

                        toAdd = null;
                    }
                }
                return this;
            };
        }()),

        concat: function(){
            return this.add.apply(Pablo(this), arguments);
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
        
        each: function(fn, context){
            arrayProto.forEach.call(this, fn, context || this);
            return this;
        },
        
        map: function(fn, context){
            return Pablo(arrayProto.map.call(this, fn, context || this));
        },


        /////


        // TRAVERSAL

        // See below for traversal shortcuts that use `traverse()` e.g. `parents()`
        traverse: function(prop, doWhile, selectors){
            var collection = Pablo(),
                isFn = typeof doWhile === 'function';

            this.each(function(el, i){
                el = el[prop];
                while (el && (isFn ? doWhile.call(this, el, i) : true)){
                    collection.add(el);
                    el = doWhile ? el[prop] : false;
                }
            });
            return selectors ? collection.select(selectors) : collection;
        },


        /////


        // MANIPULATION
        
        detach: function(){
            return this.each(function(el){
                var parentNode = el.parentNode;
                if (parentNode){
                    parentNode.removeChild(el);
                }
            });
        },

        remove: function(){
            // If the cache has any contents
            if (Object.keys(cache).length){
                // Remove data for all elements and their descendents
                this.removeData().find('*').removeData();
            }

            // Remove from the DOM
            return this.detach();
        },
        
        empty: function(){
            // If the cache has any contents
            if (Object.keys(cache).length){
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
        },
        
        /* Arguments:
        `deepDom`: clones descendent DOM elements and DOM event listeners (default true)
        `withData` clones data associated with the element
        `deepData` clones data associated with descendents of the element (defaults to same as `withData`)
        */
        clone: function(deepDom, withData, deepData){
            var isSingle = this.length === 1;

            if (typeof deepDom !== 'boolean'){
                deepDom = true;
            }
            if (typeof withData !== 'boolean'){
                withData = false;
            }
            if (typeof deepData !== 'boolean'){
                deepData = withData;
            }

            return this.map(function(el){
                var cloned = el.cloneNode(deepDom),
                    data, node, clonedNode, dataset;

                // Clone data associated with the element
                if (withData){
                    // Avoid unnecessary Pablo collection creation
                    node = isSingle ? this : Pablo(el),
                    data = node.cloneData();

                    if (data){
                        // Set data on the cloned element
                        clonedNode = Pablo(cloned).data(data);
                    }
                }

                // Clone descendents' data
                if (deepDom && deepData){
                    if (!clonedNode){
                        clonedNode = Pablo(cloned);
                    }
                    dataset = node.pluckData();
                    clonedNode.find('*').data(dataset);
                }
                return cloned;
            });
        },
        
        // `deep` is whether to duplicate child nodes
        // `deepData` is whether to duplicate data on self and children
        // TODO: should there be a way of duplicating without adding to the DOM
        //     i.e. to remove the call to `after()` or to return a new collection
        duplicate: function(repeats, withData, deepData){
            var duplicates;

            if (repeats !== 0){
                if (typeof repeats !== 'number' || repeats < 0){
                    repeats = 1;
                }

                // For performance, before cloning data, ensure that the elements 
                // or their descendents have data associated with them
                if (withData){
                    withData = this.hasData();
                }
                if (deepData){
                    deepData = this.find('*').hasData();
                }

                duplicates = Pablo();
                
                // Clone the collection
                while (repeats --){
                    duplicates.add(this.clone(true, withData, deepData));
                }

                // Insert in the DOM after the collection
                this.after(duplicates)
                    // Add new elements the collection
                    .add(duplicates);
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
                            el.setAttributeNS(nsURI, prop, val);
                        }
                        else {
                            el.setAttributeNS(null, prop, val);
                        }
                    }
                }
            }, this);
            return this;
        },

        // Return an array of values from an attribute for each element 
        // in the collection
        pluck: function(property, type){
            var undef;

            if (!type){
                type = 'attr';
            }

            // Pass through `null` as undefined to each method
            // e.g. `collection.pluck(null, 'data');` will return an array of
            // data objects, one for each element in the collection.
            if (property === null){
                property = undef;
            }

            return toArray(this).map(function(el){
                switch (type){
                    case 'attr':
                    return Pablo(el).attr(property);

                    case 'prop':
                    return el[property];

                    case 'data':
                    return Pablo(el).data(property);

                    case 'css':
                    return Pablo(el).css(property);

                    case 'cssPrefix':
                    return Pablo(el).cssPrefix(property);
                }
            });
        },

        pluckData: function(){
            return this.pluck(null, 'data');
        },

        transform: function(functionName, value/* , additional values*/){
            var isSingle = this.length === 1;

            // Additional arguments are space-delimited as part of the value
            if (arguments.length > 2){
                value = toArray(arguments).slice(1).join(' ');
            }

            return this.each(function(el, i){
                // Avoid unnecessary Pablo collection creation
                var node = isSingle ? this : Pablo(el),
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
                    return el && 'style' in el && el.style.getPropertyValue(styles);
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

            if (typeof styles === 'string'){
                if (typeof value === 'undefined'){
                    // Get list of vendor-prefixed versions of the property
                    // e.g. `transform,-moz-transform,-webkit-transform`
                    cssPrefix(styles).split(',')
                        // Find the first defined value and return
                        .some(function(prefixedStyleProperty){
                            value = this.css(prefixedStyleProperty);
                            return value;
                        }, this);
                    return value;
                }
                else {
                    // Create styles object
                    styleProperty = styles;
                    styles = {};
                    styles[styleProperty] = value;
                }
            }
            return this.css(cssPrefix(styles));
        },


        // AJAX
        // Load SVG or HTML via Ajax and replace collection contents with it
        load: function(url, callback, replace){
            var collection = this;

            if (this.length){
                Pablo.load(url, function(xhr){
                    if (this.length){
                        if (replace){
                            collection.empty();
                        }
                        collection.append(this);
                    }

                    if (callback){
                        callback.call(collection, this, xhr);
                    }
                });
            }
            return this;
        }
    });


    /////

    // DATA

    (function(){
        function removeData(el, key){
            var id = el[cacheExpando],
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
                        // Delete the element's data reference
                        // This removal is used by hasData to quickly determine
                        // if the element has associated data
                        delete el[cacheExpando];
                        // TODO: this may make the counter increment faster, where
                        // an element is continually having events added and removed.
                        // It is assumed that JavaScript's integer limit will not
                        // be reached in the lifetime of a program. Is that OK?
                    }
                }
            }
        }

        extend(pabloCollectionApi, {
            data: function(key, value){
                var id, data;

                // First argument is an object of key-value pairs
                if (typeof key === 'object'){
                    data = this.getValue(key);
                }

                // Get value - e.g. collection.data('foo') or collection.data()
                else {
                    if (typeof value === 'undefined'){
                        if (this.length){
                            // Use the id of the first element in the collection
                            id = this[0][cacheExpando];

                            if (id && id in cache){
                                return typeof key === 'undefined' ?
                                    cache[id] : cache[id][key];
                            }
                        }
                        return;
                    }

                    // Set value via (key, value); prepare data object
                    data = {};
                    data[key] = value;
                }

                // If there are no elements in the collection, so the collection
                // is empty, then store a plain object to carry the collection's
                // state. Used, for example, to allow an empty collection to 
                // have events bound and triggered to it.
                //      `var e = Pablo().on('foo', fn); e.trigger('foo');`
                if (!this.length){
                    arrayProto.push.call(this, {});
                }
                
                // Set data for each element
                return this.each(function(el){
                    var id = el[cacheExpando];

                    if (!id){
                        id = el[cacheExpando] = cacheNextId ++;
                    }

                    if (!cache[id]){
                        cache[id] = {};
                    }

                    extend(cache[id], data);
                });
            },

            removeData: function(keys){
                return this.each(function(el){
                    // Remove single or multiple, space-delimited keys
                    if (keys){
                        this.processList(keys, function(key){
                            removeData(el, key);
                        });
                    }
                    // Remove everything
                    else {
                        removeData(el);
                    }
                });
            },

            hasData: function(deepData, includeSelf){
                return Object.keys(cache).length > 0 &&
                    this.some(function(el){
                        var onThis, onChildren;

                        if (includeSelf !== false){
                            onThis = !!el[cacheExpando];
                        }
                        if (deepData && !onThis){
                            onChildren = Pablo(el).find('*').hasData();
                        }
                        return onThis || onChildren;
                    });
            },

            cloneData: function(){
                var data = this.data(),
                    events, clonedEvents, type;

                if (data){
                    // Copy events object
                    events = data[eventsNamespace];
                    if (events){
                        // Duplicate data object and events object on it, to
                        // de-reference the cloned element's stored events
                        data = Object.create(data);
                        clonedEvents = data[eventsNamespace] = Object.create(events);
                        // For each event type, e.g. `mousedown`, copy the array
                        // of event listeners
                        for (type in events){
                            if (events.hasOwnProperty(type)){
                                // Create new array
                                clonedEvents[type] = events[type].slice();
                            }
                        }
                    }
                }
                return data;
            },

            matches: function(methodName, comparison, context){
                var index, filtered;

                // function
                if (typeof comparison === 'function'){
                    if (!context){
                        context = this;
                    }

                    switch (methodName){
                        case 'indexOf':
                        index = -1;
                        arrayProto.some.call(this, function(el, i){
                            if (comparison.call(context, el, i, this)){
                                index = i;
                                return true;
                            }
                        }, context);
                        return index;

                        case 'select':
                        filtered = Pablo();
                        arrayProto.filter.call(this, function(el, i){
                            if (comparison.call(context, el, i, this)){
                                filtered.add(el);
                            }
                        }, context);
                        return filtered;

                        // 'some' & 'every'
                        default:
                        return arrayProto[methodName].call(this, comparison, context);
                    }
                }

                // CSS selector
                if (typeof comparison === 'string'){
                    return this.matches(methodName, function(el){
                        return el[matchesProp](comparison);
                    });
                }

                else {
                    comparison = toPablo(comparison);
                }

                // `every`, `some` & `indexOf`
                return this.matches(methodName, function(el){
                    return comparison.some(function(compareEl){
                        return el === compareEl;
                    });
                });
            }
        });
    }());

    
    // EVENTS
    // TODO: refactor on, etc to allow non-Pablo collections
    Events = {
        on: function(type, selectors, listener, useCapture, context){
            var isSingle, wrapper, eventData;

            // `selectors` argument not given
            if (typeof listener !== 'function' && typeof selectors === 'function'){
                context = useCapture;
                useCapture = listener;
                listener = selectors;
                selectors = null;
            }
            if (typeof useCapture === 'undefined'){
                useCapture = false;
            }

            // Allow binding and triggering events on empty collections
            // Create a container object to store state
            if (!this.length){
                arrayProto.push.call(this, {});
            }

            // `listener` is the original callback function
            // `wrapper` is the function actually applied to the DOM element, and 
            // may modify the original listener, e.g. by changing the `this` object

            // If a `this` object is given, then bind the listener to the required 
            // `this` context
            // TODO: change default context to collection instead of DOM element?
            if (context){
                wrapper = function(){
                    listener.apply(context, arguments);
                };
            }
            else {
                wrapper = listener;
            }

            isSingle = this.length === 1;

            // If there are multiple, space-delimited event types, then cycle 
            // through each one
            return this.processList(type, function(type){
                // Cycle through each element in the collection
                this.each(function(el, i){
                    var node = isSingle ? this : Pablo(el),
                        eventsCache = node.data(eventsNamespace),
                        cache;

                    if (!eventsCache){
                        eventsCache = {};
                        node.data(eventsNamespace, eventsCache);
                    }
                
                    cache = eventsCache[type];
                    if (!cache){
                        cache = eventsCache[type] = [];
                    }

                    // `selectors` have been supplied, to set a delegate event
                    if (selectors){
                        // Overwrite the wrapper to make it check that the event
                        // originated on an element matching the selectors
                        wrapper = function(event){
                            // Call listener if the target matches the selector
                            if (
                                event &&
                                // `event.pablo` is set in trigger() for manual
                                // event triggering. Delegate events do not currently
                                // support manual triggering - e.g. 
                                // delegate = Pablo('g.foo');
                                // targets = delegate.find('circle.bar');
                                // parent.on('click', targets, listener);
                                // targets.trigger('click');
                                !event.pablo &&
                                // TODO: should `context` be passed to `some()`
                                // to be used for selectors functions or is that
                                // mixing up concerns?
                                Pablo(event.target).some(selectors, context)
                            ){
                                listener.apply(context || el, arguments);
                            }
                        };
                    }

                    // Prepare data to cache about the event
                    // With `selectors`, a new eventData object is needed for each element
                    if (selectors || !i){
                        eventData = {
                            selectors:  selectors,
                            listener:   listener,
                            wrapper:    wrapper || listener,
                            useCapture: useCapture
                        };
                    }

                    // Add to cache
                    cache.push(eventData);

                    // Add DOM listener
                    if ('addEventListener' in el){
                        el.addEventListener(type, wrapper || listener, useCapture);
                    }
                });
            });
        },

        off: function(type, selectors, listener, useCapture){
            var isSingle = this.length === 1;

            // `selectors` argument not given
            if (typeof selectors === 'function'){
                useCapture = listener;
                listener = selectors;
                selectors = null;
            }
            if (typeof useCapture === 'undefined'){
                useCapture = false;
            }
            
            // If there are multiple, space-delimited event types, then cycle 
            // through each one
            return this.processList(type, function(type){
                this.each(function(el){
                    var node = isSingle ? this : Pablo(el),
                        eventsCache = node.data(eventsNamespace),
                        cache, cachedType;

                    if (!eventsCache){
                        return;
                    }

                    // Remove all event listeners
                    if (!type){
                        for (cachedType in eventsCache){
                            if (eventsCache.hasOwnProperty(cachedType)){
                                node.off(cachedType);
                            }
                        }
                        return;
                    }

                    cache = eventsCache[type];
                    if (!cache || !cache.length){
                        return;
                    }

                    // Remove DOM listeners and delete from cache. This uses a `some`
                    // loop rather than `forEach` to allow breaking. And it uses
                    // `some` rather than a `for` loop as the cache is a sparse array.
                    cache.some(function(eventData, i){
                        if (
                            // If a listener has been passed, is this it?
                            (listener  === eventData.listener &&
                            useCapture === eventData.useCapture &&
                            selectors  === eventData.selectors) ||

                            // Or if no listener was passed...
                            (!listener && (
                                !selectors || selectors === eventData.selectors
                            )
                        )){
                            // Remove DOM listener
                            if ('removeEventListener' in el){
                                el.removeEventListener(type, eventData.wrapper, eventData.useCapture);
                            }

                            // If looking for a specific listener, remove from cache
                            // and break the loop. NOTE: if the listener was set 
                            // multiple times, it will need removal multiple times.
                            if (listener){
                                delete cache[i];
                                return true;
                            }
                        }
                    });

                    // Delete the cache container for this event type, if empty
                    if (!listener || !Object.keys(eventsCache[type]).length){
                        delete eventsCache[type];
                    }
                    // Delete the events container for this element, if empty
                    if (!Object.keys(eventsCache).length){
                        node.removeData(eventsNamespace); 
                    }
                });
            });
        },

        // Trigger listener once per collection
        one: function(type, selectors, listener, useCapture, context){
            var collection = this;

            // `selectors` argument not given
            if (typeof selectors === 'function'){
                context = useCapture;
                useCapture = listener;
                listener = selectors;
                selectors = null;
            }

            function removeListener(){
                // Remove listener and additional listener
                collection.off(type, selectors, listener,       useCapture, context)
                          .off(type, selectors, removeListener, useCapture, context);
            }

            // Add the original listener, and an additional listener that removes
            // the first, and itself. The reason a single wrapper is not used
            // instead of two separate listeners is to allow manual removal of
            // the original listener (with `.off()`) before it ever triggers.
            return this.on(type, selectors, listener,       useCapture, context)
                       .on(type, selectors, removeListener, useCapture, context);
        },

        // Trigger listener once per element in the collection
        oneEach: function(){
            var args = arguments,
                isSingle = this.length === 1;

            return this.each(function(el){
                // Avoid unnecessary Pablo collection creation
                var node = isSingle ? this : Pablo(el);
                node.one.apply(node, args);
            });
        },

        // TODO: optional `context` as second argument?
        trigger: (function(){
            function processTrigger(node, type, args){
                // Use Pablo.fn.data.call to support non-Pablo collections
                var eventsCache = Pablo.fn.data.call(node, eventsNamespace),
                    el = node[0] || node;

                if (eventsCache){
                    // If there are multiple, space-delimited event types, then cycle 
                    // through each one
                    node.processList(type, function(type){
                        var cache = eventsCache[type];

                        if (cache){
                            args[0] = {
                                // `pablo` flag is used by `on()` wrapper
                                pablo: true,
                                type: type,
                                target: el
                            };
                            cache.forEach(function(eventData){
                                eventData.wrapper.apply(el, args);
                            });
                        }
                    });
                }
            }

            return function(type /*, arbitrary args to pass to listener*/){
                var args = toArray(arguments),
                    node;

                return this.processList(type, function(type){
                    if (typeof this.length === 'undefined' || this.length === 1){
                        processTrigger(this, type, args);
                    }
                    else if (this.length > 1) {
                        // Use forEach instead of each, to also support arrays
                        this.forEach(function(el){
                            processTrigger(Pablo(el), type, args);
                        });
                    }
                });
            };
        }()),
        
        processList: function(item, fn){
            var collection = this;

            // Multiple items
            if (item && item.indexOf(' ') > 0){
                item.split(' ').forEach(function(item){
                    collection.processList(item, fn);
                });
            }
            // Single item
            else {
                fn.call(this, item);
            }
            return this;
        }
    };

    extend(pabloCollectionApi, Events);


    /////


    // API SHORTCUTS
        
    // iterator e.g. `function(el, insertEl){el.appendChild(insertEl);}`
    // `insertIntoThis` is boolean flag (default true) - if true, will insert 
    // subject elements into the collection
    function insert(iterator, insertIntoThis, returnThis){
        return function(node, attr, withData, deepData){
            var insertInto, toInsert, createdHere;

            if (this.length){
                if (insertIntoThis === false){
                    insertInto = toPablo(node, attr);
                    toInsert = this;
                }
                else {
                    insertInto = this;
                    toInsert = toPablo(node, attr);
                }

                insertInto.each(function(el, i){
                    // If there are multiple elements being inserted into, e.g.
                    //     Pablo(['g','a']).append(Pablo.g());
                    // then clone the elements to be inserted. If the elements
                    // were created by this function, via `toPablo` then clone shallow
                    if (i){
                        createdHere = typeof node === 'string' && !canBeWrapped(attr);
                        toInsert = createdHere ?
                            toInsert.clone(false) :
                            toInsert.clone(true, withData, deepData);
                    }

                    toInsert.each(function(insertEl){
                        iterator.call(insertInto, el, insertEl);
                    });
                });
            }
            return returnThis === false ? toInsert : this;
        };
    }

    function append(el, insertEl){
        el.appendChild(insertEl);
    }

    function prepend(el, insertEl){
        el.insertBefore(insertEl, el.firstChild);
    }

    function before(el, toInsert){
        if (el.parentNode){
            el.parentNode.insertBefore(toInsert, el);
        }
    }

    function after(el, toInsert){
        if (el.parentNode){
            el.parentNode.insertBefore(toInsert, el.nextSibling);
        }
    }

    function traverse(prop, doWhile){
        return function(selectors){
            return this.traverse(prop, doWhile, selectors);
        };
    }

    function matches(methodName){
        return function(comparison, context){
            return this.matches(methodName, comparison, context);
        };
    }

    extend(pabloCollectionApi, {
        // ARRAY-LIKE QUERY
        indexOf: matches('indexOf'),
        some: matches('some'),
        every: matches('every'),
        select: matches('select'),
        // Note: `select()` is analogous to Array.filter but is called `select`
        // here (as in Underscore.js) because Pablo's filter() method is used to
        // create a `<filter>` SVG element.


        // INSERTION
        child:        insert(append, true, false),
        append:       insert(append),
        appendTo:     insert(append, false),
        prepend:      insert(prepend),
        prependTo:    insert(prepend, false),
        before:       insert(before),
        insertBefore: insert(before, false),
        after:        insert(after),
        insertAfter:  insert(after, false),


        // TRAVERSAL
        // NOTE on svgElement.children: ideally, we'd use the 'children'
        // collection, instead of 'childNodes'. Even if a browser implements 
        // 'children' on HTML elements, it isn't always implemented on SVG elements
        // See https://hacks.mozilla.org/2009/06/dom-traversal/
        // Bug report in WebKit: https://bugs.webkit.org/show_bug.cgi?id=112698
        children:     traverse('childNodes'),
        firstChild:   traverse('firstElementChild'),
        lastChild:    traverse('lastElementChild'),
        prev:         traverse('previousElementSibling'),
        prevSiblings: traverse('previousElementSibling', true),
        next:         traverse('nextElementSibling'),
        nextSiblings: traverse('nextElementSibling', true),
        parent:       traverse('parentNode'),
        parents:      traverse('parentNode', isElement),
        parentsSvg:   traverse('parentNode', isSVGElement),
        viewport:     traverse('viewportElement'),
        viewports:    traverse('viewportElement', true),

        owner: function(selectors){
            // Use try/catch as Firefox 23 throws error on attempting to access the 
            // `ownerSVGElement` of an element out of the DOM
            // https://bugzilla.mozilla.org/show_bug.cgi?id=912311
            try {
                return this.traverse('ownerSVGElement', false, selectors);
            }
            catch(e){
                return Pablo();
            }
        },
        owners: function(selectors){
            // Use try/catch as Firefox 23 throws error on attempting to access the 
            // `ownerSVGElement` of an element out of the DOM
            // https://bugzilla.mozilla.org/show_bug.cgi?id=912311
            try {
                return this.traverse('ownerSVGElement', true, selectors);
            }
            catch(e){
                return Pablo();
            }
        },
        ancestor: function(){
            return this.traverse('parentNode', isElementOrDocument).last();
        },
        // Find each element's SVG root element
        root: function(selectors){
            return this.map(function(el){
                var node = this.length === 1 ?
                    this : Pablo(el);
                return node.owners(selectors).last();
            });
        },
        siblings: function(selectors){
            return this.prevSiblings(selectors)
                       .add(this.nextSiblings(selectors));
        },
        find: function(selectors){
            return this.map(function(el){
                return el.querySelectorAll(selectors);
            });
        }
    });


    // ALIASES

    extend(pabloCollectionApi, {
        elements: pabloCollectionApi.toArray,
        push:     pabloCollectionApi.add,
        forEach:  pabloCollectionApi.each,
        is: pabloCollectionApi.some,
        lastIndexOf: pabloCollectionApi.indexOf
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
                var isSingle = this.length === 1;
                return this.some(function(el, i){
                    // Avoid unnecessary Pablo collection creation
                    var node = isSingle ? this : Pablo(el),
                        val = this.getValue(className, i),
                        classString = node.attr('class');

                    return classString && (' ' + classString + ' ')
                        .indexOf(' ' + val + ' ') >= 0;
                }, this);
            },

            addClass: function(className){
                var isSingle = this.length === 1;
                return this.each(function(el, i){
                    // Avoid unnecessary Pablo collection creation
                    var node = isSingle ? this : Pablo(el),
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
                var isSingle = this.length === 1;
                return this.each(function(el, i){
                    // Avoid unnecessary Pablo collection creation
                    var node = isSingle ? this : Pablo(el),
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
                var isSingle = this.length === 1;
                return this.each(function(el, i){
                    // Avoid unnecessary Pablo collection creation
                    var node = isSingle ? this : Pablo(el),
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

    // Pablo main function
    function Pablo(node, attr){
        return new PabloCollection(node, attr);
    }
    
    // Pablo methods
    extend(Pablo, {
        v: pabloVersion,
        isSupported: true,
        supportsClassList: supportsClassList,
        ns: {
            svg: svgns,
            xlink: xlinkns
        },
        svgVersion: svgVersion,
        Collection: PabloCollection,
        Events: Events,
        fn: pabloCollectionApi,

        // methods
        make: make,
        isArray: function(obj){
            return Array.isArray(obj);
        },
        isArrayLike: isArrayLike,
        isElement: isElement,
        isSVGElement: isSVGElement,
        hasSvgNamespace: hasSvgNamespace,
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
        camelCaseToHyphens: camelCaseToHyphens,

        // vendor prefixes
        vendorPrefixes: vendorPrefixes,
        cssPrefixes: cssPrefixes,
        getPrefixedProperty: getPrefixedProperty,
        cssPrefix: cssPrefix,
            // e.g. Pablo('svg').style().content('#foo{' + Pablo.cssPrefix('transform', 'rotate(45deg)') + '}');
            // e.g. myElement.css({'transition-property': Pablo.cssPrefix('transform')});

        // data
        // TODO: should `Pablo.cache` & `.data()` be removed, to keep cache private?
        cache: cache,

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
        },

        get: function(url, callback){
            var xhr;

            if (XMLHttpRequest){
                xhr = new XMLHttpRequest();
                
                xhr.onload = function(){
                    callback(this.responseText, this);
                };
                xhr.open('get', url, true);
                xhr.send();
            }
            return this;
        },

        load: function(url, callback){
            // An empty collection to be populated with the loaded content, once loaded, like a promise
            var collection = Pablo();

            this.get(url, function(markup, xhr){
                // Create Pablo collection from document
                collection.add(xhr.responseXML && xhr.responseXML.childNodes);
                callback.call(collection, xhr);
            });

            return collection;
        }
    });


    /////

    
    // SVG ELEMENT METHODS
    svgElements.split(' ')
        .forEach(function(nodeName){
            var camelCase = hyphensToCamelCase(nodeName),
                createElement = function(attr){
                    return Pablo(make(nodeName), attr);
                };

            if (nodeName === 'svg'){
                createElement = function(attr){
                    attr = extend(attr, {version: svgVersion});
                    return Pablo(make(nodeName), attr);
                };
            }
            
            // Add a new method namespace for each element name
            Pablo.template(nodeName, createElement);

            // Create methods aliases to allow camelCase element name
            Pablo[camelCase] = Pablo[nodeName];
            pabloCollectionApi[camelCase] = pabloCollectionApi[nodeName];
        });

    
    /////
    
    // Set as a global variable
    root.Pablo = Pablo;

}(
    this,
    this.Object,
    this.Array,
    this.Element,
    this.SVGElement,
    this.NodeList,
    this.HTMLDocument,
    this.document,
    this.XMLHttpRequest
));