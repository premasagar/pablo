(function(){
    var _drawNode = MindMap.prototype.drawNode;

    MindMap.prototype.drawNode = function(nodeData){
        _drawNode.apply(this, arguments);

        nodeData.node.animateTransform({
            attributeName: 'transform',
            type: 'translate',
            from: 0,
            to: nodeData.dx + ' ' + nodeData.dy,
            dur: '1s'
        })[0].beginElement();

        if (nodeData.parentId){
            nodeData.path.animate({
                attributeName: 'd',
                from: 'm0,0q0,0 0,0',
                to: this.getPathData(nodeData, this.cache[nodeData.parentId]),
                dur: '1s'
            })[0].beginElement();
        }

        return this;
    };
}());