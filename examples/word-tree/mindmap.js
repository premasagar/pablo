/*global Pablo*/
/*jshint newcap:false*/
// Create a self-calling anonymous function, to keep internal variables out of 
// global scope.
(function(window){
    // Run the program in [JavaScript strict mode](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Functions_and_function_scope/Strict_mode).
    'use strict';

    // ## 'MindMapNode' constructor
    // Set up a [new type of object](https://developer.mozilla.org/en-US/docs/JavaScript/Guide/Inheritance_and_the_prototype_chain), 
    // called `MindMapNode`, to encapsulate all the functionality by the nodes 
    // in the mindmap.
    // Its constructor function accepts a `settings` argument, which must contain 
    // `id`, `dx` & `dy` and may also contain `parent` & `title`.
    function MindMapNode(settings){
        // Extend the node instance with any passed settings.
        Pablo.extend(this, settings);

        // Create DOM elements and use them to display the settings.
        this.createElements()
            .setText(settings.title)
            .setPosition(settings.dx, settings.dy);
    }

    // ## 'MindMapNode' prototype
    // Add default properties and methods to `MindMapNode` instances.
    MindMapNode.prototype = {
        // These settings are used in drawing the node.
        PADDING_X: 6,
        PADDING_Y: 4,
        CORNER_R: 7,
        PATH_CURVE: 30,
        FONTSIZE: 20,

        // Create DOM elements.
        createElements: function(){
            // Append a `<g>` group element to the parent to represent the 
            // mindmap node in the DOM
            this.dom = this.parent.dom.g()
                .addClass('node')
                .data('node', this);

            // Append a <rect> rectangle element
            this.dom.rect({rx: this.CORNER_R});

            // Append a <text> element, with padding
            this.dom.text({
                x: this.PADDING_X,
                y: this.FONTSIZE,
                'font-size': this.FONTSIZE
            });

            if (this.parent.id){
                // Create a <path> element to visually connect the 
                // parent and node. Its coordinates are set by the 
                // `setPosition` method. We prepend it so that 
                // it appears beneath the parent's rectangle.
                this.path = Pablo.path().prependTo(this.parent.dom);
            }
            return this;
        },

        // Update the node's text and redraw the path.
        setText: function(title){
            var textElem, bbox;

            // Set the <text> element's contents
            textElem = this.dom.children('text').content(title);

            // Get the <text>'s rendered dimensions. `getBBox()` is a native SVG DOM method
            bbox = textElem[0].getBBox();
            
            // Cache the width and height - e.g. for use when drawing the path
            // Add padding for the rectangle's dimensions and update the node data
            // TODO: explain why 2*x but only 1*y; it's due to text baseline position and 
            this.width  = bbox.width + this.PADDING_X * 2;
            this.height = bbox.height + this.PADDING_Y;

            // Update the cached data and apply to the <rect> element
            this.dom.children('rect').attr({
                width:  this.width,
                height: this.height
            });
            return this.setPath();
        },

        // Update the node's x,y position and redraw the path.
        setPosition: function(dx, dy){
            this.dx = dx;
            this.dy = dy;

            // Translate the node to the new coordinates
            this.dom.transform('translate', dx, dy);

            // TODO: avoid setPath if already set by setText?
            return this.setPath();
        },

        // Update the path connecting the node and its parent.
        setPath: function(){
            // Update the path drawn between the parent and node.
            // Calculate the curve and set the element's `d` (data) attribute 
            // with the path data
            if (this.path){
                this.path.attr('d', this.getPathData());
            }
            return this;
        },


        // Calculate the path's curve.

        // Draw a path from the parent to the child
        // `p` = parentData, `n` = nodeData
        getPathData: function(){
            var // Is the node to the left or above the parent?
                isLeft  = this.dx + (this.width  / 2) < 0,
                isAbove = this.dy + (this.height / 2) < 0,

                // The curve connects the two points x1,y1 to x2,y2.
                // x1,y1 is at the parent node's side edge and halfway up.
                // Note that, in this example, x2,y2 is *relative* to x1,y2.
                x1 = isLeft ? 0 : this.parent.width,
                y1 = this.parent.height / 2,

                // The curve stops at the node's side and halfway up.
                x2 = this.dx + (isLeft ? this.width : -x1),
                y2 = this.dy,

                // The curve has a 'control point', to determine the amount and 
                // direction it deviates away from being a straight line. The 
                // control point is positioned a little distance away from a 
                // point halfway the path.
                curve = this.PATH_CURVE,
                controlX = x2 / 2 + (isLeft ? curve : -curve),
                controlY = y2 / 2 + (isAbove ? -curve : curve);

            return 'm' + x1 + ' ' + y1 +
                   'q' + controlX + ' ' + controlY + ',' + x2  + ' ' + y2;
        },

        dragStart: function(x, y){
            // Store data about the node being dragged
            // The offset is the distance between the node's x,y origin and the mouse cursor
            this.dragOffsetX = x - this.dx;
            this.dragOffsetY = y - this.dy;
            return this;
        },

        drag: function(x, y){
            // Remove the offset between the node's x,y origin and the mouse cursor
            var dx = x - this.dragOffsetX,
                dy = y - this.dragOffsetY;
            return this.setPosition(dx, dy);
        }
    };

    /////

    // Create a JavaScript `MindMap` constructor that can
    // be called with `new MindMap('#my-container');`
    function MindMap(htmlContainer){
        this.create(htmlContainer);
    }

    // Create properties and methods for `MindMap` objects
    MindMap.prototype = {
        // SETTINGS
        nextId: 1,

        // INITIALISE MINDMAP

        create: function(htmlContainer){
            /* Wrap the HTML container element(s) as a Pablo 'collection', and
            empty it (i.e. remove any child nodes).

            The argument `htmlContainer` could be a DOM element, a CSS selector 
            targetting one or more elements, a Pablo collection, or an array of
            elements. Both SVG and HTML elements can be wrapped, although Pablo 
            focusses on SVG. */
            var container = Pablo(htmlContainer).empty();

            /* Empty the HTML container element; append an <svg> root element.
            Often `width` and `height` attributes are given:
                   `collection.svg({width:400, height:'60%'})`
            */
            this.svg = container.svg();
            this.rootNode = {id:0, dx:0, dy:0, dom:this.svg};

            // An array to store the nodes, in case we want to access them later
            this.nodes = [];

            /* Add instructions and setup event handlers for user interaction.
            Most methods return `this`, (which is the `MindMap` object), to 
            allow method chaining, as with jQuery (although jQuery is not a 
            dependency of Pablo), e.g.
                `Pablo('#foo.bar').siblings().attr({x:1})`
            */
            return this.setupEvents()
                       //.addInstructions()
                       .makeSelected(this.rootNode);
        },

        setupEvents: function(){
            var mindmap = this;

            // Delegate multiple event handlers to the <svg> element
            // This performs better than setting click handlers on every
            // node element in the map.
            this.svg
                // On (only) the first mouse down, remove instructions.
                /*
                .one('mousedown', function(){
                    mindmap.removeInstructions();
                })
*/

                // On every mouse down, if clicking on the rect or text inside 
                // a node, then select the node.
                .on('mousedown', '.node text, .node rect', function(event){
                    var node, dragHandler, dragStop;

                    // Left mouse button was pressed
                    if (event.which === 1){
                        // Wrap the event target as a Pablo collection
                        node = Pablo(event.target).parent().data('node');
                        mindmap.makeSelected(node);
                        node.dragStart(event.pageX, event.pageY);

                        // Now the drag has started, drag the node when the mouse moves over // the svg element
                        dragHandler = function(event){
                            node.drag(event.pageX, event.pageY);
                        };

                        dragStop = function(event){
                            var rel;
                            // This handles the edge-case where a node is being 
                            // dragged and the mouse exits the SVG, then releases
                            // the mouse button. We detect this and stop dragging
                            if (event.type === 'mouseout'){
                                // `relatedTarget` is what the mouse entered when
                                // it left the <svg> element. `this` is the <svg>.
                                // if the `mouseout` was triggered by moving only 
                                // between SVG elements, then do nothing
                                rel = event.relatedTarget;
                                if (rel && rel === this || rel.ownerSVGElement === this){
                                    return;
                                }
                            }
                            // Stop dragging by removing the drag-related handlers
                            mindmap.svg
                                .off('mousemove', dragHandler)
                                .off('mousup mouseout', dragStop);
                        };

                        // Start dragging by adding the drag-related handlers
                        mindmap.svg
                            .on('mousemove', dragHandler)
                            .on('mouseup mouseout', dragStop);

                        event.stopPropagation();
                    }
                }, true)

                // We make `useCapture` true to prevent it propagating to the function below
                .on('mousedown', function(event){
                    // Left mouse button was pressed
                    if (event.which === 1){
                        //mindmap.askForNode(event.pageX, event.pageY);

                        if (mindmap.nodes.length){
                            mindmap.makeSelected(mindmap.nodes[0]);
                        }
                    }
                });
            return this;
        },


        // CREATE MINDMAP NODES

        /*
        askTitle: function(){
            var title = window.prompt('Type something...');
            return title && title.trim();
        },

        // Ask the user what text to put in a new node
        askForNode: function(x, y){
            var title = this.askTitle();

            if (title){
                this.createNode({dx:x, dy:y, title:title}, true);
            }
            return this;
        },
        */

        createNode: function(settings, isAbsolute){
            var node, parent;

            // If there's no specified id, generate a new id
            if (!settings.id){
                settings.id = this.nextId ++;
            }

            // If there's no parent (e.g. for the first node), append to the SVG root
            if (!settings.parent){
                settings.parent = this.selected;
            }

            // If a mouse event triggered this, using absolute page coordinates
            if (isAbsolute){
                parent = settings.parent;

                // Calculate x, y coordinates relative to the parent node
                while (parent){
                    settings.dx -= parent.dx;
                    settings.dy -= parent.dy;
                    parent = parent.parent;
                }
            }

            // Create new node instance
            node = new MindMapNode(settings);
            this.nodes.push(node);

            if (this.selected.dom === this.svg){
                this.makeSelected(node);
            }
            return this;
        },


        // SELECT NODE

        makeSelected: function(node){
            // De-selected currently selected node
            if (this.selected){
                this.selected.dom.removeClass('selected');
            }

            // Store node as `mindmap.selected` property
            this.selected = node;

           node.dom.addClass('selected')
                // Bring to front, so that it appears on top of other nodes
                .appendTo(node.dom.parent());

            return this;
        }


        // ADD/REMOVE INSTRUCTIONS TEXT

        /*
        // Add a <text> element with instructions
        addInstructions: function(){
            this.svg.text({x:10})
                .addClass('instructions')
                // Create two more, cloned text nodes
                .duplicate(2)
                // Use an array to set a different `y` attribute to each element
                .attr('y', [50, 100, 150])
                .content([
                    'Keep clicking in space to create a bunch of concepts.',
                    'Click a concept to select it as the next parent.',
                    'Reorder the map by dragging the concepts.'
                ]);

            return this;
        },

        // Remove the instructions <text> element
        removeInstructions: function(){
            this.svg.find('.instructions').remove();
            return this;
        }
        */
    };


    /////


    window.MindMap = MindMap;
}(this));