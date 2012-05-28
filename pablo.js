/*
    Pablo <https://github.com/dharmafly/pablo>

    by Premasagar Rose <http://premasagar.com>,
        Dharmafly <http://dharmafly.com>

    MIT license: http://opensource.org/licenses/mit-license.php
*/
var pablo = (function(document){
    function create(elementName){
        return new WrappedSvg(document.createElementNS('http://www.w3.org/2000/svg', elementName));
    }

    function empty(elem){
        while (elem.firstChild) {
            elem.removeChild(elem.firstChild);
        }
        return elem;
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
        return !!(document.createElementNS && create('svg').elem.createSVGRect);
    }

    /////

    function WrappedSvg(elem){
        this.elem = elem;
    }

    WrappedSvg.prototype = {
        // https://developer.mozilla.org/en/SVG/Element
        create: function(elementName, attr){
            return create(elementName)
                .attr(attr)
                .appendTo(this);
        },
    
        // https://developer.mozilla.org/en/SVG/Attribute
        attr: function(attr){
            var prop;
            if (attr){
                for (prop in attr){
                    if (attr.hasOwnProperty(prop)){
                        this.elem.setAttributeNS(null, prop, attr[prop]);
                    }
                }
            }
            return this;
        },
    
        // https://developer.mozilla.org/en/CSS/CSS_Reference
        style: function(css){
            this.create('style')
                .elem.textContent = css;
            return this;
        },
    
        empty: function(){
            empty(this.elem);
            return this;
        },
    
        append: function(child){
            this.elem.appendChild(child instanceof WrappedSvg ? child.elem : child);
            return this;
        },
    
        appendTo: function(parent){
            (parent instanceof WrappedSvg ? parent.elem : parent).appendChild(this.elem);
            return this;
        },
    
        draw: function(nodeName, attr){
            this.create(nodeName, attr);
            return this;
        }
    };

    /////

    function pablo(htmlContainer, width, height){
        var root = create('svg'),
            attr = {version:'1.1'};
        
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
        create: create,
        isSupported: isSupported()
    });
}(document));