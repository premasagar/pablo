
<a id="circleoo-controller" style="cursor:pointer">play / pause</a>

<!--
<svg id="circleoo" width="100" height="100">
	<defs>
	    <circle
	    	id="circleoo-circle"
	        cx="50"
	        cy="50"
	        stroke="white"
	        fill="darkred">
	        <animate 
	            id="r1"
	            attributeName="r"
	            from="50" to="0"
	            dur="5s"
	            begin="0s;r2.end"/>
	        <animate 
	            id="sw1"
	            attributeName="stroke-width"
	            from="0" to="50"
	            dur="5s"
	            begin="0s;sw2.end"/>
	        <animate 
	            id="r2"
	            attributeName="r"
	            from="0" to="50"
	            dur="5s"
	            begin="r1.end"/>
	        <animate 
	            id="sw2"
	            attributeName="stroke-width"
	            from="50" to="0"
	            dur="5s"
	            begin="sw1.end"/>
	    </circle>
	</defs>
</svg>

<script>
    // Load, on DOM ready
    if ('addEventListener' in document){
        document.addEventListener('DOMContentLoaded', function(){ 
            var controller = Pablo('#circleoo-controller'),
                dom = Pablo('#circleoo'),
                playing = false;

            controller.on('click', function(){
                playing = !playing;

                if (playing){
                	dom.use({
                		x: 0,
                		y: 0,
                		width: 100,
                		height: 100,
                		'xlink:href': '#circleoo-circle'
                	})
                }
                else {
                	dom.find('use').remove();
                }
            });
        });
    }
</script>

<script>
    // Load, on DOM ready
    if ('addEventListener' in document){
        document.addEventListener('DOMContentLoaded', function(){
        	var playing = false,
        		svg = Pablo('#circleoo').svg({
					width: 100,
					height: 100
				}),
				circle = svg.circle({
					cx: 50,
					cy: 50,
					stroke: 'white',
					fill: 'darkred',
					cursor: 'pointer'
				});

			circle.animate({
				id: 'anim-r1',
                'class': 'anim-begin',
				attributeName: 'r',
				from: 50,
				to: 0,
				begin: '0s;anim-r2.end'
			});

			circle.animate({
				id: 'anim-r2',
				attributeName: 'r',
				from: 0,
				to: 50,
				begin: 'anim-r1.end'
			});

			circle.animate({
				id: 'anim-s1',
                'class': 'anim-begin',
				attributeName: 'stroke-width',
				from: 50,
				to: 0,
				begin: '0s;anim-s2.end'
			});

			circle.animate({
				id: 'anim-s2',
				attributeName: 'stroke-width',
				from: 0,
				to: 50,
				begin: 'anim-s1.end'
			});

			svg.on('click', function(){
				playing = !playing;

                if (playing){
                    circle.find('animate.anim-begin')
                        .each(function(el){
                            el.beginElement();
                        });
                }
                else {
                    circle.find('animate').each(function(el){
                        el.endElement();
                    });
                }
			});
        });
    }
</script>
-->