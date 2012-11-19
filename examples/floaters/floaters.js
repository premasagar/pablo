var Floaters = (function(){
    'use strict';

    var Floaters, namespace, colors, colorsLength, width, height, numPixels, settings, root, gameSettings, symbolSettings;

    function createRoot(container, width, height){
        // Body styles
        // TODO: move styles out to stylesheet
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


    namespace = 'floaters';
    colors = ['#e0f6a5','#eafcb3','#a0c574','#7c7362','#745051','#edcabc','#6b5048','#ae7271','#b79b9e','#c76044','#edfcc1','#d9f396','#75a422','#819b69','#c8836a'];
    colorsLength = colors.length;
    width = window.innerWidth;
    height = window.innerHeight;
    numPixels =  width * height;
    root = createRoot('#paper', width, height);

    gameSettings = {
        width: width,
        height: height,
        root: root,
        gameMQInterval:  1000 / 5,
        symbolDensity: 1,
        pointsTransitionDuration: 1000,
    };

    symbolSettings = {
        width: width,
        height: height,
        root: root,
        rootElem: root[0],
        rMax: 150,
        rMin: 1.5,
        strokeWidthMin: 2,
        strokeWidthMax: 20,
        velocityMin: 0.05,
        velocityMax: 0.2,
        velocitySlowdown: 1.5,
        opacityMin: 0.3,
        opacityMax: 0.9,
        //opacityMin: 1,
        //opacityMax: 1,
        colors: colors,
        colorsLength: colorsLength,
        fadeoutTime: 405,
        pointsMin: 5,
        pointsMax: 100
    };

    symbolSettings.rMid = ((symbolSettings.rMax - symbolSettings.rMin) / 2) + symbolSettings.rMin;
    symbolSettings.maxSymbols =  Math.ceil((numPixels / symbolSettings.rMid) * (gameSettings.symbolDensity / 1000));


    /////


    Floaters = {
        namespace: namespace,
        attrNamespace:  'data-' + namespace,
        attrIdKey:  'data-' + namespace + '-id',
        reqAnimFrame:  window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame ||
            window.msRequestAnimationFrame,
        cancelAnimFrame:  window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame ||
            window.msCancelAnimationFrame,
        colors: colors,
        colorsLength: colorsLength,
        gameSettings: gameSettings,
        symbolSettings: symbolSettings,

        /////

        // global message queue
        messageQueue: new MQ(),


        round: function(num, decimalplaces){
            return Number(num.toFixed(decimalplaces));
        },

        randomInt: function(length){
            return Math.ceil((length || 2) * Math.random()) - 1;
        },

        selectInRange: function(factor, min, max){
            return factor * (max - min) + min;
        },

        randomInRange: function(min, max){
            return this.selectInRange(Math.random(), min, max);
        },

        randomIntRange: function(min, max){
            return this.randomInt(max + 1 - min) + min;
        },

        now: function(){
            return (new Date().getTime());
        }
    };

    /////

    return Floaters;
}());