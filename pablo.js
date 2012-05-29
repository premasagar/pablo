/*
    Pablo <https://github.com/dharmafly/pablo>

    by Premasagar Rose <http://premasagar.com>,
        Dharmafly <http://dharmafly.com>

    MIT license: http://opensource.org/licenses/mit-license.php
*/
var pablo = (function(document){
    var svgns = 'http://www.w3.org/2000/svg',
        xlinkns = 'http://www.w3.org/1999/xlink,'
        svgVersion = 1.1;
    
    function Pablo(el){
        this.el = el;
    }
    
    function make(elementName){
        return new Pablo(document.createElementNS(svgns, elementName));
    }

    function empty(el){
        while (el.firstChild) {
            el.removeChild(el.firstChild);
        }
        return el;
    }

    function extend(dest, src){
        var prop;
        for (prop in src){
            if (src.hasOwnProperty(prop)){
                dest[prop] = src[prop];
            }
        }
        return dest;
    }
    
    // Modified from http://diveintohtml5.org/everything.html#svg
    function isSupported(){
        return !!(document.createElementNS && make('svg').el.createSVGRect);
    }

    /////

    Pablo.prototype = {
        // Create a new element, unattached from any container
        make: function(elementName, attr){
            return make(elementName).attr(attr);
        },
        
        // Add a new element to the container and return the parent
        // https://developer.mozilla.org/en/SVG/Element
        _: function(elementName, attr){
            var child = this.make(elementName, attr);
            this.el.appendChild(child.el);
            return this;
        },
        
        // Add a new element to the container and return the child
        add: function(elementName, attr){
            var child = this.make(elementName, attr);
            this.el.appendChild(child.el);
            return child;
        },
        
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
    
        // https://developer.mozilla.org/en/CSS/CSS_Reference
        style: function(css){
            var styleElem = this.add('style').el;
            styleElem.textContent = css;
            return this;
        },
    
        empty: function(){
            empty(this.el);
            return this;
        },
    
        appendTo: function(parent){
            (parent instanceof Pablo ? parent.el : parent).appendChild(this.el);
            return this;
        }
    };

    /////

    function pablo(htmlContainer){
        var root = make('svg').attr({version: svgVersion});
        
        if (typeof htmlContainer === 'string'){
            htmlContainer = document.getElementById(htmlContainer);
        }
        if (typeof htmlContainer === 'object'){
            root.appendTo(empty(htmlContainer));
        }
        return root;
    }

    return extend(pablo, {
        svgns: svgns,
        xlinkns: xlinkns,
        svgVersion: svgVersion,
        make: make,
        isSupported: isSupported()
    });
}(document));