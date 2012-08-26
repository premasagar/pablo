(function(Pablo){
    var vendorPrefixes = ['', '-moz-', '-webkit-', '-khtml-', '-o-', '-ms-'],
        pabloNodeApi = Pablo.Node.prototype;

    // Return CSS styles with browser vendor prefixes
    // e.g. cssPrefix({transform:'rotate(45deg)'}) will return the styles object, with additional properties containing CSS properties prefixed with the browser vendor prefixes - see vendorPrefixes
    // e.g. cssPrefix('transform', 'rotate(45deg)') will return a string sequence of prefixed CSS properties, each assigned the same value
    // e.g. cssPrefix('transform') will return a string sequence of CSS properties
    function cssPrefix(styles, value){
        var vendorPrefixes = Pablo.vendorPrefixes,
            prop, res, rule;
        
        if (typeof styles === 'object'){
            res = {};
            for (prop in styles){
                if (styles.hasOwnProperty(prop)){
                    vendorPrefixes.forEach(function(prefix){
                        res[prefix + prop] = styles[prop];
                    });
                }
            }
        }

        if (typeof styles === 'string'){
            prop = styles;

            // e.g. cssPrefix('transform', 'rotate(45deg)') -> 'transform:rotate(45deg);-webkit-transform:rotate(45deg);...'
            if (typeof value === 'string'){
                rule = prop + ':' + value + ';';
                res = vendorPrefixes.join(rule) + rule;
            }
            // e.g. cssPrefix('transform') -> 'transform,-webkit-transform,...'
            // useful for adding prefixed properties when setting active properties in a CSS transition
            else {
                res = vendorPrefixes.join(prop + ',') + prop;
            }
        }

        return res;
    }


    /////


    Pablo.extend(pabloNodeApi, {
        // Add CSS styles with browser vendor prefixes
            // e.g. cssPrefix({transform:'rotate(45deg)'}) will be prefixed with -moz, -webkit, -o, -ms and -khtml
            cssPrefix: function(styles){
                var vendorPrefixes = Pablo.vendorPrefixes,
                    prop, value, i, len;

                // Return the value of a CSS property, even if the property is vendor-prefixed
                // e.g. Pablo('circle').cssPrefix('transform') -> 'rotate(45deg)'
                // If the property was SET with cssPrefix, then GET the value with cssPrefix
                // TODO: remove from code?
                if (typeof styles === 'string'){
                    prop = styles;
                    for (i=0, len=vendorPrefixes.length; i<len; i++){
                        value = this.css(vendorPrefixes[i] + prop);
                        if (value){
                            break;
                        }
                    }
                    return value;
                }

                return this.css(cssPrefix(styles));
            }
    });


    ////////////////

    // Native element classLists not supported at all in IE9, and not supported for SVG elements in WebKit (e.g. Chrome 21)
    
    var supportsClassList = !!(document.createElementNS(Pablo.svgns, 'a').classList),
        containsClass, addClass, removeClass, toggleClass;

    // Browser supports native DOM element classLists
    if (supportsClassList) {
        Pablo.extend(pabloNodeApi, {
            addClass: function(className){
                return this.each(function(el){
                    el.classList.add(className);
                });
            },

            removeClass: function(className){
                return this.each(function(el){
                    el.classList.remove(className);
                });
            },

            toggleClass: function(className){
                return this.each(function(el){
                    el.classList.toggle(className);
                });
            },

            hasClass: function(className){
                return this.get(0).classList.contains(className);
            }
        });
    }

    // Browser doesn't support native classLists
    // For alternative implementations see https://developer.mozilla.org/media/uploads/demos/p/a/paulrouget/8bfba7f0b6c62d877a2b82dd5e10931e/hacksmozillaorg-achi_1334270447_demo_package/classList/classList.js - linked from https://hacks.mozilla.org/2010/01/classlist-in-firefox-3-6/ and https://gist.github.com/1319121
    else {
        Pablo.extend(pabloNodeApi, {
            hasClass: function(className){
                var classString = this.attr('class');

                // No existing classes
                if (!classString){
                    return false;
                }
                // className is already present
                return (new RegExp('\\b' + className + '\\b')).test(classString);
            },

            addClass: function(className){
                var classString;

                if (this.hasClass(className)){
                    return this;
                }
                classString = this.attr('class');
                classString = classString ? (classString + ' ') : '';
                return this.attr({'class': classString + className});
            },

            removeClass: function(className){
                var classString;

                if (!this.hasClass(className)){
                    return this;
                }
                classString = this.attr('class') || '';
                classString = classString.replace(new RegExp('(^|\\s)' + className + '(\\s|$)'), '$2');
                return this.attr({'class': classString});
            },

            toggleClass: function(className){
                return this.each(function(el){
                    if (this.hasClass(className)){
                        this.removeClass(className);
                    }
                    else {
                        this.addClass(className);
                    }
                });
            }
        });
    }


    /////


    Pablo.extend(Pablo, {
        // e.g. Pablo('svg').style().content('#foo{' + Pablo.cssPrefix('transform', 'rotate(45deg)') + '}');
        // e.g. myElement.css({'transition-property': Pablo.cssPrefix('transform)});
        cssPrefix: cssPrefix,

        // Change Pablo.vendorPrefixes to adjust the vendor-prefixes applied by Pablo
        vendorPrefixes: vendorPrefixes,

        supportsClassList: supportsClassList
    });
}(window.Pablo));