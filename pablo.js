/*
    Pablo <https://github.com/dharmafly/pablo>

    by Premasagar Rose <http://premasagar.com>,
       Dharmafly <http://dharmafly.com>

    MIT license: http://opensource.org/licenses/mit-license.php
*/




var Pablo = (function(document, Array, JSON, Element){
    'use strict';
    
    var svgns = 'http://www.w3.org/2000/svg',
        xlinkns = 'http://www.w3.org/1999/xlink',
        svgVersion = 1.1,
        pabloApi, pabloNodeApi, createPablo;


    // TEST BROWSER COMPATIBILITY
    
    function make(elementName){
        return typeof elementName === 'string' &&
            document.createElementNS(svgns, elementName) ||
            null;
    }
    
    function isSupported(){
        return !!(
            document && Array && JSON && Element &&
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
    
    function isArrayLike(obj){
        return obj && typeof obj === 'object' && typeof obj.length === 'number';
    }
    
    function toArray(obj){
        return Array.prototype.slice.call(obj);
    }
    
    function isElement(node){
        return node instanceof Element;
    }
    
    function isUniqueElement(node, elements){
        return isElement(node) && elements.indexOf(node) === -1;
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
        return attr ?
            // if there are attributes, then definitely make an element
            make(node) :
            // if not, then try to find the element(s); if not found, make one
            toElement(node);
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
    
    // Return node if a PabloNode, otherwise create one
    function toPablo(node, attr){
        return Pablo.isPablo(node) ?
            node : Pablo(node, attr);
    }
    
    // Returns true for both a Pablo instance and its API function
    function isPablo(node){
        return !!(node && 
            (node instanceof PabloNode || node._pablo instanceof PabloNode)
        );
    }
    
    function isSvg(node){
        return node.namespaceURI == svgns;
    }
    
    function addUniqueElementToArray(node, attr, elements){
        var toPush, el;
        
        if (isPablo(node)){
            toPush = node.el;
        }
        else if (isArrayLike(node)){
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
                el.parentNode.removeChild(el);
            });
        },
        
        // Add new node(s) to the collection; accepts arrays or nodeLists
        push: function(node, attr){
            var pabloNodeToPush = Pablo(node, attr);
            
            addUniqueElementToArray(pabloNodeToPush, attr, this.el);
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
        
        append: function(node, attr){
            this.each(function(el){
                toPablo(node, attr).each(function(child){
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
            return toPablo(node, attr).appendTo(this);
        },
        
        // TODO
        filter: function(selector){
            
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
            var thisNode;
            
            if (!attr){
                return getAttributes(this.el[0]);
            }
            
            thisNode = this;
            return this.each(function(el){
                var pabloNode, prop, val;
                
                for (prop in attr){
                    if (attr.hasOwnProperty(prop)){
                        val = attr[prop];
                    
                        switch (prop){
                            case '_content':
                            (pabloNode || (pabloNode = pablo(el)))
                                .content(val);
                            continue;
                        
                            case '_children':
                            (pabloNode || (pabloNode = pablo(el)))
                                .child(val);
                            continue;
                        
                            case '_link':
                            (pabloNode || (pabloNode = pablo(el)))
                                .link(val);
                            continue;
                        }
                        el.setAttributeNS(null, prop, val);
                    }
                }
            });
        }
    };
    
    
    // Element API Aliases
    extend(pabloNodeApi, {
        _  : pabloNodeApi.append,
        add: pabloNodeApi.push
    });
    
    
    /////
    
    
    // PABLO API
    
    // Console.log response
    function toString(){
        if (!this.el.length){
            return '~';
        }
        
        return this.el.map(function(el){
            var str = '<' + el.nodeName.toLowerCase();
                
            if (el.attributes.length && JSON && JSON.stringify){
                str += ' ' + JSON.stringify(getAttributes(el))
                    .replace(/","/g, '", ')
                    .replace(/^{"|}$/g, '')
                    .replace(/":"/g, '="');
            }
            return str + '>';
        }).join(', ');
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
                    pabloNode.append(node, attr);
                    return api;
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
        if (attr ||
            Pablo.isPablo(node) ||
            isElement(node) ||
            isArrayLike(node)
        ){
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
        isSvg: isSvg,
        fn: pabloNodeApi,
        Node: PabloNode,
        
        // Create SVG root wrapper
        root: function(container, attr, dontEmpty){
            attr = extend(attr, {version: Pablo.svgVersion});
            return toPablo(container)
                .empty()
                .child('svg', attr);
        },
        
        // Whether to use the function API (default) or the object API
        functionApi: function(yes){
            createPablo = (yes !== false) ? createPabloFn : createPabloObj;
            return this;
        }
    };
    
    return extend(Pablo, pabloApi, true);
}(window.document, window.Array, window.JSON, window.Element));