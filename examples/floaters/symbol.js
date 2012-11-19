var Symbol = (function(){
    'use strict';

    function Symbol(settings, params){
        this.init(settings, params);
    }

    Symbol.prototype = {
        namespace: 'symbol',

        init: function(settings, params){
            this.settings = settings;
            this.pos = new Vector();
            this.velocity = new Vector();

            // Instance parameters specified - e.g. radius, color, etc
            if (params){
                Pablo.extend(this, params);
            }
            // No instance parameters given, so randomise first
            else {
                this.randomize();
            }

            return this.create();
        },

        // publish event
        pub: function(event, data){
            Floaters.messageQueue.pub(this.namespace + ':' + event, data, this);
            return this;
        },

        // subscribe to event
        sub: function(event, callback){
            Floaters.messageQueue.sub(event, callback);
            return this;
        },

        create: function(){
            return this.createDom()
                .drawAppearance()
                .drawPos();
        },

        pickColor: function(){
            return this.settings.colors[Floaters.randomInt(this.settings.colorsLength)];
        },

        randomize: function(){
            var settings = this.settings,
                halfwidth, x, y, velocityX, velocityY, velocityMax;

            // Importance
            this.importance = Floaters.randomIntRange(1, 100) / 100;

            // Size & colour
            this.opacity = Floaters.round(Floaters.selectInRange(1 - this.importance, settings.opacityMin, settings.opacityMax), 2);

            this.r = Math.round(Floaters.selectInRange(this.importance, settings.rMin, settings.rMax));

            this.strokeWidth = Math.round(Floaters.selectInRange(this.importance, settings.strokeWidthMin, settings.strokeWidthMax));
            
            this.fill = this.pickColor();
            this.stroke = this.pickColor();

            halfwidth = this.r + this.strokeWidth;

            // Points
            this.points = Math.round(Floaters.selectInRange(1 - this.importance, settings.pointsMin, settings.pointsMax));
            

            // Starting position - spread over either x or y axis
            if (Floaters.randomInt()){
                x = Floaters.randomInt() ? settings.width + halfwidth : 0 - halfwidth;
                y = Floaters.randomInt(settings.height);
            }
            else {
                x = Floaters.randomInt(settings.width);
                y = Floaters.randomInt() ? settings.height + halfwidth : 0 - halfwidth;
            }

            velocityMax = Floaters.selectInRange((1 - this.importance) * settings.velocitySlowdown, settings.velocityMin, settings.velocityMax);
            velocityX = Floaters.round(Floaters.randomInRange(settings.velocityMin, velocityMax), 2);
            velocityY = Floaters.round(Floaters.randomInRange(settings.velocityMin, velocityMax), 2);

            if (x > this.settings.width / 2){
                velocityX = 0 - velocityX;
            }
            if (y > this.settings.height / 2){
                velocityY = 0 - velocityY;
            }

            this.pos.x = x;
            this.pos.y = y;

            this.velocity.x = velocityX;
            this.velocity.y = velocityY;

            return this;
        },

        update: function(timeSinceLastUpdate){
            var pos = this.pos,
                halfwidth = this.r + this.strokeWidth;

            if (timeSinceLastUpdate){
                pos.x += this.velocity.x * timeSinceLastUpdate;
                pos.y += this.velocity.y * timeSinceLastUpdate;
            }
            else {
                pos.add(this.velocity);
            }

            if (
                pos.y < 0 - halfwidth ||
                pos.x > this.settings.width + halfwidth ||
                pos.y > this.settings.height + halfwidth
            ){
                this.randomize().drawAppearance();
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

        remove: function(event){
            var symbol = this;

            // Fade out
            this.dom
                .addClass('fade')
                .cssPrefix({
                    'transform-origin': this.pos.x + 'px ' + this.pos.y + 'px'
                });

            // Remove DOM element from DOM tree, when animation finished
            window.setTimeout(function(){
                symbol.dom.remove();
            }, this.settings.fadeoutTime);

            return this.pub('remove');
        },

        createDom: function(){
            this.root = this.settings.root;
            this.dom = this.root.circle();
            return this;
        },

        onclick: function(domEvent){
            return this.remove();
        }
    };

    return Symbol;
}());