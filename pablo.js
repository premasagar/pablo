/*
    Pablo <https://github.com/dharmafly/pablo>

    by Premasagar Rose <http://premasagar.com>,
        Dharmafly <http://dharmafly.com>

    MIT license: http://opensource.org/licenses/mit-license.php
*/

var pablo = (function(document, Array, JSON){
    var svgns = 'http://www.w3.org/2000/svg',
        xlinkns = 'http://www.w3.org/1999/xlink',
        svgVersion = 1.1,
        pablo, pabloFn;
    
    function make(elementName){
        return document.createElementNS(svgns, elementName);
    }
    
    // Modified from http://diveintohtml5.org/everything.html#svg
    function isSupported(){
        return !!(
            document.querySelectorAll &&
            Array.prototype.forEach &&
            Array.isArray &&
            JSON && JSON.stringify &&
            document.createElementNS &&
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
            extend(this.el.style, styleObj);
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
        
        prepend: function(node, attr){
            var _this = this,
                parentNode = this.el.previousSibling;
            
            if (Array.isArray(node)){
                node.forEach(function(node){
                    parentNode.insertBefore.child(node, attr);
                });
            }
            else {
                node = toPablo(node).appendTo(parent, attr);
                
                
                if (node.el){
                    appendNode(this, attr, node.el);
                }
            }
            return node;
            
            
            this.el.previousSibling(node.el);
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