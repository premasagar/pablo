(function(window, Math, Pablo){
    'use strict';

    function randomInt(length){
        return Math.ceil((length || 2) * Math.random()) - 1;
    }

    function selectInRange(factor, min, max){
        return factor * (max - min) + min;
    }

    function randomInRange(min, max){
        return selectInRange(Math.random(), min, max);
    }

    function randomIntRange(min, max){
        return randomInt(max + 1 - min) + min;
    }

    function setViewBox(naturalWidth, naturalHeight, options){
        var constrainAspect = options.constrainAspect !== false,
            scaleX, scaleY, width, height;

        scaleX = options.constrainWidth ?
            options.constrainWidth / naturalWidth : 1;
        scaleY = options.constrainHeight ?
            Math.min(scaleX, options.constrainHeight / naturalHeight) : 
            (constrainAspect ? scaleX : 1);
        width = scaleX * naturalWidth;
        height = scaleY * naturalHeight;

        if (scaleY > scaleX){
            scaleY = scaleX;
            height = scaleY * naturalHeight;
        }

        return this.attr({
            width: width,
            height: height,
            viewBox: '0 0 ' + naturalWidth + ' ' + naturalHeight
        });
    }

    // Check browser supports Pablo
    if (Pablo.isSupported){
        // CREATE SVG ROOT
        // (optional) Pass HTML element or CSS selector to be SVG container
        var container = Pablo('#testcard'),

            // SVG root element
            svg = container.svg();

        // Set viewBox dimensions
        setViewBox.call(svg, 500, 480, {
            constrainWidth: container[0].clientWidth,
            constrainHeight: container[0].clientHeight
        });

        /////

        // `<style>` ELEMENT
        svg.append(
            Pablo.style().content(
                '#svg > svg text' +
                    '{font-family:sans-serif; font-size:16px}' +
                    
                '#svg > svg g.basic line,' +
                '#svg > svg g.basic ellipse' +
                    '{stroke-width:10}'
            )
        );


        /////


        // BASIC SHAPES
        svg.append(
            Pablo.g({'stroke-width': 20})
                .addClass('basic')
                .append('line', {x1:10, y1:5, x2:200, y2:350, stroke:'purple'})
                .append('circle', {cx:200, cy:150, r:50, fill:'#f33', stroke:'#050'})
                .append('ellipse', {
                    cx:200,
                    cy:270,
                    rx:80,
                    ry:40,
                    stroke:'#222',
                    fill:'#777',
                    opacity:0.5
                })
                .append('polyline', {
                    points:'120,100 200,25 280,100',
                    stroke:'#444',
                    fill:'none',
                    // Hyphenated attribute names must be passed as strings
                    // since CamelCased attribute names are not (yet) supported
                    'stroke-linejoin':'round',
                    'stroke-linecap':'round'
                })
        );


        /////
        
        
        // TEXT ON A PATH
        svg.defs()
             .path({
                id:'squiggle',
                transform:'rotate(-90 300 170)',
                d:'M 20 320 C 120 220 220 120 320 220 C 420 320 520 420 620 320'
             });

        svg.text().textPath({
                        'xlink:href':'#squiggle',
                        fill:'#997099'
                    }).content('★ In Xanadu, did Kublah Khan a stately pleasuredome decree…');


        /////

        
        // HYPERLINKS
        // NOTE: currently underneath the bubbles and not clickable
        svg.append(
            Pablo.a({
                'xlink:href':'https://github.com/dharmafly/pablo',
                target:'_blank'
            })
            .append('text', {
                x:300,
                y:170,
                fill:'#777',
                transform:'rotate(-45 300 170)'
            }).content('➵ ♥ pablo')
        );


        /////
            
            
        // MOUSE EVENTS
        // Animate colour of red circle on interaction
        svg.find('circle')
            .attr({style:'cursor:pointer'})
            .on('mouseover touchstart', function(event){
                Pablo(this)
                    .empty()
                    .append('animate', {
                        attributeName:'fill',
                        from:'yellow',
                        to:'brown',
                        dur:'1.62s',
                        repeatCount:'indefinite'
                    })
                    .append('animate', {
                        attributeName:'r',
                        from:45,
                        to:60,
                        dur:'6s',
                        repeatCount:'indefinite'
                    })
            })
            .on('mouseout touchend', function(event){
                Pablo(this).empty();
            })
            .on('mousedown', function(event){
                Pablo(this).attr({stroke:'#fff'});
            })
            .on('mouseup', function(event){
                Pablo(this).attr({stroke:'#050'});
            });
        

        /////


        // ANIMATED PATTERN
        // In a prepended background circle
        svg.append(
            Pablo.defs()
                .append(
                    Pablo('pattern', {
                        id:'triangle',
                        width:10,
                        height:10,
                        patternUnits:'userSpaceOnUse'
                    })
                    .append(
                        Pablo('polygon', {
                            points:'5,0 10,10 0,10',
                            fill:'#bdd'
                        })
                        .append('animateTransform', {
                            attributeName:'transform',
                            type:'rotate',
                            from:'0 10 10',
                            to:'360 10 10',
                            dur:'16.2s',
                            repeatCount:'indefinite'
                        })
                    )
            )
        )
        // With prepend, this will be rendered underneath other elements
        .prepend(
            Pablo.circle({
                cx:10,
                cy:10,
                r:250,
                fill:'url(#triangle)'
            })
            .append('animate', {
                attributeName:'opacity',
                from:0,
                to:1,
                dur:'16.2s',
                repeatCount:1
            })
            .append('animateTransform', {
                attributeName:'transform',
                type:'rotate',
                from:'0 7.5 7.5',
                to:'360 7.5 7.5',
                dur:'618s',
                repeatCount:'indefinite'
            })
        );


        /////

        
        // duplicate() & ATTRIBUTE FUNCTIONS
        Pablo.g({
                stroke: '#8bb',
                'stroke-width': 1,
                opacity: 0.7
            })
            .prependTo(svg)
            .line()
                .duplicate(18)
                .attr({
                    x1: function(el, i){
                        return i % 2 ?
                            50 : 20;
                    },
                    y1: function(el, i){
                        return i % 2 ?
                            50 : 70;
                    },
                    x2: 200,
                    y2: 200,
                    transform: function(el, i){
                        return 'rotate(' +
                            ((i % 2 ? i : i -1) * 5 - 50) +
                            ', 0, 0)';
                    }
                });


        /////


        // <use> INSTANCES
                
        var rect = svg.defs()
            .g({id:'square'})
            .rect({
                x:0,
                y:0,
                width:75,
                height:75,
                stroke:'red'
            })
            .css({'stroke-width':15});
            
        svg.use({'xlink:href': '#square'})
            .duplicate(5)
            .attr({
                fill:'orange',
                opacity:0.3,
                x :function(el, i){
                    return i * 80 + 60;
                },
                y: function(el, i){
                    return i * 50 + 50;
                },
                transform: function(el, i){
                    var attr = Pablo(el).attr();
                    
                    return 'rotate(' + 
                                ((i + 1) * 22.5) + ',' +
                                attr.x + ',' +
                                attr.y +
                            ') ' +
                            'scale(' +
                                (i * 0.2 + 0.5) +
                            ')';
                },
                
            })
            .on('mouseover touchstart', function(event){
                Pablo(this)
                    .attr({
                        fill:'#300',
                        opacity:1
                    });
            })
            .on('mouseout touchend', function(event){
                Pablo(this)
                    .attr({
                        fill:'orange',
                        opacity:0.3
                    });
            });


        /////


        // Pablo.template
        Pablo.template('star', function(options){
            var points = options.points || 6,
                size = options.size || 50,
                x = options.x || 0,
                y = options.y || 0,
                theta = 360 / points,
                pathString = 'm' + size*1.5 + ',' + size*0.75,
                // Should be 1/points to 0.5*points
                depth = points * 0.375,
                angle = 0, i, x1, y1, x2, y2;

            size = (size * 8) / (points+5.5);
            for (i=0; i<points; i++){
                angle = Math.PI * theta * i / 180; 
                x1 = size * Math.cos(angle); 
                y1 = size * Math.sin(angle);
                angle = Math.PI * theta * (i+depth) / 180; 
                x2 = size * Math.cos(angle); 
                y2 = size * Math.sin(angle);
                pathString += 'l'+x1+','+y1+'l'+x2+','+y2;
            }
            return Pablo.path({
                d: pathString,
                transform: 'translate('+x+','+y+')'
            });
        });

        // Template instances
        var numShapes = 30,
            colors = ['purple', 'orange', 'gray', 'yellow', 'red'];

        while (numShapes--){
            svg.star({
                points: randomIntRange(4, 13),
                size: randomIntRange(3, 18),
                x: randomIntRange(250, 440),
                y: randomIntRange(0, 420)
            })
            .attr({
                opacity: randomInRange(1, 5) / 10,
                fill: colors[randomInt(colors.length)]
            });
        }
        
        
        /////

        var bubble, bubbleInstances, intervalRef;
            
        // SHAKY BUBBLES
        bubble = svg.defs()
            .g({id:'bubble'})
            .circle({
                cx:53,
                cy:53,
                r:50,
                stroke:'#0cc',
                'stroke-width':3,
                fill:'#0cc',
                opacity:0.2
            });
        

        bubbleInstances = svg.use({'xlink:href': '#bubble'})
            .duplicate(8)
            .attr({
                x: function(el, i){
                    // voodoo incantation
                    return Math.ceil(- i * 3 + 280 + Math.random() * 100);
                },
                y: function(el, i){
                    return Math.ceil(i * 40 + Math.random() * 40);
                }
            })
            .on('mouseover touchstart', function(event){
                var instance = Pablo(this),
                    attr = instance.attr();
                
                intervalRef = setInterval(function(){
                    instance.attr({
                        x: Math.ceil(Number(attr.x) + Math.random() * 15 - 7.5),
                        y: Math.ceil(Number(attr.y) + Math.random() * 15 - 7.5)
                    });
                }, 1000 / 30);
            })
            .on('mouseout touchend', function(event){
                clearTimeout(intervalRef);
            });

        /////

        
        // SCALE SLIDER
        var scaleRange = document.getElementById('scale');
        if (scaleRange){
            scaleRange.addEventListener('change', function(){
                // svg.el[0].currentScale = scaleRange.value;
                svg.cssPrefix({
                    'transform':'scale(' + scaleRange.value + ')',
                    'transform-origin':'0 0'
                });
            }, false);
        }
    }
}(window, window.Math, window.Pablo));