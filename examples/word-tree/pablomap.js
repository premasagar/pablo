(function(){
	'use strict';

	var pabloMap = [
		  {
		    "id":1,
		    "parentId":0,
		    "title":"Pablo",
		    "dx":11,
		    "dy":133
		  },
		  {
		    "id":2,
		    "parentId":1,
		    "title":"web graphics",
		    "dx":135,
		    "dy":16
		  },
		  {
		    "id":3,
		    "parentId":2,
		    "title":"SVG",
		    "dx":191,
		    "dy":10
		  },
		  {
		    "id":4,
		    "parentId":2,
		    "title":"desktop and mobile web",
		    "dx":155,
		    "dy":46
		  },
		  {
		    "id":5,
		    "parentId":2,
		    "title":"HTML5 integration",
		    "dx":153,
		    "dy":85
		  },
		  {
		    "id":6,
		    "parentId":1,
		    "title":"tiny",
		    "dx":137,
		    "dy":53
		  },
		  {
		    "id":7,
		    "parentId":1,
		    "title":"open source",
		    "dx":117,
		    "dy":90
		  },
		  {
		    "id":8,
		    "parentId":1,
		    "title":"animation",
		    "dx":123,
		    "dy":-85
		  },
		  {
		    "id":9,
		    "parentId":1,
		    "title":"games",
		    "dx":294,
		    "dy":-54
		  },
		  {
		    "id":10,
		    "parentId":1,
		    "title":"data visualisation",
		    "dx":271,
		    "dy":-19
		  },
		  {
		    "id":12,
		    "parentId":1,
		    "title":"interactivity",
		    "dx":115,
		    "dy":-117
		  },
		  {
		    "id":14,
		    "parentId":1,
		    "title":"interfaces",
		    "dx":299,
		    "dy":-83
		  }
		];

	var mindmapStyles = '/media/mindmap.css',
		mindmapScript = '/media/mindmap.min.js';

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