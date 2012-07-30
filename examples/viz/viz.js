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
    maxSymbols = 30,
    createInterval = 240,
    loopRequestID,
        
    colors = ['#e0f6a5','#eafcb3','#a0c574','#7c7362','#745051','#edcabc','#6b5048','#ae7271','#b79b9e','#c76044','#edfcc1','#d9f396','#75a422','#819b69','#c8836a'],
    colorsLength = colors.length,

    settings = {
        root: root,
        rootElem: root.el[0],
        width: Number(root.attr('width')),
        height: Number(root.attr('height')),
        rMax: 60,
        rMin: 30,
        velocityMin: 1,
        velocityMax: 8,
        //opacityMin: 0.3,
        //opacityMin: 1,
        colors: colors,
        colorsLength: colorsLength
    };


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
            x, y, velocityX, velocityY;

        // Radius
        this.r = randomIntRange(settings.rMax, settings.rMin);

        // Starting position - spread over either x or y axis
        if (randomInt()){
            x = settings.width;
            y = randomInt() ? 0 - this.r : settings.height + this.r;
        }
        else {
            x = randomInt() ? 0 - this.r : settings.width + this.r;
            y = settings.height;
        }

        velocityX = randomIntRange(settings.velocityMin, settings.velocityMax);
        velocityY = randomIntRange(settings.velocityMin, settings.velocityMax);

        if (x > this.settings.width / 2){
            velocityX = 0 - velocityX;
        }
        if (y > this.settings.height / 2){
            velocityY = 0 - velocityY;
        }

        this.pos      = new Vector(x, y);
        this.velocity = new Vector(velocityX, velocityY);

        // Colouring
        this.fill = this.settings.colors[randomInt(this.settings.colorsLength)];
        this.opacity = 1 / (this.r / settings.rMin);

        return this;
    },

    // TODO: capture time since last update, and apply velocity accordingly
    update: function(){
        var pos = this.pos;

        pos.add(this.velocity);

        if (
            pos.x < 0 - this.r ||
            pos.y < 0 - this.r ||
            pos.x > this.settings.width + this.r ||
            pos.y > this.settings.height + this.r
        ){
            this.reset();
        }

        return this.draw();
    },

    draw: function(){
        this.dom.attr({
            cx: this.pos.x,
            cy: this.pos.y,
            r: this.r,
            fill: this.fill,
            opacity: this.opacity
        });

        return this;
    },

    createDom: function(){
        this.root = this.settings.root;
        this.dom = this.root.circle();

        return this;
    },

    create: function(){
        return this.reset().createDom().draw();
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