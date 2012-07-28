'use strict';

function createRoot(container){
    var root, width, height;

    // SETTINGS
    width = window.innerWidth;
    height = window.innerHeight;

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
    opacity = 1,
    speed = 5,
    speedX = speed,
    speedY = speed,
    frameCount = 0,
    spawnMax = 16,
    spawnDrift = 40,
    spawnEvery = 100,
    driftMax   = 6,
    colorChange =  30,
    colors = ['#e0f6a5','#eafcb3','#a0c574','#7c7362','#745051','#edcabc','#6b5048','#ae7271','#b79b9e','#c76044','#edfcc1','#d9f396','#75a422','#819b69','#c8836a'],
    colorsLength = colors.length,
    time, symbolCreatedTime;

    function round(num, places){
        return Number(num.toFixed(places));
    }

    function randomInt(length){
        return Math.ceil((length || 2) * Math.random()) - 1;
    }

    function now(){
        return (new Date().getTime());
    }

    function createSymbol(){
        var circle,
            x = -r - randomInt(500),
            y = -r - randomInt(500),
            diffX, diffY;

        circle = root.circle({
            cx: x,
            cy: y,
            r: r,
            fill: colors[randomInt(colorsLength)],
            opacity: opacity
        });


        function loop(){
            var attr;

            diffX = w + r - x;
            diffY = h + r - y;

            // offscreen, so remove
            if (diffX < 1 || diffY < 1){
                circle.remove();
                return;
            }

            x += randomInt(driftMax) + (diffX / w) * speedX;
            y += randomInt(driftMax) + (diffY / w) * speedY;

            attr = {
                cx: Math.round(x),
                cy: Math.round(y)
            };

            if (!randomInt(colorChange)){
                attr.fill = colors[randomInt(colorsLength)];
            }

            circle.attr(attr);

            reqAnimFrame(loop, rootElem);
        }

        reqAnimFrame(loop, rootElem);
    }

    function spawn(){
        time = now();
        if (time - (randomInt(spawnDrift) + symbolCreatedTime) > spawnEvery){
            symbolCreatedTime = time;
            createSymbol();
        }
        reqAnimFrame(spawn, rootElem);
    }

/////

// Create a symbol; spawn more intermittently
if (reqAnimFrame){
    createSymbol();
    symbolCreatedTime = now();
    reqAnimFrame(spawn, rootElem);
}