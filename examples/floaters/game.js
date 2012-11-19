var Game = (function(){
    'use strict';

    function Game(){
        this.init();
    }

    Game.prototype = {
        init: function(settings){
            var game = this;

            this.settings = Floaters.gameSettings;
            this.messageQueue = Floaters.messageQueue;
            this.animationLoop = new AnimationLoop(null, this.settings.rootElem);

            return this;
        },

        // publish event
        pub: function(event, data){
            this.messageQueue.pub(this.namespace + ':' + event, data, this);
            return this;
        },

        // subscribe to event
        sub: function(event, callback){
            this.messageQueue.sub(event, callback);
            return this;
        },

        createDashboard: function(){
            this.dom = this.settings.root.g({'class': 'dashboard'});

            this.points = this.dom.g({'class': 'points'});

            // TODO: move to stylesheet
            this.notification = this.dom.text({
                'class': 'notification',
                x:'50%', 
                y:'50%', 
                'font-size':30, 
                'font-family':'lcd', 
                fill:'white',
                'text-anchor': 'middle'
            });
            this.previousNotification = this.currentNotification = '';

            return this;
        },

        displayNotification: function(message){
            // Update contents
            this.previousNotification = this.currentNotification;
            this.currentNotification = message;
            this.notification.content(message);
            return this;
        },

        displayPoints: function(symbol){
            var fontSize = 30;

            // TODO use stylesheet to style the `points` class
            this.points.text({
                x: Math.round(symbol.pos.x - (fontSize / 2)),
                y: Math.round(symbol.pos.y + (fontSize / 2)), 
                'font-size': fontSize, 
                'font-family':'lcd', 
                fill:'green'
            }).content(symbol.points);

            return this;
        },

        transformPoints: function(){
            var px = Floaters.randomIntRange(60, 120);

            this.points.cssPrefix({
                transform: 'rotate3d(1, 1, 1, ' + px + 'deg) scale(0.5) skew(0deg, 90deg)'
            });
            return this;
        },

        // Add CSS styles
        addStyles: function(){
            var fadeStylesToPrefix = {
                    transition: 'all ' + (this.settings.pointsTransitionDuration / 1000) + 's ' + 'ease-in-out',
                    'transform-origin': (this.settings.width / 2) + 'px ' + (this.settings.height / 2) + 'px'
                },
                fadeStyles = Pablo.cssPrefix(fadeStylesToPrefix),
                fadeStylesString = '',
                prop;

            for (prop in fadeStyles){
                fadeStylesString += prop + ':' + fadeStyles[prop] + ';'
            }

            this.dom.style().content(
                // prevent mouse clicks on dashboard notifications & points
                '.dashboard .notification, .dashboard .points { pointer-events: none; }' +
                // transform points
                '.dashboard .points {' + fadeStylesString + '}' +
                '.dashboard.paused { pointer-events: none; }'
            );

            return this;
        },

        update: function(){
            Floaters.messageQueue.process();
            return this;
        },

        create: function(){
            var game = this,
                rootElem = this.settings.root.get(0),
                circles = new Symbolset();

            // create state loop
            this.intervalId = window.setInterval(this.update, this.settings.gameMQInterval);

            // Create symbols
            circles.createAll();

            // Create dashboard
            this.createDashboard();

            // Add CSS styles
            this.addStyles();

            // Event subscriptions
            this.sub('pause', function(data, object){
                    game.displayNotification('Paused');
                })
                .sub('resume', function(data, object){
                    game.displayNotification(game.previousNotification);
                })
                .sub('symbol:remove', function(data, symbol){
                    game.displayPoints(symbol);
                })
                .sub('symbolset:remove', function(data, symbolset){
                    game.displayNotification('Level complete');
                    game.transformPoints();
                });

            // Click listener on SVG element
            rootElem.addEventListener('click', function(event){
                var symbolId = event.target.getAttribute(Floaters.attrIdKey),
                    symbol = circles.getSymbolById(symbolId);
                
                if (symbol){
                    symbol.onclick.call(symbol, event);
                }
            }, false);

            // Keypress listener
            window.addEventListener('keydown', function(event){
                // Spacebar pressed
                if (event.keyCode === 32){
                    // TODO: refactor to Game.pause() and Game.resume() methods
                    if (game.animationLoop.active){
                        game.animationLoop.stop();
                        Floaters.messageQueue.pub('pause', {}, game);
                    }
                    else {
                        // Reset timer, to resume play from where we left off
                        circles.updated = Floaters.now();
                        game.animationLoop.start();
                        Floaters.messageQueue.pub('resume', {}, game);
                    }
                }
            }, false);

            this.animationLoopCallback = this.animationLoop.add(function(){
                // Process all the events in the message queue
                Floaters.messageQueue.process();

                // Update all symbols
                circles.updateAll();
            });
            this.animationLoop.start();

            return this;
        }
    };

    return Game;
}());