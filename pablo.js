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
        vendorPrefixes = ['-moz-', '-webkit-', '-khtml-', '-o-', '-ms-'],
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
        if (isElement(node)){
            return node;
        }
        if (isPablo(node)){
            return node.el;
        }
        return make(node);
    }
    
    // Like toElement, but will favour making an element if there are attributes passed
    function makeOrFindElement(node, attr){
        // Already an element
        if (isElement(node)){
            return node;
        }
        // If there are attributes, then definitely make an element
        else if (attr) {
            return make(node);
        }
        // Try to find element(s) by selector; if not found, make new element
        return toElement(node);
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
    
    function isElement(node){
        return node instanceof Element;
    }
    
    function isNodeList(node){
        return node instanceof NodeList;
    }
    
    function isUniqueElement(node, elements){
        return isElement(node) && elements.indexOf(node) === -1;
    }
    
    // Returns true for both a Pablo instance and its API function
    function isPablo(node){
        return !!(node && 
            (node instanceof PabloNode || node._pablo instanceof PabloNode)
        );
    }
    
    function canBeWrapped(node){
        return isPablo(node) ||
            isElement(node) ||
            isNodeList(node) ||
            isArray(node);
    }
    
    function isSvg(node){
        return node.namespaceURI == Pablo.svgns;
    }
    
    // Return node if a PabloNode, otherwise create one
    function toPablo(node, attr){
        return isPablo(node) ?
            node : Pablo(node, attr);
    }
    
    function addUniqueElementToArray(node, attr, elements){
        var toPush, el;
        
        if (isPablo(node)){
            toPush = node.el;
        }
        else if (isArray(node)){
            toPush = node;
        }
        else if (isNodeList(node)){
            toPush = toArray(node);
        }
        else {
            el = makeOrFindElement(node, attr);
            if (isUniqueElement(el, elements)){
                elements.push(el);
            }
            return;
        }
        toPush.forEach(function(el){
            addUniqueElementToArray(el, attr, elements);
        });
    }
    
    
    /////
    
    
    // ELEMENT API
    
    function PabloNode(node, attr){
        var // Create elements array
            elements = this.el = [];
            
        // Add elements
        addUniqueElementToArray(node, attr, elements);
            
        // Apply attributes if elements have been added
        if (attr && elements.length){
            this.attr(attr);
        }
    }
    
    // Node prototype
    pabloNodeApi = PabloNode.prototype = {
        constructor: PabloNode,
        make: make,
        
        get: function(index){
            return typeof index === 'undefined' ?
                this.el : this.el[index];
        },
        
        eq: function(index){
            return index >= 0 ?
                // Return zero-indexed node
                Pablo(this.el[index]) :
                // Return node, counting backwards from end of elements array
                (index < -1 ? this.slice(index, index + 1) : this.slice(index));
        },
        
        size: function(){
            return this.el.length;
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
        
        // Add new node(s) to the collection; accepts arrays or nodeLists
        push: function(node, attr){
            var pabloNodeToAdd = Pablo(node, attr);
            
            addUniqueElementToArray(pabloNodeToAdd, attr, this.el);
            return this;
        },
        
        // Remove node from end of the collection
        pop: function(node, attr){
            return this.el.pop();
        },
        
        shift: function(){
            return this.el.shift();
        },
        
        // Add new node(s) to the collection; accepts arrays or nodeLists
        // TODO: don't replace `this.el`, e.g. `el` array may be cached
        unshift: function(node, attr){
            var newNode = Pablo(node, attr).el[0],
                existingElements = this.el.slice();
                
            this.el = [newNode].concat(existingElements);
            return this;
        },
        
        slice: function(from, to){
            return Pablo(this.el.slice(from, to));
        },
        
        each: function(fn){
            this.el.forEach(fn, this);
            return this;
        },
        
        map: function(fn){
            return Pablo(
                this.el.map(fn, this)
            );
        },
        
        filter: function(fn){
            return Pablo(
                this.el.filter(fn, this)
            );
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
        
        child: function(node, attr){
            return toPablo(node, attr || {}).appendTo(this);
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
                duplicates.el.push(this.clone(true).el[0]);
            }
            this.after(duplicates);
            return duplicates.unshift(this);
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
        
        attr: function(attr){
            if (!attr){
                return getAttributes(this.el[0]);
            }
            
            return this.each(function(el, i){
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
        },
        
        removeAttr: function (attr) {
            this.each(function (el, i){
                el.removeAttribute(attr);
            })
        },

        link: function(href){
            return this.each(function(el){
                el.setAttributeNS(xlinkns, 'xlink:href', href);
            });
        },
        
        content: function(text){
            // Get first element's textContent
            if (typeof text === 'undefined'){
                return this.el[0].textContent;
            }
            
            // Set every element's textContent
            return this.each(function(el){
                el.textContent = text;
            });
        },
        
        css: function(newStyles){
            return this.each(function(el){
                var style = el.style,
                    prop;
                
                for (prop in newStyles){
                    if (newStyles.hasOwnProperty(prop)){
                        style.setProperty(prop, newStyles[prop], '');
                    }
                }
            });
        },
        
        // Add CSS styles with browser vendor prefixes
        // e.g. cssPrefix({transform:'rotate(45deg)'}) will be prefixed with -moz, -webkit, -o, -ms and -khtml
        cssPrefix: function(newStyles){
            var prop;
            
            for (prop in newStyles){
                if (newStyles.hasOwnProperty(prop)){
                    vendorPrefixes.forEach(function(prefix){
                        newStyles[prefix + prop] = newStyles[prop];
                    });
                }
            }
            return this.css(newStyles);
        },
        
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
        },
        
        // Create SVG root wrapper
        root: function(attr){
            extend(attr, {version: Pablo.svgVersion});
            return this.svg(attr);
        }
    };
    
    
    // Element API Aliases
    extend(pabloNodeApi, {
        _  : pabloNodeApi.append,
        add: pabloNodeApi.push
    });
    
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
    
    // Console.log response
    function toString(){
        if (!this.el.length){
            return '()';
        }
        
        return '(' + this.el.map(function(el){
            var str = '<' + el.nodeName.toLowerCase();
                
            if (el.attributes.length && JSON && JSON.stringify){
                str += ' ' + JSON.stringify(getAttributes(el))
                    .replace(/","/g, '", ')
                    .replace(/^{"|}$/g, '')
                    .replace(/":"/g, '="');
            }
            return str + '>';
        }).join(', ') + ')';
    }
    
    // Select existing nodes in the document
    function selectPablo(node){
        return Pablo(document.querySelectorAll(node));
    }
    
    // Create Pablo #1: return a PabloNode instance
    function createPabloObj(node, attr){
        return new PabloNode(node, attr);
    }
    
    // Create Pablo #2: return a function that wraps a PabloNode instance
    function createPabloFn(node, attr){
        var pabloNode = new PabloNode(node, attr),
            api = extend(
                function(node, attr){
                    if (attr || canBeWrapped(node)){
                        pabloNode.append(node, attr);
                        return api;
                    }
                    else {
                        return selectPablo(node);
                    }
                },
                pabloNode,
                {
                    _pablo: pabloNode,
                    toString: toString // Used for console logging
                },
                true
            );
        return api;
    }
    
    // Create Pablo: use functional API by default; see `functionApi` method
    createPablo = createPabloFn;
    
    // **
    
    // Pablo main function
    function Pablo(node, attr){
        if (attr || canBeWrapped(node)){
            return createPablo(node, attr);
        }
        else {
            return selectPablo(node);
        }
    }
    
    // Pablo methods
    pabloApi = {
        v: '0.0.1',
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
        
        // Whether to use the function API (default) or the object API
        functionApi: function(yes){
            createPablo = (yes !== false) ? createPabloFn : createPabloObj;
            return this;
        }
    };
    
    return extend(Pablo, pabloApi, true);
}(window.document, window.Array, window.JSON, window.Element, window.NodeList));
