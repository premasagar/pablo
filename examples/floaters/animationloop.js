var AnimationLoop = (function(window){
	'use strict';


	function now(){
	    return (new Date().getTime());
	}

	var nativeRequestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame ||
			        window.msRequestAnimationFrame,
		nativeCancelAnimationFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame ||
	        window.msCancelAnimationFrame;


	function AnimationLoopCallback(callback, thisArg){
		this.callback = callback;

		if (thisArg){
			this.thisArg = thisArg
		}
	}

	AnimationLoopCallback.prototype = {
		thisArg: null,
		active: true,
		pause: function(){
			this.active = false;
		},
		resume: function(){
			this.active = true;
		},
		toggle: function(){
			this.active = !this.active;
		}
	};


	function AnimationLoop(callback, element){
		this.init(callback, element);
	}

	AnimationLoop.prototype = {
		active: false,
		requestID: null,
		lastUpdated: null,
		timeSinceLastFrame: 0,
		element: null,
		callbacks: [],
		nativeRequestAnimationFrame: nativeRequestAnimationFrame,
		nativeCancelAnimationFrame: nativeCancelAnimationFrame,
		isSupported: !!(nativeRequestAnimationFrame && nativeCancelAnimationFrame),

		init: function(callback, element){
			this.lastUpdated = now();
			if (element){
				this.element = element;
			}
			if (callback){
				this.add(callback, element).start();
			}
		    
		    return this;
		},

		request: function(){
			var animationLoop = this;

			if (this.isSupported){
				this.active = true;
				this.requestID = this.nativeRequestAnimationFrame.call(window, function(){
					animationLoop.process();
				}, this.element);
			}
			return this;
		},

		start: function(){
			return this.request();
		},

		stop: function(){
			if (this.isSupported){
				this.active = false;
				this.nativeCancelAnimationFrame.call(window, this.requestID);
				this.requestID = null;
			}
			return this;
		},

		toggle: function(){
			return this.active ? this.stop() : this.start();
		},

		process: (function(){
			function process(callbackObj){
				if (callbackObj.active){
					callbackObj.callback.call(callbackObj.thisArg || null, this.timeSinceLastFrame);
				}
			}

			return function(){
				var t = now();

				this.timeSinceLastFrame = t - this.lastUpdated;
				this.lastUpdated = t;
				this.callbacks.forEach(process, this);

				return this.request();
			};
		}()),

		add: function(callback, element, thisArg){
			var animationLoop = this,
				callbackObj = new AnimationLoopCallback(callback, element, thisArg);

			this.callbacks.push(callbackObj);
			return callbackObj;
		},

		remove: function(callback){
			var callbacks = this.callbacks,
				len = callbacks.length,
				i;

			for (i=0; i<len; i++){
				if (callbacks[i].callback === callback){
					// splice out callback from callbacks array
					this.callbacks.splice(i, 1);
					break;
				}
			}

			return this;
		}
	};

	return AnimationLoop;
}(window));