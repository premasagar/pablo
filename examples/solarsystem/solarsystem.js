var paper, width, scale, height, centerX, centerY, planet, sun, mercury, venus, earth, mars, jupiter, saturn, uranus, neptune, pluto, moon, diameter, distance, year, color;

if (Pablo.isSupported){
    // DATASETS
    
    // Diameter, where Earth's = 1
    diameter = {
        sun: 109.2,
        mercury: 0.38,
        venus: 0.95,
        earth: 1,
        mars: 0.53,
        jupiter: 11.27,
        saturn: 9.44,
        uranus: 4.10,
        neptune: 3.88,
        pluto: 0.17
    };
    
    // Distance from Sun, where Earth's = 1
    distance = {
        mercury: 0.39,
        venus: 0.72,
        earth: 1,
        mars: 1.52,
        jupiter: 5.20,
        saturn: 9.54,
        uranus: 19.2,
        neptune: 30.1,
        pluto: 39.4
    };
    
    // Year length, where Earth's = 1
    year = {
        mercury: 0.24,
        venus: 0.61,
        earth: 1,
        mars: 1.88,
        jupiter: 11.86,
        saturn: 29.46,
        uranus: 84.02,
        neptune: 164.8,
        pluto: 248
    };
    
    color = {
        sun: 'yellow',
        mercury: 'orange',
        venus: '#ffd',
        earth: 'green',
        mars: 'red',
        jupiter: 'sienna',
        saturn: 'tan',
        uranus: 'lightgreen',
        neptune: 'aqua',
        pluto: 'lightgray'
    };
    
    
    /////
    
    // SETTINGS
    
    width = 2000;
    height = 2200;
    scale = 0.5;
    
    /////
    
    // CONSTANTS
    
    centerX = width / 2;
    centerY = height / 2;
    
    
    for (planet in diameter){
        diameter[planet] = diameter[planet] * scale;
    }
    for (planet in distance){
        distance[planet] = distance[planet] * scale;
    }
    for (planet in year){
        year[planet] = year[planet] * scale;
    }
    
    /////
    
    // Create SVG root node
    paper = Pablo('#paper')
        .root({
            width: width,
            height: height,
            style: 'background-color: black'
        });
    
    sun = paper.circle({
        id: 'sun',
        fill: color.sun,
        cx: centerX,
        cy: centerY,
        r: diameter.sun
    });
    

    for (planet in distance){
        var r = diameter[planet];
        
        paper.circle({
            fill: color[planet],
            r: diameter[planet],
            id: planet
        })
        .append(
            Pablo.animateMotion({
                path: 'M' + centerX + ' ' + (centerY - diameter.sun - distance[planet] * 50) + 'a' + (diameter.sun + distance[planet] * 50) + ' ' + (diameter.sun + distance[planet] * 50) + ' 0 1 0 0.0001 0',
                dur: year[planet] * 30 + 's',
                repeatCount: 'indefinite',
                rotate: 'auto'
            })
        );
    }
}