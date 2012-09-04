/*
    Pablo <https://github.com/dharmafly/pablo>

    by Premasagar Rose <http://premasagar.com>,
       Dharmafly <http://dharmafly.com>

    MIT license: http://opensource.org/licenses/mit-license.php
*/


var Pablo = (function(document, Array, Element, NodeList){
    'use strict';
    
    var /* SETTINGS */
        pabloVersion = '0.2.0',
        svgVersion = 1.1,
        svgns = 'http://www.w3.org/2000/svg',
        xlinkns = 'http://www.w3.org/1999/xlink',
        vendorPrefixes = ['', '-moz-', '-webkit-', '-khtml-', '-o-', '-ms-'],

        testElement, supportsClassList, hyphensToCamelCase, cssClassApi,
        pabloApi, pabloCollectionApi, createPablo;

    
    function make(elementName){
        return typeof elementName === 'string' &&
            document.createElementNS(Pablo.svgns || svgns, elementName) ||
            null;
    }


    /////


    // TEST BROWSER COMPATIBILITY

    testElement = document.createElementNS && make('svg');
    
    // Incompatible browser
    if (!(
        document && document.querySelectorAll &&
        Array && Array.isArray && Array.prototype.forEach &&
        Element && NodeList &&
        testElement && testElement.createSVGRect
    )){
        // Return a simplified version of the Pablo API
        return {
            v: pabloVersion,
            isSupported: false
        };
    }

    supportsClassList = !!testElement.classList;

    
    /////
    
    
    // UTILITIES
    
    function extend(target/*, any number of source objects*/){
        var i = 1,
            len = arguments.length,
            withPrototype = arguments[len-1] === true,
            obj, prop;
        
        target || (target = {});
        for (; i < len; i++){
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
        return Array.prototype.slice.call(obj);
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
    
    function isArray(obj){
        return Array.isArray(obj);
    }

    function isArrayLike(obj){
        return obj && typeof obj === 'object' && typeof obj.length === 'number';
    }

    function isArrayOfStrings(obj){
        return isArray(obj) && obj.length && obj.length === obj.filter(function(el){
            return typeof el === 'string';
        }).length;
    }
    
    function isElement(obj){
        return obj instanceof Element;
    }
    
    function isNodeList(obj){
        return obj instanceof NodeList;
    }
    
    function isSvg(obj){
        return obj.namespaceURI == Pablo.svgns;
    }
    
    // Returns true for both a Pablo instance and its API function
    function isPablo(obj){
        return !!(obj && 
            // See extensions/functional.js for example usage of node.collection
            (obj instanceof PabloCollection || obj.collection instanceof PabloCollection)
        );
    }
    
    function canBeWrapped(obj){
        return isPablo(obj) ||
            isElement(obj) ||
            isNodeList(obj) ||
            isArray(obj) ||
            isArrayLike(obj);
    }
    
    // Return node if a PabloCollection, otherwise create one
    function toPablo(node, attr){
        return isPablo(node) ?
            node : Pablo(node, attr);
    }
    
    function addElementIfUnique(node, elements, prepend){
        var toPush, el;
        
        if (isPablo(node)){
            // See extensions/functional.js for example usage of node.collection
            toPush = node.collection || node;
        }
        else if (isArray(node)){
            toPush = node;
        }
        else if (isArrayLike(node)){
            toPush = toArray(node);
        }
        else {
            el = isElement(node) ? node : make(node);

            // Is an element, but is not found in the node list
            if (el && elements.indexOf(el) === -1){
                Array.prototype[prepend ? 'unshift' : 'push'].call(elements, el);
            }
            return;
        }

        toPush.forEach(function(el){
            addElementIfUnique(el, elements);
        });
    }

    // Return CSS styles with browser vendor prefixes
    // e.g. cssPrefix({transform:'rotate(45deg)'}) will return the styles object, with additional properties containing CSS properties prefixed with the browser vendor prefixes - see vendorPrefixes
    // e.g. cssPrefix('transform', 'rotate(45deg)') will return a string sequence of prefixed CSS properties, each assigned the same value
    // e.g. cssPrefix('transform') will return a string sequence of CSS properties
    function cssPrefix(styles, value){
        var vendorPrefixes = Pablo.vendorPrefixes,
            prop, res, rule;
        
        if (typeof styles === 'object'){
            res = {};
            for (prop in styles){
                if (styles.hasOwnProperty(prop)){
                    vendorPrefixes.forEach(function(prefix){
                        res[prefix + prop] = styles[prop];
                    });
                }
            }
        }

        if (typeof styles === 'string'){
            prop = styles;

            // e.g. cssPrefix('transform', 'rotate(45deg)') -> 'transform:rotate(45deg);-webkit-transform:rotate(45deg);...'
            if (typeof value === 'string'){
                rule = prop + ':' + value + ';';
                res = vendorPrefixes.join(rule) + rule;
            }
            // e.g. cssPrefix('transform') -> 'transform,-webkit-transform,...'
            // useful for adding prefixed properties when setting active properties in a CSS transition
            else {
                res = vendorPrefixes.join(prop + ',') + prop;
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
    });
    
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
    
    
    /////
    
    
    // ELEMENT API
    
    function PabloCollection(node, attr){
        if (node){
            this.push(node);
            
            // Apply attributes, if we're creating new elements
            if (attr && (typeof node === 'string' || isArrayOfStrings(node))){
                this.attr(attr);
            }
        }
    }
    
    // Node prototype
    pabloCollectionApi = PabloCollection.prototype = [];

    extend(pabloCollectionApi, {
        collection: null,
        constructor: PabloCollection,
        make: make,
        
        get: function(index){
            return this[index];
        },

        toArray: function(){
            return toArray(this);
        },
        
        eq: function(index){
            return index >= 0 ?
                // Return zero-indexed node
                Pablo(this[index]) :
                // Return node, counting backwards from end of elements array
                (index < -1 ? this.slice(index, index + 1) : this.slice(index));
        },
        
        size: function(){
            return this.length;
        },

        // Add new node(s) to the collection; accepts arrays or nodeLists
        push: function(node){
            addElementIfUnique(node, this);
            return this;  
        },
        
        // Add new node(s) to the collection; accepts arrays or nodeLists
        unshift: function(node){
            addElementIfUnique(node, this, true);
            return this;
        },
        
        // Remove node from end of the collection
        pop: function(){
            return Pablo(Array.prototype.pop.call(this));
        },
        
        shift: function(){
            return Pablo(Array.prototype.shift.call(this));
        },
        
        slice: function(begin, end){
            return Pablo(Array.prototype.slice.call(this, begin, end));
        },
        
        each: function(fn){
            this.forEach(fn, this);
            return this;
        },
        
        map: function(fn){
            return Pablo(
                Array.prototype.map.call(this, fn)
            );
        },
        
        // Note: name due to conflict with 'filter' element method
        filterElements: function(fn){
            return Pablo(
                Array.prototype.filter.call(this, fn)
            );
        },


        /////


        // TRAVERSAL
        
        children: function(){
            var children = Pablo();
            
            this.each(function(el){
                toArray(el.childNodes).forEach(function(child){
                    children.push(child);
                });
            });
            return children;
        },
        
        parent: function(){
            var parents = Pablo();
            
            this.each(function(el){
                parents.push(el.parentNode);
            });
            return parents;
        },

        nextSibling: function(){
            var siblings = Pablo();
            
            this.each(function(el){
                siblings.push(el.nextSibling);
            });
            return siblings;
        },

        prevSibling: function(){
            var siblings = Pablo();
            
            this.each(function(el){
                siblings.push(el.previousSibling);
            });
            return siblings;
        },

        siblings: function(){
            var siblings = Pablo();

            this.each(function(el){
                var nodeSiblings = Pablo(el).parent().children().filterElements(function(child){
                    return child !== el;
                });

                siblings.push(nodeSiblings);
            });

            return siblings;
        },
        
        find: function(selectors){
            var found = Pablo();
            
            this.each(function(el){
                toArray(el.querySelectorAll(selectors)).forEach(function(target){
                    found.push(target);
                });
            });
            return found;
        },


        /////


        // MANIPULATE
        
        // Create SVG root wrapper
        // TODO: getRoot() method returns closest parent root to the element
        root: function(attr){
            attr = extend(attr, {version: Pablo.svgVersion});
            return this.svg(attr);
        },
        
        empty: function(){
            return this.each(function(el){
                while (el.firstChild) {
                    el.removeChild(el.firstChild);
                }
            });
        },
        
        remove: function(){
            return this.each(function(el){
                var parentNode = el.parentNode;
                if (parentNode){
                    parentNode.removeChild(el);
                }
            });
        },
        
        // NOTE: the following append-related functions all require attr to exist, even as a blank object, if a new element is to be created. Otherwise, if the first argument is a string, then a selection operation will be performed.
        // TODO: If appending pre-existing elements, then clone before appending, or stop after first element in the collection?
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
            return this.each(function(el, i, thisNode){
                var parentNode = el.parentNode;
                if (parentNode){
                    Pablo(node, attr).each(function(toInsert){
                        parentNode.insertBefore(toInsert, el);
                    });
                }
            });
        },
        
        after: function(node, attr){
            return this.each(function(el, i, thisNode){
                var parentNode = el.parentNode;
                if (parentNode){
                    Pablo(node, attr).each(function(toInsert){
                        parentNode.insertBefore(toInsert, el.nextSibling);
                    });
                }
            });
        },
        
        prepend: function(node, attr){
            return this.each(function(el){
                var first = el.firstChild;
                Pablo(node, attr).each(function(child){
                    el.insertBefore(child, first);
                });
            });
        },
        
        prependTo: function(node, attr){
            toPablo(node, attr).prepend(this);
            return this;
        },
        
        clone: function(deep){
            deep = deep || false;
            return Pablo(
                this.map(function(el){
                    return el.cloneNode(deep);
                })
            );
        },
        
        duplicate: function(repeats){
            var duplicates = Pablo();
            repeats || (repeats = 1);
            
            while (repeats --){
                duplicates.push(this.clone(true).get(0));
            }
            this.after(duplicates);
            return this.push(duplicates);
        },
        
        attr: function(attr, value){
            var el, attributeName;

            if (typeof attr === 'undefined'){
                return getAttributes(this.get(0));
            }

            if (typeof attr === 'string'){
                // Get attribute
                if (typeof value === 'undefined'){
                    el = this.get(0);
                    return el && el.getAttribute(attr);
                }

                // Create attributes object
                attributeName = attr;
                attr = {};
                attr[attributeName] = value;
            }
            
            // Set multiple attributes
            this.each(function(el, i){
                var PabloCollection, prop, val;
                
                for (prop in attr){
                    if (attr.hasOwnProperty(prop)){
                        val = attr[prop];
                        
                        if (typeof val === 'function'){
                            val = val.call(this, el, i);
                        }
                    
                        // TODO: remove these
                        switch (prop){
                            case '_content':
                            (PabloCollection || (PabloCollection = Pablo(el)))
                                .content(val);
                            continue;
                        
                            case '_children':
                            (PabloCollection || (PabloCollection = Pablo(el)))
                                .append(val);
                            continue;
                        
                            case '_link':
                            (PabloCollection || (PabloCollection = Pablo(el)))
                                .link(val);
                            continue;
                        }
                        el.setAttributeNS(null, prop, val);
                    }
                }
            });
            return this;
        },
        
        removeAttr: function (attr) {
            return this.each(function (el, i){
                el.removeAttributeNS(null, attr);
            });
        },

        link: function(href){
            return this.each(function(el){
                el.setAttributeNS(xlinkns, 'xlink:href', href);
            });
        },
        
        content: function(text){
            var el;

            // Get first element's textContent
            if (typeof text === 'undefined'){
                el = this.get(0);
                return el && el.textContent || '';
            }
            
            // Set every element's textContent
            return this.each(function(el){
                el.textContent = text;
            });
        },

        css: function(styles, value){
            var el, styleProperty;

            if (typeof styles === 'string'){
                // Get style
                if (typeof value === 'undefined'){
                    el = this.get(0);
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
                        val = styles[prop];

                        if (typeof val === 'function'){
                            val = val.call(this, el, i);
                        }
                        style.setProperty(prop, val, '');
                    }
                }
            });
        },

        // Add prefixed CSS styles to elements in collection
        cssPrefix: function(styles, value){
            var styleProperty;
            
            if (typeof styles === 'string' && typeof value === 'string'){
                // Create styles object
                styleProperty = styles;
                styles = {};
                styles[styleProperty] = value;
            }
            return this.css(cssPrefix(styles));
        },


        /////


        // DOM EVENTS
        
        // TODO: allow event delegation
        on: function(type, listener, useCapture){
            return this.each(function(el){
                el.addEventListener(type, listener, useCapture || false);
            });
        },
        
        off: function(type, listener, useCapture){
            return this.each(function(el){
                el.removeEventListener(type, listener, useCapture || false);
            });
        },
        
        // Allow just one event for the whole collection of elements
        one: function(type, listener, useCapture){
            var thisNode = this;
            return this.on(type, function addListener(){
                // Remove listener
                thisNode.off(type, addListener, useCapture);
                // Fire listener
                listener.apply(thisNode, arguments);
            }, useCapture);
        },
        
        // Allow one event on each of the elements in the collection
        oneEach: function(type, listener, useCapture){
            this.each(function(el){
                var node = Pablo(el);
                node.on(type, function addListener(){
                    // Remove listener
                    node.off(type, addListener, useCapture);
                    // Fire listener
                    listener.apply(node, arguments);
                }, useCapture);
            });
        }
    });


    /////

    
    // CSS Classes methods

    // IE9 doesn't support native classLists for HTML or SVG;
    //      Chrome 21 & WebKit doesn't support classLists for SVG
    // For alternatives, see https://gist.github.com/1319121 and
    //      https://developer.mozilla.org/media/uploads/demos/p/a/paulrouget/8bfba7f0b6c62d877a2b82dd5e10931e/hacksmozillaorg-achi_1334270447_demo_package/classList/classList.js - linked from https://hacks.mozilla.org/2010/01/classlist-in-firefox-3-6/
    cssClassApi = supportsClassList ?
        {
            hasClass: function(className){
                var el = this.get(0);
                return !!(el && el.classList.contains(className));
            },

            addClass: function(className){
                return this.each(function(el){
                    el.classList.add(className);
                });
            },

            removeClass: function(className){
                return this.each(function(el){
                    el.classList.remove(className);
                });
            },

            toggleClass: function(className){
                return this.each(function(el){
                    el.classList.toggle(className);
                });
            }
        } :

        {
            hasClass: function(className){
                var classString = this.attr('class');

                return !!classString && (' ' + classString + ' ')
                    .indexOf(' ' + className + ' ') >= 0;
            },

            addClass: function(className){
                var classString;

                if (this.hasClass(className)){
                    return this;
                }
                classString = this.attr('class');
                classString = classString ? (classString + ' ') : '';
                return this.attr('class',  classString + className);
            },

            removeClass: function(className){
                var classString;

                if (!this.hasClass(className)){
                    return this;
                }
                classString = this.attr('class') || '';
                classString = classString.replace(new RegExp('(^|\\s)' + className + '(\\s|$)'), '$2');
                return this.attr({'class': classString});
            },

            toggleClass: function(className){
                return this.each(function(el){
                    if (this.hasClass(className)){
                        this.removeClass(className);
                    }
                    else {
                        this.addClass(className);
                    }
                });
            }
        };

    extend(pabloCollectionApi, cssClassApi);


    /////

    
    // SVG element methods
    'a altGlyph altGlyphDef altGlyphItem animate animateColor animateMotion animateTransform circle clipPath color-profile cursor defs desc ellipse feBlend feColorMatrix feComponentTransfer feComposite feConvolveMatrix feDiffuseLighting feDisplacementMap feDistantLight feFlood feFuncA feFuncB feFuncG feFuncR feGaussianBlur feImage feMerge feMergeNode feMorphology feOffset fePointLight feSpecularLighting feSpotLight feTile feTurbulence filter font font-face font-face-format font-face-name font-face-src font-face-uri foreignObject g glyph glyphRef hkern image line linearGradient marker mask metadata missing-glyph mpath path pattern polygon polyline radialGradient rect script set stop style svg switch symbol text textPath title tref tspan use view vkern'.split(' ')
        .forEach(function(nodeName){
            var camelCaseName = hyphensToCamelCase(nodeName);
            
            Pablo[nodeName] = Pablo[camelCaseName] = function(attr){
                return Pablo.create(nodeName, attr);
            };
            pabloCollectionApi[nodeName] = pabloCollectionApi[camelCaseName] = function(attr){
                return Pablo.create(nodeName, attr).appendTo(this);
            };
        });

    
    // Pablo Node API Aliases
    pabloCollectionApi.add = pabloCollectionApi.push;

    
    /////
    
    
    // PABLO API
    
    // Select existing nodes in the document
    function selectPablo(selectors, context){
        // Valid selector
        if (selectors && typeof selectors === 'string'){
            return Pablo((context || document).querySelectorAll(selectors));
        }
        // Return empty Pablo collection
        return createPablo();
    }


    // Create Pablo: return a PabloCollection instance
    function createPablo(node, attr){
        return new PabloCollection(node, attr);
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
    pabloApi = {
        v: pabloVersion,
        isSupported: true,
        svgns: svgns,
        xlinkns: xlinkns,
        svgVersion: svgVersion,
        isPablo: isPablo,
        isElement: isElement,
        isNodeList: isNodeList,
        isSvg: isSvg,
        extend: extend,
        toArray: toArray,
        getAttributes: getAttributes,
        canBeWrapped: canBeWrapped,

        fn: pabloCollectionApi,
        Collection: PabloCollection,
        create: createPablo,
        select: selectPablo,

        // css related
        vendorPrefixes: vendorPrefixes,
        cssPrefix: cssPrefix
        // e.g. Pablo('svg').style().content('#foo{' + Pablo.cssPrefix('transform', 'rotate(45deg)') + '}');
        // e.g. myElement.css({'transition-property': Pablo.cssPrefix('transform)});
    };
    
    return extend(Pablo, pabloApi);
}(window.document, window.Array, window.Element, window.NodeList));