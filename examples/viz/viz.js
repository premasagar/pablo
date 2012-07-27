'use strict';

function createRoot(container){
    var root, width, height;

    // SETTINGS
        
    width = window.innerWidth;
    height = window.innerHeight;

    function round(num, places){
        return Number(num.toFixed(places));
    }

    var root;

    // Body styles
    Pablo('body').css({
        margin:0,
        body: 0,
        'background-color': 'black',
        color: 'white'
    });

    // SVG root node
    return Pablo('#paper').root({
        width: width,
        height: height
    });
}

/////

var root = createRoot('#paper'),
    rootElem = root.el[0],
    reqAnimFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame ||
        window.msRequestAnimationFrame,
    w = Number(root.attr('width')),
    h = Number(root.attr('height')),
    r = 50,
    speed = 100,
    speedX = speed,
    speedY = speed,
    frameCount = 0,
    spawnMax = 16,
    spawnDrift = 4,
    driftMax   = 16,
    colors = ['red', 'green', 'blue'],
    colorsLength = colors.length;

    function randomInt(length){
        return Math.ceil((length || 2) * Math.random()) - 1;
    }

    function createSymbol(){
        var circle,
            x = -r,
            y = -r,
            diffX, diffY;

        circle = root.circle({
            cx: x,
            cy: y,
            r: r,
            fill: 'red'
        });


        function loop(){
            diffX = w + r - x;
            diffY = h + r - y;

            if (diffX < 1 || diffY < 1){
                console.log('end');
                circle.remove();
                return;
            }

            x += randomInt(driftMax) + (diffX / w) * speedX;
            y += randomInt(driftMax) + (diffY / w) * speedY;

            circle.attr({
                cx: x,
                cy: y,
                fill: colors[randomInt(colorsLength)]
            });

            reqAnimFrame(loop, rootElem);
        }

        reqAnimFrame(loop, rootElem);
    }

    function spawn(){
        frameCount += randomInt(spawnDrift);
        if (frameCount > spawnMax){
            frameCount = 0;
            createSymbol();
        }
        reqAnimFrame(spawn, rootElem);
    }

/////

// Create a symbol; spawn more intermittently
if (reqAnimFrame){
    createSymbol();
    reqAnimFrame(spawn, rootElem);
}