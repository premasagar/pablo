/*
    Pablo <https://github.com/dharmafly/pablo>

    by Premasagar Rose <http://premasagar.com>,
       Dharmafly <http://dharmafly.com>

    MIT license: http://opensource.org/licenses/mit-license.php
*/


var Pablo = (function(document, Array, JSON, Element, NodeList){
    'use strict';
    
    var svgns = 'http://www.w3.org/2000/svg',
        xlinkns = 'http://www.w3.org/1999/xlink',
        svgVersion = 1.1,
        pabloApi, pabloNodeApi, createPablo;


    // TEST BROWSER COMPATIBILITY
    
    function make(elementName){
        return typeof elementName === 'string' &&
            document.createElementNS(Pablo.svgns || svgns, elementName) ||
            null;
    }
    
    function isSupported(){
        return !!(
            document && Array && JSON && Element && NodeList &&
            document.querySelectorAll &&
            document.querySelector &&
            document.createElementNS &&
            Array.isArray &&
            Array.prototype.forEach &&
            make('svg').createSVGRect
        );
    }
    
    // Incompatible browser
    if (!isSupported()){
        return {isSupported:false};
    }

    
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
    
    // e.g. 'font-color' -> 'fontColor'
    function hyphenatedToCamelCase(str){
        return str.replace(/-([a-z])/g, function(match, letter){
            return letter.toUpperCase();
        });
    }
    
    // e.g. 'fontColor' -> 'font-color'
    // NOTE: does not check for blank spaces, i.e. for multiple words 'font Color'
    function camelCaseToHyphenated(str){
        return str.replace(/[A-Z]/g, function(letter){
            return '-' + letter.toLowerCase();
        });
    }
    
    function toArray(obj){
        return Array.prototype.slice.call(obj);
    }
    
    function toElement(node){
        if (isElement(node) || isPablo(node)){
            return node;
        }
        return make(node);
    }
    
    function getAttributes(el){
        var attr = {},
            nodeAttr, len, i;
            
        if (el){
            nodeAttr = el.attributes;
            for (i = 0, len = nodeAttr.length; i<len; i++){
                attr[nodeAttr[i].name] = nodeAttr[i].value;
            }
        }
        return attr;
    }
    
    function isArray(obj){
        return Array.isArray(obj);
    }

    function isArrayLike(obj){
        return obj && typeof obj === 'object' && typeof obj.length === 'number';
    }
    
    function isElement(node){
        return node instanceof Element;
    }
    
    function isNodeList(node){
        return node instanceof NodeList;
    }
    
    // Returns true for both a Pablo instance and its API function
    function isPablo(node){
        return !!(node && 
            // See extensions/functional.js for example usage of node.collection
            (node instanceof PabloNode || node.collection instanceof PabloNode)
        );
    }
    
    function canBeWrapped(node){
        return isPablo(node) ||
            isElement(node) ||
            isNodeList(node) ||
            isArray(node) ||
            isArrayLike(node);
    }
    
    function isSvg(node){
        return node.namespaceURI == Pablo.svgns;
    }
    
    // Return node if a PabloNode, otherwise create one
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
            el = typeof node === 'string' ?
                make(node) : toElement(node);

            // Is an element, but is not found in the node list
            if (isElement(el) && elements.indexOf(el) === -1){
                Array.prototype[prepend ? 'unshift' : 'push'].call(elements, el);
            }
            return;
        }

        toPush.forEach(function(el){
            addElementIfUnique(el, elements);
        });
    }
    
    
    /////
    
    
    // ELEMENT API
    
    function PabloNode(node, attr){
        this.push(node);
            
        // Apply attributes if elements have been added
        if (attr){
            this.attr(attr);
        }
    }
    
    // Node prototype
    pabloNodeApi = PabloNode.prototype = [];

    extend(pabloNodeApi, {
        collection: null,
        constructor: PabloNode,
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
        
        slice: function(from, to){
            return Pablo(Array.prototype.slice.call(this, from, to));
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
            var nextSiblings = Pablo();
            
            this.each(function(el){
                nextSiblings.push(el.nextSibling);
            });
            return nextSiblings;
        },

        prevSibling: function(){
            var nextSiblings = Pablo();
            
            this.each(function(el){
                nextSiblings.push(el.previousSibling);
            });
            return nextSiblings;
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
        
        find: function(selector){
            var found = Pablo();
            
            this.each(function(el){
                toArray(el.querySelectorAll(selector)).forEach(function(target){
                    found.push(target);
                });
            });
            return found;
        },


        /////


        // MANIPULATE
        
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
        
        child: function(node, attr){
            return toPablo(node, attr || {}).appendTo(this);
        },

        append: function(node, attr){
            this.each(function(el){
                toPablo(node, attr || {}).each(function(child){
                    el.appendChild(child);
                });
            });
            return this;
        },
        
        appendTo: function(node){
            toPablo(node).append(this);
            return this;
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
        
        prependTo: function(node){
            toPablo(node).prepend(this);
            return this;
        },
        
        // Create SVG root wrapper
        // TODO: if no attr passed, then return closest parent root to this element?
        root: function(attr){
            attr = extend(attr, {version: Pablo.svgVersion});
            return this.svg(attr);
        },
        
        clone: function(deep){
            deep = deep || false;
            return Pablo(
                this.map(function(el){
                    return el.cloneNode(deep);
                })
            );
        },
        
        // TODO: should this return a new collection? i.e. not push to `this`?
        duplicate: function(repeats){
            var duplicates = Pablo();
            repeats || (repeats = 1);
            
            while (repeats --){
                duplicates.push(this.clone(true).get(0));
            }
            this.after(duplicates);
            return duplicates.unshift(this);
        },
        
        attr: function(attr){
            if (typeof attr === 'undefined'){
                return getAttributes(this.get(0));
            }

            if (this.size()){
                if (typeof attr === 'string'){
                    return this.get(0).getAttribute(attr);
                }
                
                this.each(function(el, i){
                    var pabloNode, prop, val;
                    
                    for (prop in attr){
                        if (attr.hasOwnProperty(prop)){
                            val = attr[prop];
                            
                            if (typeof val === 'function'){
                                val = val.call(this, el, i);
                            }
                        
                            switch (prop){
                                case '_content':
                                (pabloNode || (pabloNode = Pablo(el)))
                                    .content(val);
                                continue;
                            
                                case '_children':
                                (pabloNode || (pabloNode = Pablo(el)))
                                    .child(val);
                                continue;
                            
                                case '_link':
                                (pabloNode || (pabloNode = Pablo(el)))
                                    .link(val);
                                continue;
                            }
                            el.setAttributeNS(null, prop, val);
                        }
                    }
                });
            }
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
            // Get first element's textContent
            if (typeof text === 'undefined'){
                return this.get(0).textContent;
            }
            
            // Set every element's textContent
            return this.each(function(el){
                el.textContent = text;
            });
        },

        css: function(styles){
            if (typeof styles === 'string'){
                // return document.defaultView.getComputedStyle(this.get(0), null).getPropertyValue(styles);
                return this.get(0).style.getPropertyValue(styles);
            }

            return this.each(function(el){
                var style = el.style,
                    prop;
                
                for (prop in styles){
                    if (styles.hasOwnProperty(prop)){
                        style.setProperty(prop, styles[prop], '');
                    }
                }
            });
        },


        /////


        // DOM EVENTS
        
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

    
    // Pablo Node API Aliases
    extend(pabloNodeApi, {
        //_  : pabloNodeApi.append,
        add: pabloNodeApi.push
    });


    /////

    
    // SVG element shortcut methods
    'a altGlyph altGlyphDef altGlyphItem animate animateColor animateMotion animateTransform circle clipPath color-profile cursor defs desc ellipse feBlend feColorMatrix feComponentTransfer feComposite feConvolveMatrix feDiffuseLighting feDisplacementMap feDistantLight feFlood feFuncA feFuncB feFuncG feFuncR feGaussianBlur feImage feMerge feMergeNode feMorphology feOffset fePointLight feSpecularLighting feSpotLight feTile feTurbulence filter font font-face font-face-format font-face-name font-face-src font-face-uri foreignObject g glyph glyphRef hkern image line linearGradient marker mask metadata missing-glyph mpath path pattern polygon polyline radialGradient rect script set stop style svg switch symbol text textPath title tref tspan use view vkern'.split(' ')
        .forEach(function(nodeName){
            var methodName = hyphenatedToCamelCase(nodeName);
            
            Pablo[methodName] = function(attr){
                return Pablo(nodeName, attr || {});
            };
            pabloNodeApi[methodName] = function(attr){
                return this.child(nodeName, attr || {});
            };
        });
    
    
    /////
    
    
    // PABLO API
    
    // Select existing nodes in the document
    function selectPablo(selector, context){
        // Valid selector
        if (typeof selector === 'string' && selector){
            return Pablo((context || document).querySelectorAll(selector));
        }
        // Return empty Pablo collection
        return createPablo();
    }


    // Create Pablo: return a PabloNode instance
    function createPablo(node, attr){
        return new PabloNode(node, attr);
    }

    
    // **
    

    // Pablo main function
    function Pablo(node, attr){
        if (attr || Pablo.canBeWrapped(node)){
            return Pablo.create(node, attr);
        }
        else {
            return Pablo.select(node);
        }
    }
    
    // Pablo methods
    pabloApi = {
        v: '0.2.0',
        isSupported: true,
        svgns: svgns,
        xlinkns: xlinkns,
        svgVersion: svgVersion,
        isPablo: isPablo,
        isElement: isElement,
        isNodeList: isNodeList,
        isSvg: isSvg,
        extend: extend,
        fn: pabloNodeApi,
        Node: PabloNode,
        create: createPablo,
        select: selectPablo,
        toArray: toArray,
        getAttributes: getAttributes,
        canBeWrapped: canBeWrapped
    };
    
    return extend(Pablo, pabloApi, true);
}(window.document, window.Array, window.JSON, window.Element, window.NodeList));
