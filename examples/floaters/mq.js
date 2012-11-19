var MQ = (function(){
    'use strict';

	//Simple FIFO message queue class to support pub/sub style events
	function MQ(){
		this.queue = []; //it will hold the events that are triggered	
		this.subscribers = []; //a key/value map where the key is an event type and the value is a list of subscribers.
	}

	// Publish an event.
	// @event: a string denoting the event type
	// @data: any data connected to that event 
	// @object: the event that generated the event
	MQ.prototype.pub = function(event, data, object)
	{
		if(event){
			this.queue.push({event: event, data: data, object: object});
		}
	}

	// Subscribe to an event. 
	// @event a string denoting the event type
	// @callback specifies what to do when the event we are subscribed to is triggered
	MQ.prototype.sub = function(event, callback)
	{
		if(event && callback){
			var eventSubs = this.subscribers[event];
			if(eventSubs){
				eventSubs.push(callback);
			}
			else{
				eventSubs = [];
				eventSubs.push(callback);
				this.subscribers[event] = eventSubs;
			}
		}
	}

	// Process the queue. This will run inside the game loop so 
	// events "in sync" with the rest of the game
	MQ.prototype.process = function(){
		while(this.queue.length > 0) {
			var e = this.queue.pop();
			//retrieve all subscribers of this event
			var eventSubs = this.subscribers[e.event];
			if(eventSubs){
				for (var i = 0; i < eventSubs.length; i++) {
					var callback = eventSubs[i];
					//invoke the event handler registered by this subscriber
					callback(e.data, e.object);
				}	
			}		
		};
	}

	return MQ;
}());