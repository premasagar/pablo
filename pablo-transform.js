var numberOrSpace = /^[\d\s]+$/,
    comma = /,\s*/;

function isNumeric(str){
    if (typeof str === 'number'){
        return true;
    }
    return typeof str === 'string' && numberOrSpace.test(str);
}

function convertNumericToNumber(values){
    if (typeof values === 'number'){
        return values;
    }
    if (typeof values === 'string'){
        return isNumeric(values) ? Number(values) : values;
    }
    if (Array.isArray(values)){
        return values.map(function(value){
            return convertNumericToNumber(value);
        });
    }
    return values;
}

// e.g. transformRegex('rotate');
function transformRegex(transformFunction){
    return new RegExp('\\b' + transformFunction + '\\(([^)]*)\\)|$');
}

// e.g. updateList('translate(0 5)rotate(90)', {translate:'(0 5)', rotate:'(90)'}), transformRegex);
function updateList(list, items, regexGenerator){
    var prop, item, value, itemRegex;

    if (!list){
        list = '';
    }

    for (prop in items){
        if (items.hasOwnProperty(prop)){
            value = items[prop];
            item = value === null ? '' : prop + value;
            itemRegex = regexGenerator(prop);
            list = list.replace(itemRegex, item);
        }
    }
    return list;
}

// e.g. createTransformValuesString([45,0,0], ',') => '(45,0,0)'
function createTransformValuesString(value, delimiter){
    return '(' + (Array.isArray(value) ?
                value.join(delimiter) : value) + ')';
}

// Convert `value` string, number or array to '(value,value,value)'
function convertValuesToStrings(transforms, delimiter){
    var transformFunction;

    for (transformFunction in transforms){
        if (transforms.hasOwnProperty(transformFunction)){
            value = transforms[transformFunction];
            transforms[transformFunction] = value === null ?
                null : createTransformValuesString(value, delimiter);
        }
    }
    return transforms;
}

function createTransformList(transformsArray){
    var list = '';

    transformsArray.forEach(function(transform){
        var transformFunction = Object.keys(transform)[0],
            value = transform[transformFunction];

        list += transformFunction + createTransformValuesString(value, ',');
    });
    return list;
}

function getTransformValue(list, transformFunction){
    var match = list.match(transformRegex(transformFunction)),
        value;

    if (match && match[1]){
        value = convertNumericToNumber(match[1].split(comma));
    }
    return value;
}

// e.g. transform({rotate:45, translate:null}, true);
// e.g. transform([{rotate:45}, {translate:'10px'}], true);
Pablo.fn.transform = function(transforms, value, withCss){
    var list, transformFunction, transforms, match, undef;

    if (typeof value === 'boolean'){
        withCss = value;
        value = undef;
    }

    // `null` removes all transforms
    if (transforms === null){
        list = null;
    }

    // An array of transforms creates a new transform list in sequence
    else if (Array.isArray(transforms)){
        list = createTransformList(transforms);
    }

    // A string to get a transform value
    // or an object of transforms updates existing transforms or adds them
    else {
        // Get 'transform' css property or attribute
        list = this[withCss ? 'css' : 'attr']('transform');

        // Individual transform function passed
        if (typeof transforms === 'string'){
            transformFunction = transforms;

            // Get a specific transform
            if (typeof value === 'undefined'){
                return getTransformValue(list, transformFunction);
            }

            // Set a specific transform
            transforms = {};
            transforms[transformFunction] = value;
        }

        // Update existing transforms, or add new ones
        convertValuesToStrings(transforms, ',');
        list = updateList(list, transforms, transformRegex);
    }

    // Set 'transform' css property or attribute
    return this[withCss ? 'css' : 'attr']('transform', list);
}










function updateTransform(collection, transform, withCss){
    return collection.each(function(el){
        var node = Pablo(el),
            delimiter = withCss ? ' ' : ',',
            transformStr = withCss ? node.css('transform') : node.attr('transform'),
            transformFunction, values, existingTransform, component;

        for (transformFunction in transform){
            if (transform.hasOwnProperty(transformFunction)){
                values = transform[transformFunction];
                component = createTransformString(transformFunction, values, delimiter);
                existingTransform = new RegExp('(^|\\)\s*(' + transformFunction + '\\([^\\)]*\\))');
                transformStr = transformStr.replace(existingTransform, '$1' + component);
            }
        }

        if (withCss){
            node.css('transform', transformStr);
        }
        else {
            node.attr('transform', transformStr);
        }
    });
}

