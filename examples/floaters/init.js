// If browser environment suitable...
if (Pablo.isSupported && Floaters.reqAnimFrame){
    var game = new Game();
    
    game.create();
}

else {
    alert('Sorry, your browser does not support the JavaScript technologies required for this demo.')
}

/////

/*
    TODO:
    - explode into 4 squares on click, shoot off-screen never to return (a new Symbolset); worth many points; use same stroke-color as mother
    - click within union between symbols, for double points
    - keep score
    - `panic` param -> greater velocity
    - keep time; time is taken off score for that round; ticker sound, LCD font
    - join symbol points, trigger second round with all circles recreated from the points in the last round
*/