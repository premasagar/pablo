var bubble, bubbleInstances, intervalRef;

if (Pablo.isSupported){
    // SHAKY BUBBLES
    bubble = paper.defs()
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
    

    bubbleInstances = paper.use()
        .link('#bubble')
        .duplicate(8)
        .attr({
            x: function(el, i){
                return (- i * 3 + 280 + Math.random() * 100).toFixed(2);
            },
            y: function(el, i){
                return (i * 40 + Math.random() * 40).toFixed(2);
            }
        })
        .on('mouseover', function(event){
            var instance = Pablo(this),
                attr = instance.attr();
            
            intervalRef = setInterval(function(){
                instance.attr({
                    x: (Number(attr.x) + Math.random() * 15 - 7.5).toFixed(2),
                    y: (Number(attr.y) + Math.random() * 15 - 7.5).toFixed(2)
                });
            }, 1 / 60);
        })
        .on('mouseout', function(event){
            clearTimeout(intervalRef);
        });
}