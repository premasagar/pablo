/*
    Pablo <https://github.com/dharmafly/pablo>

    by Premasagar Rose <http://premasagar.com>,
       Dharmafly <http://dharmafly.com>

    MIT license: http://opensource.org/licenses/mit-license.php
*/




var Pablo = (function(document, Array, JSON, Element){
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

    function empty(el){
        while (el && el.firstChild) {
            el.removeChild(el.firstChild);
        }
        return el;
    }
    
    function extend(target/*, any number of source objects*/){
        var i = 1,
            len = arguments.length,
            withPrototype = arguments[len-1] === true,
            obj, prop;
        
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
    
    function getElement(node){
        if (isElement(node)){
            return node;
        }
        if (isPablo(node)){
            return node.el[0];
        }
        if (typeof node === 'string'){
            return document.querySelector(node); // TODO: use querySelectorAll?
        }
        return null;
    }
    
    function toElement(node){
        return getElement(node) || make(node);
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
        var el = makeOrFindElement(node, attr);
        if (isUniqueElement(el, elements)){
            elements.push(el);
        }
    }
    
    
    /////
    
    
    // ELEMENT API
    
    function PabloNode(node, attr){
        var el,
            thisNode = this,
            // Create elements array
            elements = this.el = [];
            
        if (isArrayLike(node)){
            // Resolve the elements and add to elements array
            toArray(node).forEach(function(node){
                addUniqueElementToArray(node, attr, elements);
            });
        }
        
        else {
            addUniqueElementToArray(node, attr, elements);
        }
        
        // Apply attributes
        if (attr){
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
        
        // Add new node(s) to the collection; accepts arrays or nodeLists
        push: function(node, attr){
            var elements = this.el;
            
            // Resolve request as an array of elements and add to the collection
            Pablo(node, attr).el
                .forEach(function(node){
                    addUniqueElementToArray(node, attr, elements);
                });
            
            return this;
        },
        
        slice: function(from, to){
            return Pablo(this.el.slice(from, to));
        },
        
        each: function(fn){
            this.el.forEach(function(el, i, els){
                fn.call(el, el, i, els);
            });
            return this;
        },
        
        map: function(fn){
            this.el.map(function(el, i, els){
                fn.call(el, el, i, els);
            });
            return this;
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
        },
        
        toString: function(){
            return this.el.map(function(el){
                var str = el.nodeName.toLowerCase();
                
                if (el.attributes.length && JSON && JSON.stringify){
                    str += ':' + JSON.stringify(getAttributes(el));
                }
                return str;
            }).join(', ');
        }
    };
    
    
    // Aliases
    extend(pabloNodeApi, {
        _  : pabloNodeApi.append,
        add: pabloNodeApi.push
    });
    
    // Array methods
    /*
    Object.getOwnPropertyNames(Array.prototype)
        .forEach(function(methodName){
            pabloNodeApi[methodName] = function(){
                return Array.prototype[methodName].apply(this.elements, arguments);
            }
        });
    */
    
    
    /////
    
    
    // PABLO API
    
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
        var thisNode = new PabloNode(node, attr),
            api = extend(
                function(node, attr){
                    thisNode.append(node, attr);
                    return api;
                },
                thisNode,
                {_pablo:thisNode},
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
        
        root: function(){
            return Pablo('svg', {version:svgVersion});
        },
        
        // Whether to use the function API (default) or the object API
        functionApi: function(yes){
            createPablo = (yes !== false) ? createPabloFn : createPabloObj;
            return this;
        }
    };
    
    return extend(Pablo, pabloApi, true);
}(window.document, window.Array, window.JSON, window.Element));








////////////////////


var xpablo = (function(document, Array, JSON){
    var svgns = 'http://www.w3.org/2000/svg',
        xlinkns = 'http://www.w3.org/1999/xlink',
        svgVersion = 1.1,
        pablo, pabloFn;
    
    function make(elementName){
        return document.createElementNS(svgns, elementName);
    }
    
    function isSupported(){
        return !!(
            document.querySelectorAll &&
            Array.prototype.forEach &&
            Array.isArray &&
            JSON && JSON.stringify &&
            document.createElementNS &&
            // See http://diveintohtml5.org/everything.html#svg
            make('svg').createSVGRect
        );
    }

    function empty(el){
        while (el && el.firstChild) {
            el.removeChild(el.firstChild);
        }
        return el;
    }

    function extend(dest, src, withPrototype){
        var prop;
        dest = dest || {};
        for (prop in src){
            if (withPrototype || src.hasOwnProperty(prop)){
                dest[prop] = src[prop];
            }
        }
        return dest;
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

    function getElement(node){
        return typeof node === 'string' ?
            document.querySelector(node) :
            isPablo(node) ? node.el : node;
    }
    
    function toPablo(node, attr){
        return isPablo(node) ?
            node :
            pablo(node, attr || {});
    }
    
    function appendNode(node, attr, parentNode){
        node = toPablo(node, attr);
        parentNode = toPablo(parentNode);
        if (node.el && parentNode.el){
            parentNode.el.appendChild(node.el);
        }
        return node;
    }
    
    function isSvg(node){
        return node.namespaceURI == svgns;
    }
    
    function isPablo(node){
        return typeof node === 'function' && node.pablo === true;
    }

    function pabloList(nodes){
        var result = [],
            i = 0;
        
        for(; i < nodes.length; i++) {
            if (isSvg(nodes[i])){
                result.push(pablo(nodes[i]));
            }
        }
        return result;
    }

    // return array of Pablo wrapped elements, according to the query selector
    // TODO: return Pablo-wrapped array (e.g. to allow further filtering)
    function queryAll(selector, parentNode){
        var nodes = (parentNode || document).querySelectorAll(selector),
            result = [],
            i = 0;
        
        for(; i < nodes.length; i++) {
          result.push(nodes[i]);
        }
        return result;
    }

    function queryAllNS(selector, parentNode){
        return pabloList(queryAll(selector, parentNode));
    }


    /////


    // Pablo node wrapper
    function Pablo(node, attr){
        this.el = typeof node === 'string' ?
            make(node) :
            isPablo(node) ? node.el : node || null;
            
        this.attr(attr);
    }

    // Pablo prototype
    pabloFn = Pablo.prototype;

    extend(pabloFn, {
        pablo: true,
        
        // https://developer.mozilla.org/en/SVG/Attribute
        attr: function(attr){
            var thisNode = this,
                prop, i, len, nodeAttr;
            
            if (!attr){
                attr = {};
                nodeAttr = this.el.attributes;
                for (i=0, len=nodeAttr.length; i<len; i++){
                    attr[nodeAttr[i].name] = nodeAttr[i].value;
                }
                return attr;
            }
            
            for (prop in attr){
                if (attr.hasOwnProperty(prop)){
                    var val = attr[prop];
                    
                    switch (prop){
                        case '_content':
                        this.content(val);
                        continue;
                        
                        case '_children':
                        thisNode.child(val);
                        continue;
                        
                        case '_link':
                        thisNode.link(val);
                        continue;
                    }
                    this.el.setAttributeNS(null, prop, val);
                }
            }
            return this;
        },
        
        link: function(href){
            this.el.setAttributeNS(xlinkns, 'xlink:href', href);
            return this;
        },
        
        css: function(styleObj){
            var nodeStyle = this.el.style,
                prop;
            
            if (styleObj){
                for (prop in styleObj){
                    if (styleObj.hasOwnProperty(prop)){
                        nodeStyle.setProperty(prop, styleObj[prop], '');
                    }
                }
            }
            return this;
        },
        
        on: function(eventType, handler, bubbles){
            this.el.addEventListener(eventType, handler, bubbles);
            return this;
        },
        
        off: function(eventType, handler, bubbles){
            this.el.removeEventListener(eventType, handler, bubbles);
            return this;
        },
    
        child: function(node, attr){
            var _this = this;
            
            if (Array.isArray(node)){
                node.forEach(function(node){
                    _this.child(node, attr);
                });
            }
            else {
                node = appendNode(node, attr, this.el);
            }
            return node;
        },
    
        append: function(node, attr){
            this.child(node, attr);
            return this;
        },
        
        insertBefore: function(node, attr){
            node = toPablo(node, attr);
            if (this.el && node.el && this.el.parentNode){
                this.el.parentNode.insertBefore(node.el, this.el);
            }
            return this;
        },
        
        prepend: function(node, attr){
            var _this = this,
                first = this.el.firstChild;
            
            if (Array.isArray(node)){
                node.forEach(function(node){
                    _this.prepend(node, attr);
                });
            }
            else {
                this.el.insertBefore(toPablo(node, attr).el, first);
            }
            return node;
        },
    
        appendTo: function(node, attr){
            if (typeof node === 'string'){
                if (attr){
                    node = pablo(node, attr);
                }
                node = queryAll(node)[0];
            }
            if (node instanceof Pablo){
                node.append(this);
            }
            else if (node && typeof node.appendChild === 'function'){
                node.appendChild(this.el);
            }
            else if (node && typeof node.append === 'function'){
                node.append(this.el);
            }
            return this;
        },
    
        content: function(text){
            this.el.textContent = text;
            return this;
        },
    
        empty: function(){
            empty(this.el);
            return this;
        },
    
        find: function(selector){
            return queryAllNS(selector, this.el);
        },
    
        parent: function(){
            return pablo(this.el.parentNode);
        },
    
        // TODO: allow selector argument to filter the results
        children: function(){
            return pabloList(this.el.childNodes);
        },
        
        // https://developer.mozilla.org/en/CSS/CSS_Reference
        styles: function(css){
            !Array.isArray(css) || (css = css.join(''));
            return this('style', {_content:css});
        },

        toString: function(){
            return this.el.nodeName + ': ' + JSON.stringify(this.attr());
        }

        // innersvg, e.g. foo('<circle>')
        // helper: function(methodName, nodeName, defaultAttr){}
        // prepend
    
    });


    // Aliases
    extend(pabloFn, {
        _: pabloFn.append
    });


    // Public API
    pablo = extend(
        function(node, attr){
            var wrappedNode;
            
            // e.g. pablo('circle') to return all circles
            if (typeof node === 'string' && !attr){
                return queryAllNS(node);
            }
            // e.g. pablo('circle', {r:100}) to create a circle
            wrappedNode = new Pablo(node, attr);
            
            // functional
            // e.g. pablo('g')('circle', {r:100})
            var self = extend(function(node, attr){
                // selector passes
                if (typeof node === 'string' && !attr){
                    return wrappedNode.find(node);
                }
                // append child
                pabloFn.child.call(wrappedNode, node, attr);
                return self;
            }, wrappedNode, true);
            
            return self;
        },
    
        {
            v: '0.0.1',
            svgns: svgns,
            xlinkns: xlinkns,
            svgVersion: svgVersion,
            fn: pabloFn,
            isSupported: isSupported,
            isSvg: isSvg,
            isPablo: isPablo,
            list: pabloList,
        
            // Create SVG root wrapper
            root: function(parentNode, attr){
                attr = extend(attr, {version:1.1});
                return toPablo(getElement(parentNode))
                    .empty()
                    .svg(attr);
            }
        }
    );
    
    // Shortcut methods for all SVG elements
    'a altGlyph altGlyphDef altGlyphItem animate animateColor animateMotion animateTransform circle clipPath color-profile cursor defs desc ellipse feBlend feColorMatrix feComponentTransfer feComposite feConvolveMatrix feDiffuseLighting feDisplacementMap feDistantLight feFlood feFuncA feFuncB feFuncG feFuncR feGaussianBlur feImage feMerge feMergeNode feMorphology feOffset fePointLight feSpecularLighting feSpotLight feTile feTurbulence filter font font-face font-face-format font-face-name font-face-src font-face-uri foreignObject g glyph glyphRef hkern image line linearGradient marker mask metadata missing-glyph mpath path pattern polygon polyline radialGradient rect script set stop style svg switch symbol text textPath title tref tspan use view vkern'
        .split(' ').forEach(function(nodeName){
            var methodName = hyphenatedToCamelCase(nodeName);
            
            pablo[methodName] = function(attr){
                return pablo(nodeName, attr || {});
            };
            pabloFn[methodName] = function(attr){
                return this.child(nodeName, attr || {});
            }
        });
        
        return pablo;
    
}(window.document, window.Array, window.JSON));



/////////



/*



    var paper = pablo('svg'); // pablo.root(); pablo.create(); pablo()
    
    pablo('circle', {})
        .appendTo(paper);

    paper.circle({});
    
    pablo.circle({}).appendTo(paper)
    
    
    
    /////
    
    
    
    
    
    
    var paper = pablo();
    var c = paper.circle().line();
    var c = pablo.circle().appendTo(paper);
    c.line().line();
    
    jQuery(paper).append('<div/>')
    
    
    paper
        .circle({})
            .get().click(fn)
            .parent()
        
        .line({})
            .get().click(fn).hover()
            .parent()
        
        
    paper.append('circle', {})
         .appendChild('circle', {});
         
         
    paper.circle().parent().line().parent()
    paper.circle()
    paper.line()
    
    
    
    
    var c = paper.circle();
    c.click().line()
         
    paper.circle({}, true)
    
    paper.circle({}, function(circle){
        circle.click().line().line()
    })
    
    paper.circle class: 'red', (circle) ->
        circle.line (line) ->
            line.circle()
    .line (line) ->
         line
        
    
    pablo.circle({}).appendTo(paper).click()
         
    
    paper.circle().appendCircle()
    
        
    paper.append(
        pablo.circle(),
        
    )
*/