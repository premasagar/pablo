/*
    Pablo <https://github.com/dharmafly/pablo>

    by Premasagar Rose <http://premasagar.com>,
        Dharmafly <http://dharmafly.com>

    MIT license: http://opensource.org/licenses/mit-license.php
*/
var pablo = (function(document){
    var svgns = 'http://www.w3.org/2000/svg',
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
    
    // See http://diveintohtml5.org/everything.html#svg
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
            return this.append(this.make(elementName, attr));
        },
        
        // Add a new element to the container and return the child
        add: function(elementName, attr){
            return this.make(elementName, attr).appendTo(this);
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
            var style = this.add('style');
            style.el.textContent = css;
            return this;
        },
    
        empty: function(){
            empty(this.el);
            return this;
        },
    
        append: function(child){
            this.el.appendChild(child instanceof Pablo ? child.el : child);
            return this;
        },
    
        appendTo: function(parent){
            (parent instanceof Pablo ? parent.el : parent).appendChild(this.el);
            return this;
        },
    
        draw: function(nodeName, attr){
            this.make(nodeName, attr);
            return this;
        }
    };

    /////

    function pablo(htmlContainer, width, height){
        var root = make('svg'),
            attr = {version: svgVersion};
        
        if (typeof htmlContainer === 'string'){
            htmlContainer = document.getElementById(htmlContainer);
        }
        if (typeof htmlContainer === 'object'){
            root.appendTo(empty(htmlContainer));
        }
        if (width && height){
            extend(attr, {width:width, height:height});
        }
        return root.attr(attr);
    }

    return extend(pablo, {
        svgns: svgns,
        svgVersion: svgVersion,
        make: make,
        isSupported: isSupported()
    });
}(document));