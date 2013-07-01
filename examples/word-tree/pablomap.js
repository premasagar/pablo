(function(){
	'use strict';

	var pabloMap = [
	  {
	    "id":1,
	    "parentId":0,
	    "title":"Pablo",
	    "dx":267,
	    "dy":131
	  },
	  {
	    "id":2,
	    "parentId":1,
	    "title":"web graphics",
	    "dx":98,
	    "dy":-93
	  },
	  {
	    "id":3,
	    "parentId":2,
	    "title":"SVG",
	    "dx":187,
	    "dy":12
	  },
	  {
	    "id":4,
	    "parentId":2,
	    "title":"Cross-platform",
	    "dx":170,
	    "dy":51
	  },
	  {
	    "id":5,
	    "parentId":2,
	    "title":"HTML5 integration",
	    "dx":164,
	    "dy":88
	  },
	  {
	    "id":6,
	    "parentId":1,
	    "title":"tiny",
	    "dx":130,
	    "dy":-20
	  },
	  {
	    "id":7,
	    "parentId":1,
	    "title":"open source",
	    "dx":122,
	    "dy":31
	  },
	  {
	    "id":8,
	    "parentId":1,
	    "title":"animation",
	    "dx":-155,
	    "dy":137
	  },
	  {
	    "id":9,
	    "parentId":1,
	    "title":"games",
	    "dx":-233,
	    "dy":-2
	  },
	  {
	    "id":10,
	    "parentId":1,
	    "title":"data visualisation",
	    "dx":-265,
	    "dy":83
	  },
	  {
	    "id":12,
	    "parentId":1,
	    "title":"interactivity",
	    "dx":-227,
	    "dy":-124
	  },
	  {
	    "id":14,
	    "parentId":1,
	    "title":"interfaces",
	    "dx":-233,
	    "dy":-64
	  }
	];

	var mindmapStyles = 'mindmap.css', // /media/mindmap.css
		mindmapScript = 'mindmap.js'; // /media/mindmap.min.js

	/////

	// Check browser support
	if (Pablo.isSupported){
        var head = Pablo('head');

        // Mindmap styles
        Pablo(document.createElement('link'))
        	.attr({
        		rel: 'stylesheet',
        		href: mindmapStyles
        	})
        	.appendTo(head);

        // Mindmap script
        Pablo(document.createElement('script'))
        	.attr({
        		src: mindmapScript
        	})
        	.appendTo(head)
        	.on('load', function(){
        		MindMap.prototype.restoreFrom = function(nodes){
			        // Draw each node
			        nodes.forEach(function(settings){
			            this.nodes.some(function(cachedNode){
			                if (cachedNode.id === settings.parentId){
			                    settings.parent = cachedNode;
			                    return true;
			                }
			            }, this);

			            this.createNode(settings);
			        }, this);
			        return this;
			    };

				var mm = new MindMap('#mindmap');
				mm.restoreFrom(pabloMap);
        	});

	    /*
	    mm.getState = function(){
	        var nodesData = [];

	        this.nodes.forEach(function(node){
	            nodesData.push({
	                id:       node.id,
	                parentId: node.parent && node.parent.id,
	                title:    node.title,
	                dx:       node.dx,
	                dy:       node.dy
	            });
	        });
	        return nodesData;
	    };
	    */
	}
}());