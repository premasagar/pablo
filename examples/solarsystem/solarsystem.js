'use strict';

var width, height, centerX, centerY, radiusScale, distanceScale, durationScale,
    solarsystem, sun, mercury, venus, earth, mars, jupiter, saturn, uranus, neptune, pluto;


// SETTINGS
    
width = window.innerWidth;
height = window.innerHeight;
radiusScale = 0.2;
distanceScale = 9;
durationScale = 10;
    
    
// SETUP
    
centerX = width / 2;
centerY = height / 2;

function round(num, places){
    return Number(num.toFixed(places));
}

    
// CLASS STRUCTURES
    
function CelestialBody(properties){
    var prop;
        
    // add properties
    for (prop in properties){
        this[prop] = properties[prop];
    }
        
    // id
    this.id = this.title.toLowerCase().replace('/\W/g', '-');
        
    // radius
    this.radius = round(this.radius * radiusScale, 2);
        
    // distance
    if (this.distance){
        this.distance = round(this.distance * distanceScale, 2);
    }
        
    // year length
    if (this.duration){
        this.duration = round(this.duration * durationScale, 2);
    }
        
    // orbits
    this.orbits = [];
}
    
CelestialBody.prototype = {
    addOrbit: function(properties){
        var orbitingBody = new CelestialBody(properties);
            
        orbitingBody.parent = this;
        this.orbits.push(orbitingBody);
        return orbitingBody;
    },
        
    pathDesc: function(){
        var distanceFromParentCenter = this.parent.radius +
            this.distance + this.radius;
        
        return 'M' +
                    centerX + ' ' +
                    (centerY - distanceFromParentCenter) +
                'a' +
                    distanceFromParentCenter + ' ' +
                    distanceFromParentCenter +
                    ' 0 1 0 0.0001 0';
    },
        
    draw: function(){
        this.node = solarsystem.circle({
            id:   this.id,
            fill: this.color,
            cx:   this.parent ? '' : centerX,
            cy:   this.parent ? '' : centerY,
            r:    this.radius
        });
            
        this.node.title().content(this.title);
            
        if (this.distance && this.duration){
            this.orbitNode = solarsystem.prepend('circle', {
                cx: centerX,
                cy: centerY,
                r: this.parent.radius + this.distance + this.radius,
                stroke: '#fff',
                'stroke-width': 0.125,
                fill: 'none'
            });
                
            this.node.animateMotion({
                path: this.pathDesc(),
                dur: this.duration + 's',
                repeatCount: 'indefinite',
                rotate: 'auto'
            });
        }
            
        this.orbits.forEach(function(orbitingBody){
            orbitingBody.draw();
        });
        return this;
    }
}


if (Pablo.isSupported){
    // All distances and times below are relative to the Earth's
    // e.g. Earth radius = 1, Earth distance from Sun = 1, Earth year length = 1
    
    sun = new CelestialBody({
        title: 'The Sun',
        color: 'yellow',
        radius: 109.2 // relative to the Earth; 432200 miles
    });
    
    mercury = sun.addOrbit({
        title: 'Mercury',
        color: 'orange',
        radius: 0.38,
        distance: 0.39,
        duration: 0.24
    });
    
    venus = sun.addOrbit({
        title: 'Venus',
        color: '#ffd',
        radius: 0.95,
        distance: 0.72,
        duration: 0.61
    });
    
    earth = sun.addOrbit({
        title: 'Earth',
        color: 'lightgreen',
        radius: 1, // 3956.6 miles
        distance: 1, // 94.443 million miles
        duration: 1
    });
    
    mars = sun.addOrbit({
        title: 'Mars',
        color: 'red',
        radius: 0.53,
        distance: 1.52,
        duration: 1.88
    });
    
    jupiter = sun.addOrbit({
        title: 'Jupiter',
        color: 'sienna',
        radius: 11.27,
        distance: 5.20,
        duration: 11.86
    });
    
    saturn = sun.addOrbit({
        title: 'Saturn',
        color: 'wheat',
        radius: 9.44,
        distance: 9.54,
        duration: 29.46
    });
    
    uranus = sun.addOrbit({
        title: 'Uranus',
        color: 'yellowgreen',
        radius: 4.1,
        distance: 19.2,
        duration: 84.02
    });
    
    neptune = sun.addOrbit({
        title: 'Neptune',
        color: 'aqua',
        radius: 3.88,
        distance: 30.1,
        duration: 164.8
    });
    
    pluto = sun.addOrbit({
        title: 'Pluto',
        color: '#fed',
        radius: 0.17,
        distance: 39.4,
        duration: 164.8
    });
    
    /////
    
    // DRAW SVG
    
    // Body styles
    Pablo('body').css({
        margin:0,
        body: 0,
        'background-color': 'black',
        color: 'white'
    });
    
    // SVG root node
    solarsystem = Pablo('#paper').root({
        width: width,
        height: height
    });
    
    // Draw the sun, and the rest will follow
    sun.draw();
}