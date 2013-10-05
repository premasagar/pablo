/*!
    Pablo <http://pablojs.com>

    by Premasagar Rose <http://premasagar.com>,
       Dharmafly <http://dharmafly.com>

    Repo: <https://github.com/dharmafly/pablo>
    MIT license

*/
/*jshint newcap:false */

(function(window, Object, Array, Element, SVGElement, NodeList, HTMLDocument, document, XMLHttpRequest){
    'use strict';
    
    var /* SETTINGS */
        pabloVersion = '0.3.3',
        svgVersion = 1.1,
        svgns = 'http://www.w3.org/2000/svg',
        xlinkns = 'http://www.w3.org/1999/xlink',
        vendorPrefixes = ['', 'moz', 'webkit', 'khtml', 'o', 'ms'],
        svgElementNames = 'a altGlyph altGlyphDef altGlyphItem animate animateColor animateMotion animateTransform circle clipPath color-profile cursor defs desc ellipse feBlend feColorMatrix feComponentTransfer feComposite feConvolveMatrix feDiffuseLighting feDisplacementMap feDistantLight feFlood feFuncA feFuncB feFuncG feFuncR feGaussianBlur feImage feMerge feMergeNode feMorphology feOffset fePointLight feSpecularLighting feSpotLight feTile feTurbulence filter font font-face font-face-format font-face-name font-face-src font-face-uri foreignObject g glyph glyphRef hkern image line linearGradient marker mask metadata missing-glyph mpath path pattern polygon polyline radialGradient rect script set stop style svg switch symbol text textPath title tref tspan use view vkern',
        cacheExpando = 'pablo-data',
        eventsNamespace = '__events__',

        head, testElement, arrayProto, support, hyphensToCamelCase, 
        camelCaseToHyphens, toSvg, cache, cacheNextId, matchesProp, Events,
        cssClassApi, pabloCollectionApi, classlistMethod, cssPrefixes;

    
    function make(elementName){
        return typeof elementName === 'string' &&
            document.createElementNS(svgns, elementName) ||
            null;
    }

    function getPrefixedProperty(prop, context){
        var capitalized = prop.slice(0,1).toUpperCase() + prop.slice(1),
            found;

        if (!context){
            context = window;
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


    // TEST ENVIRONMENT CAPABILITY

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
        'childNodes'    in testElement && // see note on svgElement.children, below
        'create'        in Object &&
        'keys'          in Object &&
        'isArray'       in Array &&
        'forEach'       in arrayProto &&
        'map'           in arrayProto &&
        'some'          in arrayProto &&
        'every'         in arrayProto &&
        'filter'        in arrayProto &&
        'DOMParser'     in window &&
        'XMLSerializer' in window
    )){
        // Incompatible environment
        // Set `Pablo` to be a simple reference object
        window.Pablo = {
            v: pabloVersion,
            isSupported: false
        };

        // Exit the script
        return;
    }


    /////


    support = {
        basic: true,
        classList: 'classList' in testElement,
        dataURL:   'btoa' in window,
        download: 'download' in document.createElement('a')
    };

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

    function isArray(obj){
        return Array.isArray(obj);
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
        return !!(obj && obj.namespaceURI === svgns);
    }
    
    function isSVGElement(obj){
        return obj instanceof SVGElement;
    }
    
    function canBeWrapped(obj){
        return typeof obj === 'string' ||
            isPablo(obj) ||
            isElement(obj) ||
            isNodeList(obj) ||
            isHTMLDocument(obj) ||
            Array.isArray(obj) ||
            isArrayLike(obj) ||
            hasSvgNamespace(obj);
    }
    
    // Return node (with attributes) if a Pablo collection, otherwise create one.
    function toPablo(node, attr){
        if (isPablo(node)){
            return attr ? node.attr(attr) : node;
        }
        return Pablo(node, attr);
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

    function attributeNS(el, attr){
        var colonIndex, ns, name, uri;

        // e.g. an HTML element, or setting `xmlns` or `xmlns:xlink` on SVG elements
        if (!hasSvgNamespace(el) || attr.indexOf('xmlns') === 0){
            return false;
        }

        colonIndex = attr.indexOf(':');

        if (colonIndex === -1){
            return true;
        }

        ns = attr.slice(0, colonIndex);
        uri = Pablo.ns[ns] || null;
        name = attr.slice(colonIndex + 1);

        return [uri, name];
    }

    function getAttribute(el, attr){
        var attrNS = attributeNS(el, attr);

        switch(attrNS){
            case false:
            return el.getAttribute(attr);

            case true:
            return el.getAttributeNS(null, attr);

            default:
            return el.getAttributeNS(attrNS[0], attrNS[1]);
        }
    }

    function setAttribute(el, attr, value){
        var attrNS = attributeNS(el, attr);

        switch(attrNS){
            case false:
            return el.setAttribute(attr, value);

            case true:
            return el.setAttributeNS(null, attr, value);

            default:
            return el.setAttributeNS(attrNS[0], attrNS[1], value);
        }
    }

    function removeAttribute(el, attr){
        var attrNS = attributeNS(el, attr);

        switch(attrNS){
            case false:
            return el.removeAttribute(attr);

            case true:
            return el.removeAttributeNS(null, attr);

            default:
            return el.removeAttributeNS(attrNS[0], attrNS[1]);
        }
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
        var parser, prefix, suffix;

        return function toSvg(markup){
            var svgdoc, target;

            if (!parser){
                parser = new window.DOMParser();
                suffix = '</svg>';
                // Add a <g> to a <svg> to ensure the <svg> is not self-closing
                prefix = Pablo.svg().append(Pablo.g()).markup().replace(/<g.*/, '');
            }
            markup = prefix + markup + suffix;

            // not supported in IE9: mime type 'image/svg+xml'
            svgdoc = parser.parseFromString(markup, 'application/xml');
            target = Pablo(svgdoc.documentElement.childNodes);
            return target.detach();
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
                    else if (isPablo(node)){
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
            if (this.length){
                if (this.length === 1){
                    fn.call(context || this, this[0], 0);
                }
                else {
                    arrayProto.forEach.call(this, fn, context || this);
                }
            }
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
        `withData` clones data associated with the element (default false)
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
                    node = isSingle ? this : Pablo(el);
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

        getValue: function(value, i){
            if (Array.isArray(value)){
                // If array is shorter than collection, then cycle back to start
                // of array
                i = i % value.length;
                value = value[i];
            }
            else if (typeof value === 'function'){
                value = value.call(this, this[i], i);
            }
            return value;
        },
        
        attr: function(attr, value){
            var el, attributes;

            // Return an object of all attributes on the first element in
            // the collection
            if (typeof attr === 'undefined'){
                return getAttributes(this[0]);
            }

            // Handle a named attribute
            if (typeof attr === 'string'){
                // Get the attribute from the first element in the collection
                if (typeof value === 'undefined'){
                    el = this[0];
                    return el && getAttribute(el, attr);
                }

                // Set the attribute

                // Return, if no elements
                if (!this.length){
                    return this;
                }

                // Set the attribute, if the collection only has one element
                if (this.length === 1){
                    setAttribute(this[0], attr, this.getValue(value, 0));
                    return this;
                }

                attributes = {};
                attributes[attr] = value;
            }

            else {
                attributes = attr;
            }

            return this.each(function(el, i){
                var attr, value;

                for (attr in attributes){
                    if (attributes.hasOwnProperty(attr)){
                        value = attributes[attr];
                        setAttribute(el, attr, this.getValue(value, i));
                    }
                }
            });
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
        
        removeAttr: function(attr) {
            if (this.length === 1){
                removeAttribute(this[0], attr);
            }
            else if (this.length > 1){
                this.each(function(el){
                    removeAttribute(el, attr);
                });
            }
            return this;
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
                    prop, value;
                
                for (prop in styles){
                    if (styles.hasOwnProperty(prop)){
                        value = this.getValue(styles[prop], i);
                        style.setProperty(prop, value, '');
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
        },

        toSingleSvg: function(){
            // If this is already a single <svg> element
            if (this.length === 1 && this[0].nodeName === 'svg'){
                return this;
            }
            // Append to a new <svg> element
            return Pablo.svg().append(this);
        },

        crop: function(to){
            return this.each(function(el){
                var node, bbox;

                // This is an <svg> element
                if (el.nodeName === 'svg'){
                    node = Pablo(el);

                    // optional `to` passed
                    if (to){
                        // e.g. crop(circles)
                        if (isPablo(to)){
                            // get bbox of the collection
                            bbox = to.bbox();
                        }
                        // e.g. crop({x:-10,y:50,width:100, height:100})
                        else {
                            // a bbox object
                            bbox = to;
                        }
                    }

                    // e.g. crop()
                    else {
                        // get bbox of the <svg> element
                        bbox = node.bbox();
                    }

                    // Apply dimension attributes to the <svg> element
                    node.attr({
                        width:   bbox.width,
                        height:  bbox.height,
                        viewBox: bbox.x + ' ' + bbox.y + ' ' + bbox.width + ' ' + bbox.height
                    });
                }
            });
        },

        // Get bounding box of all elements in collection
        bbox: function(){
            var svg = this.clone()
                            .toSingleSvg()
                            .appendTo(document.body),
                bbox = svg[0].getBBox();

            svg.detach();
            return bbox;
        },

        markup: (function(){
            var serializer;

            return function(asCompleteFile){
                var collection = this,
                    markup;

                if (!serializer){
                    serializer = new window.XMLSerializer();
                }

                if (asCompleteFile){
                    collection = this.clone().toSingleSvg();
                }

                if (collection.length === 1){
                    return serializer.serializeToString(collection[0]);
                }

                markup = '';
                collection.each(function(el){
                    markup += serializer.serializeToString(el);
                });
                return markup;
            };
        }()),

        toDataURL: (function(){
            if (support.dataURL){
                return function(){
                    var markup = this.markup(true);
                    return 'data:image/svg+xml;base64,' + window.btoa(markup);

                    // Alternative approach:
                    //var blob = new window.Blob([markup], {type:'image/svg+xml'});
                    //return window.URL.createObjectURL(blob);
                };
            }
            // Can't generate dataURL (use a polyfill to enable the toDataURL method in an unsupported browser)
            return function(){
                return 'about:blank';
            };
        }()),

        toCanvas: function(canvas){
            var img = this.toImage(),
                doCanvasResize = !canvas,
                ctx;

            if (!canvas){
                canvas = document.createElement('canvas');
            }
            canvas = toPablo(canvas);
            ctx = canvas[0].getContext('2d');

            // HACK for Safari 6.0.5
            img.css({
                    visibility: 'hidden',
                    position: 'absolute',
                    top: '-99999px'
                })
                .appendTo('body');
            // end HACK for Safari 6.0.5

            img.one('load', function(){
                var width  = this.width,
                    height = this.height;

                if (doCanvasResize){
                    canvas.attr({
                        width:  width,
                        height: height
                    });
                }
                ctx.drawImage(this, 0, 0, width, height);

                // HACK for Safari 6.0.5
                img.detach();
                // end HACK for Safari 6.0.5
                
                canvas.trigger('img:load');
            });

            return canvas;
        },

        // type: 'svg' (default), 'png' or 'jpeg'
        toImage: function(type){
            var el = document.createElement('img'),
                img = Pablo(el);

            if (!type || type === 'svg'){
                img.one('load', function(){
                    img.attr({
                        width:  el.width,
                        height: el.height
                    });
                });
                el.src = this.toDataURL();
            }
            else {
                this.toCanvas().one('img:load', function(){
                    try {
                        img.attr({
                            src: this.toDataURL('image/' + type),
                            width:  this.width,
                            height: this.height
                        });
                    }
                    catch(e){}
                });
            }
            return img;
        },

        // See http://hackworthy.blogspot.pt/2012/05/savedownload-data-generated-in.html
        // Polyfills:
        // https://github.com/eligrey/Blob.js
        // https://github.com/eligrey/FileSaver.js
        // https://github.com/eligrey/canvas-toBlob.js
        // http://www.nihilogic.dk/labs/canvas2image/
        download: function(filename){
            var link = Pablo(document.createElement('a')),
                markup = this.markup(this),
                url = this.toDataURL(),
                // An alternative approach to using toDataURL is to create a Blob
                //blob = new window.Blob([markup], {type:'image/svg+xml'}),
                //url = window.URL.createObjectURL(blob),
                event;

            link.attr('href', url);

            if (support.download){
                link.attr('download', filename || 'pablo.svg');
                event = document.createEvent('MouseEvents');
                event.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
                link[0].dispatchEvent(event);
            }

            return link;
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
                var args = toArray(arguments);

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


    /////


    // CHECK CONDITION

    function checkCondition(fn, passCollection){
        return function(any){
            if (this.length === 1){
                return fn(passCollection ? this : this[0]);
            }
            else {
                return any ? this.some(fn) : this.every(fn);
            }
        };
    }

    extend(pabloCollectionApi, {
        isInDocument: checkCondition(function(node){
            return toPablo(node).parents(document.body).length === 1;
        }, true),

        isRoot: checkCondition(function isRoot(el){
            return el.nodeName === 'svg' && !el.ownerSVGElement;
        }),

        hasSvgNamespace: checkCondition(function(el){
            return hasSvgNamespace(el);
        })
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
    if (support.classList){
        classlistMethod = function(method){
            return function(className){
                return this.each(function(el, i){
                    var value = this.getValue(className, i);
                    this.processList(value, function(className){
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
                    var value = this.getValue(className, i);
                    return el.classList.contains(value);
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
                        value = this.getValue(className, i),
                        classString = node.attr('class');

                    return classString && (' ' + classString + ' ')
                        .indexOf(' ' + value + ' ') >= 0;
                }, this);
            },

            addClass: function(className){
                var isSingle = this.length === 1;
                return this.each(function(el, i){
                    // Avoid unnecessary Pablo collection creation
                    var node = isSingle ? this : Pablo(el),
                        value = this.getValue(className, i),
                        classString;

                    this.processList(value, function(className){
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
                        value = this.getValue(className, i);

                    this.processList(value, function(className){
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
                        value = this.getValue(className, i);

                    this.processList(value, function(className){
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

    // Check if the object is a Pablo collection
    function isPablo(obj){
        return obj instanceof Pablo.Collection;
    }
    
    // Pablo methods
    extend(Pablo, {
        v: pabloVersion,
        isSupported: true,
        support: support,
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
        isArray: isArray,
        isArrayLike: isArrayLike,
        isElement: isElement,
        isSVGElement: isSVGElement,
        hasSvgNamespace: hasSvgNamespace,
        isNodeList: isNodeList,
        isHTMLDocument: isHTMLDocument,
        // isPablo is overwritten in functional.js extension
        isPablo: isPablo,
        extend: extend,
        toArray: toArray,
        getAttributes: getAttributes,
        getAttribute: getAttribute,
        setAttribute: setAttribute,
        removeAttribute: removeAttribute,
        canBeWrapped: canBeWrapped,
        hyphensToCamelCase: hyphensToCamelCase,
        camelCaseToHyphens: camelCaseToHyphens,

        // vendor prefixes
        vendorPrefixes: vendorPrefixes,
        svgElementNames: svgElementNames,
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
    svgElementNames.split(' ')
        .forEach(function(nodeName){
            var camelCase = hyphensToCamelCase(nodeName),
                createElement = function(attr){
                    return Pablo(make(nodeName), attr);
                };

            if (nodeName === 'svg'){
                createElement = function(attr){
                    // Extend <svg> element with SVG version and xmlns namespace
                    attr = extend(attr, {
                        version: svgVersion,
                        xmlns: svgns
                    });

                    // Extend attribute with each namespace in the `Pablo.ns` map
                    Object.keys(Pablo.ns).forEach(function(ns){
                        // There's no need to add `xmlns:svg`, as this is already
                        // provided by the plain `xmlns` attribute
                        if (ns !== 'svg'){
                            attr['xmlns:' + ns] = Pablo.ns[ns];
                        }
                    });

                    // Create the element
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
    window.Pablo = Pablo;

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