// e.g. createTransformString(30, ',')
// e.g. createTransformString([0, 20, 30], ',')
function createTransformString(transformFunction, values, delimiter){
    return transformFunction + '(' + (Array.isArray(values) ? values.join(delimiter) : values) + ')';
}


function mergeTransformString(transforms, values, valuesDelimiter){
    var transformStr, length, i, transformFunction;

    // e.g. createTransformString('rotate', 30, ',')
    // e.g. createTransformString('rotate', [0, 20, 30], ',')
    if (typeof transforms === 'string'){
        transformFunction = transforms;
        transformStr = createTransformString(transformFunction, values, valuesDelimiter);
        updateTransform
    }

    // e.g. createTransformString({rotate: [0, 20, 30]}, ',')
    else if (!Array.isArray(transforms)){

    }

    else {
        transformStr = '';

        // e.g. createTransformString([{rotate: [0, 20, 30]}, {translate: 40}], ',')
        transforms.forEach(transforms, function(transform){
            for (transformFunction in transform){
                if (transform.hasOwnProperty(transformFunction)){
                    transformStr += createTransformString(transformFunction, values, valuesDelimiter);
                }
            }
            this.transform(transform, );
        }, this);

        // e.g. createTransformString(['rotate', [0, 20, 30], 'translate', 40], ',')
        /*
        for (length = transforms.length, i=0; i<length-1; i+=2){
            transformFunction = transforms[i];
            values = transforms[i+1];
            transformStr += createTransformValuesString(transformFunction, values, valuesDelimiter);
        }
        */
    }

    return transformStr;
}

// e.g. createTransformString([{rotate: 30}, {translate: [10, 50]}, ',')

Pablo.fn.transform = function(transforms, values, withCss){
    var valuesDelimiter;

    // transform()
    if (!transforms){
        return this.attr('transform');
    }

    valuesDelimiter = withCss ? ' ' : ',';

    // transform('translate', 10)
    // transform('translate', [0, 10, 10], 'css')
    // transform(['translate', [0,0,0], 'scale', 8, 'skew', '50', 'rotate', '50px'])
    this.each(function(el, i){
        var thisTransforms = this.getValue(transforms, i),
            thisValues = this.getValue(values, i),
            transformStr = createTransformString(transforms, values, valuesDelimiter);

        Pablo(el).attr('transform', transformStr);
        // TODO: make additive to existing transforms(?) - if key-value object supplied
    });
    return this;
}

var oldTransform = function(functionName, value/* , additional values*/){
    /*

    // Modified from http://stackoverflow.com/a/17838403/165716
    function parseTransformString(str){
        var ret = {},
            func = /(\w+\((\-?\d+\.?\d*,?\s*)+\))+/g,
            components = /[\w\.\-]+/g,
            matches = str.match(func),
            match, ;

        for (match in matches){
            var c = str[match].match(components);

            c.slice(1).forEach(function(value, i){
                 c[i+1] = Number(value);
            });

            ret[c.shift()] = c;
        }
        return ret;
    }

    */

    var isSingle = this.length === 1;

    // Additional arguments are space-delimited as part of the value
    if (arguments.length > 2){
        value = toArray(arguments).slice(1).join(' ');
    }

    return this.each(function(el, i){
        // Avoid unnecessary Pablo collection creation
        var node = isSingle ? this : Pablo(el),
            transformAttr = node.attr('transform'),
            newTransformAttr, pos, posEnd, transformAttrEnd,
            functionString = functionName + '(' + this.getValue(value, i) + ')';

        // There's already a transform attribute
        if (transformAttr){
            // Start position for the function
            pos = (' ' + transformAttr).indexOf(' ' + functionName + '(');

            // Function name already present
            if (pos >= 0){
                transformAttrEnd = transformAttr.slice(pos);
                // End position for the function
                posEnd = transformAttrEnd.indexOf(')');

                // Insert modified function
                // TODO: use splice() instead?
                newTransformAttr = transformAttr.slice(0, pos) + 
                    functionString + transformAttrEnd.slice(posEnd + 1);
            }

            // Function not yet present
            else {
                newTransformAttr = transformAttr + ' ' + functionString;
            }
        }

        // Set transform attribute
        node.attr('transform', newTransformAttr || functionString);
    }, this);
};


Pablo.rect().transform(['translate', [0,0,0], 'scale', 8, 'skew', '50', 'rotate', '50px']).transform();

