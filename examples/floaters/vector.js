var Vector = (function(){
    'use strict';

    function Vector(x, y){
        this.x = x;
        this.y = y;
    }

    Vector.prototype = {
        add: function(vectorOrDigit){
            if (typeof vectorOrDigit === 'number'){
                this.x += vectorOrDigit;
                this.y += vectorOrDigit;
            }
            else if (typeof vectorOrDigit === 'object' && vectorOrDigit !== null) {
                this.x += vectorOrDigit.x;
                this.y += vectorOrDigit.y;
            }
            return this;
        },

        multiply: function(vectorOrDigit){
            if (typeof vectorOrDigit === 'number'){
                this.x *= vectorOrDigit;
                this.y *= vectorOrDigit;
            }
            else if (typeof vectorOrDigit === 'object' && vectorOrDigit !== null) {
                this.x *= vector.x;
                this.y *= vector.y;
            }
            return this;
        },

        clone: function(){
            return new Vector(this.x, this.y);
        }
    };

    return Vector;
}());