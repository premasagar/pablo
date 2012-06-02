/*
    Pablo <https://github.com/dharmafly/pablo>

    by Premasagar Rose <http://premasagar.com>,
        Dharmafly <http://dharmafly.com>

    MIT license: http://opensource.org/licenses/mit-license.php
*/

var pablo = (function(document){
    var svgns = 'http://www.w3.org/2000/svg',
        xlinkns = 'http://www.w3.org/1999/xlink,',
        svgVersion = 1.1,
        pablo, pabloFn;
    
    function make(elementName){
        return document.createElementNS(svgns, elementName);
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
    
    // Modified from http://diveintohtml5.org/everything.html#svg
    function isSupported(){
        return !!(document.querySelectorAll && Array.prototype.forEach && document.createElementNS && make('svg').createSVGRect);
    }

    function getNode(node){
        return typeof node === 'string' ?
            document.querySelector(node) :
            node instanceof Pablo ? node.el : node;
    }

    function isSvg(node){
        return node.namespaceURI == svgns;
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



    // Pablo node wrapper

    function Pablo(node, attr){
        this.el = typeof node === 'string' ?
            make(node) :
            node instanceof Pablo ? node.el : node;
        this.attr(attr);
    }

    // Pablo prototype
    pabloFn = Pablo.prototype;

    extend(pabloFn, {
        // https://developer.mozilla.org/en/SVG/Attribute
        attr: function(attr){
            var prop;
            if (attr){
                for (prop in attr){
                    if (attr.hasOwnProperty(prop)){
                        this.el.setAttributeNS(null, prop, attr[prop]);
                    }
                }
            }
            return this;
        },
    
        child: function(node, attr){
            node = pablo(node, attr || {});
            if (node.el){
                this.el.appendChild(node.el);
            }
            return node;
        },
    
        append: function(node, attr){
            this.child(node, attr);
            return this;
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
    
        // https://developer.mozilla.org/en/CSS/CSS_Reference
        style: function(css){
            this.child('style').content(css);
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
    
        children: function(){
            return pabloList(this.el.childNodes);
        }

        // innersvg, e.g. foo('<circle>')
        // svg: function(){},
        
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
            // e.g. pablo('circle') to return all circles
            if (typeof node === 'string' && !attr){
                return queryAllNS(node);
            }
            // e.g. pablo('circle', {r:100}) to create a circle
            return new Pablo(node, attr);
        },
    
        {
            v: '0.0.1',
            svgns: svgns,
            xlinkns: xlinkns,
            svgVersion: svgVersion,
            fn: pabloFn,
            isSupported: isSupported,
            isSvg: isSvg,
            list: pabloList,
        
            // Create SVG root wrapper
            root: function(parentNode, attr){
                parentNode = empty(getNode(parentNode));
                attr = extend(attr, {version:1.1});
                return pablo.svg(attr).appendTo(parentNode);
            }
        }
    );
    
    'a altGlyph altGlyphDef altGlyphItem animate animateColor animateMotion animateTransform circle clipPath color-profile cursor defs desc ellipse feBlend feColorMatrix feComponentTransfer feComposite feConvolveMatrix feDiffuseLighting feDisplacementMap feDistantLight feFlood feFuncA feFuncB feFuncG feFuncR feGaussianBlur feImage feMerge feMergeNode feMorphology feOffset fePointLight feSpecularLighting feSpotLight feTile feTurbulence filter font font-face font-face-format font-face-name font-face-src font-face-uri foreignObject g glyph glyphRef hkern image line linearGradient marker mask metadata missing-glyph mpath path pattern polygon polyline radialGradient rect script set stop svg switch symbol text textPath title tref tspan use view vkern'
        .split(' ').forEach(function(nodeName){
            var methodName = hyphenatedToCamelCase(nodeName);
            
            pablo[methodName] = function(attr){
                return pablo(nodeName, attr || {});
            };
            pabloFn[methodName] = function(attr){
                return this.append(nodeName, attr || {});
            }
        });
        
        return pablo;
    
}(document));



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