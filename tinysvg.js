/*
    // TinySVG
    // by Premasagar Rose, Dharmafly
    // https://github.com/dharmafly/tinysvg
    
    
    // Example:
    var svg = tinySvg.create(document.body, 400, 400);
    
    tinySvg
        .draw(svg, 'line', {x1:10, y1:10, x2:200, y2:350, stroke:'blue', 'stroke-width':20})
        .draw(svg, 'circle', {cx:50, cy:50, r:30, 'fill':'#f00'});
        

    // MIT license: http://opensource.org/licenses/mit-license.php
*/
var tinySvg = {
    // NOTE: Creating the <svg> element this way allows it to render on iPad
    // et al, whereas including the <svg> element directly in the HTML document
    // does not. Inspired by http://keith-wood.name/svg.html
    create: function(htmlContainerElem, width, height){
        var rootElem = this.elem('svg'),
            attr = {version:'1.1'};
        
        if (htmlContainerElem){
            htmlContainerElem.appendChild(rootElem);
        }
        if (width && height){
            this.extend(attr, {width:width, height:height});
        }
        this.attr(rootElem, attr);
        
        return rootElem;
    },
    
    // e.g. elem('circle')
    elem: function(nodeName){
        return document.createElementNS('http://www.w3.org/2000/svg', nodeName);
    },

    empty: function(elem){
        if (elem){
            while (elem.firstChild) {
                elem.removeChild(elem.firstChild);
            }
        }
        return this;
    },
    
    extend: function(dest, src){
        var prop;
        
        for (prop in src){
            if (src.hasOwnProperty(prop)){
                dest[prop] = src[prop];
            }
        }
        return dest;
    },
    
    attr: function(elem, attr){
        var prop;
        if (attr){
            for (prop in attr){
                if (attr.hasOwnProperty(prop)){
                    elem.setAttribute(prop, attr[prop]);
                }
            }
        }
        return this;
    },
    
    draw: function(parent, nodeName, attr){
        var child = this.elem(nodeName);
        parent.appendChild(child);
        return this.attr(child, attr);
    }
};