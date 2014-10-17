var canvas;
var QuadTree;

document.addEventListener("DOMContentLoaded", function () {
    canvas = document.getElementById('display').getContext('2d');
    QuadTree = Quadrant(0, 0, Constants.CANVAS_WIDTH, Constants.CANVAS_HEIGHT, canvas);
    for (var i = 0; i < 25; ++i){
        var currentPoint = Points(Math.random() * Constants.CANVAS_WIDTH, Math.random() * Constants.CANVAS_HEIGHT);
        var deltaLeft = Math.random() * Constants.POINT_SPEED;
        var deltaTop = Math.random() * Constants.POINT_SPEED;
        if (Math.random() < 0.5) deltaLeft -= deltaLeft;
        if (Math.random() < 0.5) deltaTop -= deltaTop;
        currentPoint.setMovementVector(deltaLeft, deltaTop);
        QuadTree.insertIntoPointContainer(currentPoint);
    }
    setInterval(function(){
        QuadTree.clearQuadrants();
        QuadTree.updateElements();
        QuadTree.drawElements();
        QuadTree.split();
    }, 1000/60);
});