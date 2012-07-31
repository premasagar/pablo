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
    reqAnimFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame ||
        window.msRequestAnimationFrame,
    cancelAnimFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame ||
        window.msCancelAnimationFrame,

    active = true,
        
    colors = ['#e0f6a5','#eafcb3','#a0c574','#7c7362','#745051','#edcabc','#6b5048','#ae7271','#b79b9e','#c76044','#edfcc1','#d9f396','#75a422','#819b69','#c8836a'],
    colorsLength = colors.length,

    settings = {
        root: root,
        rootElem: root.el[0],
        width: Number(root.attr('width')),
        height: Number(root.attr('height')),
        rMax: 80,
        rMin: 15,
        strokeWidthMin: 2,
        strokeWidthMax: 20,
        velocityMin: 0.1,
        velocityMax: 5,
        opacityMin: 0.3,
        opacityMax: 0.9,
        colors: colors,
        colorsLength: colorsLength
    },

    magicNumber = 400,
    maxSymbols = Math.round(
        (
            (settings.width * settings.height) /
            ((settings.rMax - settings.rMin) / 2 + settings.rMin)
        ) / magicNumber
    ),
    createInterval = 240,
    loopRequestID;


/////


function round(num, places){
    return Number(num.toFixed(places));
}

function randomInt(length){
    return Math.ceil((length || 2) * Math.random()) - 1;
}

function randomIntRange(min, max){
    return randomInt(max + 1 - min) + min;
}

function now(){
    return (new Date().getTime());
}

/////


function Vector(x, y){
    this.x = x;
    this.y = y;
}

Vector.prototype = {
    add: function(vector){
        this.x += vector.x;
        this.y += vector.y;
        return this;
    }
};


/////


function Symbol(settings){
    this.settings = settings;
    this.create();
}

Symbol.prototype = {
    reset: function(){
        var settings = this.settings,
            halfwidth, x, y, velocityX, velocityY;

        // Importance
        this.importance = randomIntRange(1, 100) / 100;

        // Size & colour
        this.opacity = (1 - this.importance * this.importance) * 
            (settings.opacityMax - settings.opacityMin) + settings.opacityMin;
        this.r = Math.round(this.importance *  (settings.rMax - settings.rMin) + settings.rMin);
        this.strokeWidth = Math.round(this.importance *  (settings.strokeWidthMax - settings.strokeWidthMin) + settings.strokeWidthMin);
        this.fill = this.settings.colors[randomInt(this.settings.colorsLength)];
        this.stroke = this.settings.colors[randomInt(this.settings.colorsLength)];
        halfwidth = this.r + this.strokeWidth;

        // Starting position - spread over either x or y axis
        if (randomInt()){
            x = randomInt() ? settings.width + halfwidth : 0 - halfwidth;
            y = randomInt(settings.height);
        }
        else {
            x = randomInt(settings.width);
            y = randomInt() ? settings.height + halfwidth : 0 - halfwidth;
        }

        velocityX = round(randomIntRange(settings.velocityMin * 100, settings.velocityMax * 100) / 100, 2);
        velocityY = round(randomIntRange(settings.velocityMin * 100, settings.velocityMax * 100) / 100, 2);
        //velocityX = (1 - this.importance) *  (settings.velocityMax - settings.velocityMin) + settings.velocityMin;
        //velocityY = (1 - this.importance) *  (settings.velocityMax - settings.velocityMin) + settings.velocityMin;

        if (x > this.settings.width / 2){
            velocityX = 0 - velocityX;
        }
        if (y > this.settings.height / 2){
            velocityY = 0 - velocityY;
        }

        this.pos      = new Vector(x, y);
        this.velocity = new Vector(velocityX, velocityY);

        return this;
    },

    // TODO: capture time since last update, and apply velocity accordingly
    update: function(){
        var pos = this.pos,
            halfwidth = this.r + this.strokeWidth;

        pos.add(this.velocity);

        if (
            pos.y < 0 - halfwidth ||
            pos.x > this.settings.width + halfwidth ||
            pos.y > this.settings.height + halfwidth
        ){
            this.reset().drawAppearance();
        }

        return this.drawPos();
    },

    drawAppearance: function(){
        this.dom.attr({
            r: this.r,
            fill: this.fill,
            stroke: this.stroke,
            'stroke-width': this.strokeWidth,
            opacity: this.opacity
        });

        return this;
    },

    drawPos: function(){
        this.dom.attr({
            cx: Math.round(this.pos.x),
            cy: Math.round(this.pos.y)
        });

        return this;
    },

    createDom: function(){
        this.root = this.settings.root;
        this.dom = this.root.circle();

        return this;
    },

    create: function(){
        return this.reset()
            .createDom()
            .drawAppearance()
            .drawPos();
    }
};

Pablo.extend(Symbol, {
    symbols: [],
    createInterval: createInterval,
    maxSymbols: maxSymbols,
    reqAnimFrame: reqAnimFrame,

    createSymbol: function(settings){
        this.symbols.push(new this(settings));
    },

    // TODO: allow cancelling requestAnimFrame
    createAll: function(settings){
        var Symbol = this,
            intervalRef;

        function createSymbol(){
            Symbol.createSymbol(settings);
        }

        function setupCreateSymbol(){
            if (Symbol.symbols.length < Symbol.maxSymbols){
                Symbol.reqAnimFrame.call(window, createSymbol, settings.rootElem);
            }
            else {
                window.clearInterval(intervalRef);
            }
        }

        intervalRef = window.setInterval(setupCreateSymbol, this.createInterval);
    },

    updateAll: (function(){
        function updateSymbol(symbol){
            symbol.update();
        }

        return function(){
            this.symbols.forEach(updateSymbol);
        }
    }())
});


/////

function loop(){
    Symbol.updateAll();
    loopRequestID = reqAnimFrame(loop, settings.rootElem);
}

if (Pablo.isSupported && reqAnimFrame){
    // Create 
    Symbol.createAll(settings);
    loopRequestID = reqAnimFrame(loop, settings.rootElem);

    // Click SVG element to pause and resume animation
    settings.rootElem.addEventListener('click', function(){
        if (active && cancelAnimFrame){
            active = false;
            cancelAnimFrame(loopRequestID);
        }
        else {
            active = true;
            loop();
        }
    });
}