---
category: reference
heading: "Mouse events"
---

Pablo can be used to attach mouse events to SVG elements with `on()`.

    
    var paper = Pablo($output[0]).root({height:120});

    // Create the circle
    paper._('circle', {cx:60, cy:60, r:50, fill:'#ff3', stroke:'#050'});

    // Apply the mouse events
    paper('circle')
        .attr({style:'cursor:pointer'})
        .on('mouseover', function(event){
            Pablo(event.target).attr({fill:'#f0f'});
        })
        .on('mouseout', function(event){
            Pablo(event.target).attr({fill:'#ff3'});
        })
        .on('mousedown', function(event){
            Pablo(event.target).attr({stroke:'#fff'});
        })
        .on('mouseup', function(event){
            Pablo(event.target).attr({stroke:'#050'});
        });