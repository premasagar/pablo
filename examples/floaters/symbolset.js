var Symbolset = (function(){
    'use strict';

    function Symbolset(){
        this.init();
    }

    Symbolset.prototype = {
        namespace: 'symbolset',
        now: Floaters.now,
        reqAnimFrame: Floaters.reqAnimFrame,
        settings: Floaters.symbolSettings,

        init: function(){
            var symbolset = this;
            
            this.symbols = [];

            this.addStyles();

            this.sub('symbol:remove', function(data, symbol){
                symbolset.removeSymbol(symbol);
            });
            return this;
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

        createSymbol: function(settings){
            var symbol = new Symbol(settings);
            symbol.dom.addClass('symbol');

            this.symbols.push(symbol);
            return symbol;
        },

        // Create as many symbols as specified by maxSymbols; add id to each symbol dom
        createAll: function(settings, params){
            var Symbol = this,
                attr = {},
                i, symbol;

            this.created = this.now(); // used in updateAll()
            this.settings.root = this.settings.root.g({'class': 'symbols'});

            for (i=0; i < this.settings.maxSymbols; i++){
                symbol = this.createSymbol(this.settings, params);
                symbol.id = i;
                attr[Floaters.attrIdKey] = i;
                symbol.dom.attr(attr);
            }

            return this;
        },

        updateAll: (function(){
            function updateSymbol(symbol){
                symbol.update(this.timeSinceLastUpdate);
            }

            // Keep updateSymbol in the closure, and return the main updateAll function
            return function(){
                // Cache timestamp of this run of the loop
                this.prevUpdated = this.updated || this.created;
                this.updated = this.now();
                this.timeSinceLastUpdate = this.prevUpdated ?
                    this.updated - this.prevUpdated : null;

                this.symbols.forEach(updateSymbol, this);
                return this;
            };
        }()),

        // Add CSS styles
        addStyles: function(){
            var fadeStylesToPrefix = {
                    transition: 'all ' + (this.settings.fadeoutTime / 1000) + 's ' + 'ease-out',
                    transform: 'scale(0)'
                },
                fadeStyles = Pablo.cssPrefix(fadeStylesToPrefix),
                fadeStylesString = '',
                prop;

            for (prop in fadeStyles){
                fadeStylesString += prop + ':' + fadeStyles[prop] + ';'
            }

            this.settings.root.style().content(
                '.symbol:hover {stroke:green; cursor:crosshair;}' + 
                '.symbol.fade {' + fadeStylesString + '}'
            );
            return this;
        },

        getSymbolById: function(id){
            return this.symbols[id];
        },

        removeSymbol: function(symbol){
            var hasRemainingSymbols, i;

            // Remove instance from memory
            delete this.symbols[symbol.id];

            // Check if all symbols removed
            for (i = this.symbols.length; i; i--){
                if (this.symbols[i-1]){
                    hasRemainingSymbols = true;
                    break;
                }
            }
            if (!hasRemainingSymbols){
                this.pub('remove');
            }

            return this;
        }
    };

        return Symbolset;
}());