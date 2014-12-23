var Constants = {
    Canvas : {
        Width : 680,
        Height : 480,
        TileDimension : 18,
    },
    Radius: 10,
    EPS : 0.01,
    MaximumTiles : 100,
};

/* Bresenham's Line Algorithm Illustration */

function Point(left, top) {
    var _left = left;
    var _top = top;
        
    return {
        getLeft : function() {
            return _left;
        },
        getTop : function() {
            return _top;
        },
    }
}

function Graphics(canvas) {
    var _canvas = canvas;
    var _tileDimension = Constants.Canvas.TileDimension;

    return {
        clearCanvas : function() {
            _canvas.save();
            _canvas.fillStyle = "white";
            _canvas.fillRect(0, 0, Constants.Canvas.Width, Constants.Canvas.Height);
            _canvas.restore();
        },
        drawPoint : function(row, column) {
            _canvas.save();
            _canvas.strokeStyle = "black";
            _canvas.lineWidth = 5;
            _canvas.strokeRect(row * _tileDimension, column * _tileDimension, _tileDimension, _tileDimension);
            _canvas.restore();
        },
        drawLine : function(startPoint, destPoint) {
            _canvas.save();
            _canvas.strokeStyle = "red";
            _canvas.lineWidth = 5;
            _canvas.beginPath();
            _canvas.moveTo(startPoint.getLeft(), startPoint.getTop());
            _canvas.lineTo(destPoint.getLeft(), destPoint.getTop());
            _canvas.closePath();
            _canvas.stroke();
            _canvas.restore();
        },
        drawBresenhamLine : function(startPoint, destPoint) {
            BresenhamLine(startPoint, destPoint, this).draw();
        },
        getTileDimension : function() {
            return _tileDimension;
        },
        drawCircle : function(center) {
            _canvas.save();
            _canvas.strokeStyle = "black";
            _canvas.fillStyle = "red";
            _canvas.lineWidth = 10;
            _canvas.beginPath();
            _canvas.arc(center.getLeft(), center.getTop(), Constants.Radius, 0, Math.PI * 2, true);
            _canvas.closePath();
            _canvas.stroke();
            _canvas.fill();
            _canvas.restore();
        },
    }
}

function BresenhamLine(startPoint, destPoint, graphics) {
    var _startPoint;
    var _destPoint;
    if( startPoint.getLeft() < destPoint.getLeft() ){
        _startPoint = startPoint;
        _destPoint = destPoint;
    } else {
        _startPoint = destPoint;
        _destPoint = startPoint;
    }
    
    var _graphics = graphics;
    
    function BresenhamAlgorithm() {
        var dy = _destPoint.getTop() - _startPoint.getTop();
        var dx = _destPoint.getLeft() - _startPoint.getLeft();
        if ( dx == 0 ) dx = Constants.EPS;
        var gradient = dy / dx;
        if ( Math.abs(gradient) > Constants.MaximumTiles ) gradient = Constants.MaximumTiles;
        var curRow = Math.floor(_startPoint.getTop() / _graphics.getTileDimension());
        var curCol = Math.floor(_startPoint.getLeft() / _graphics.getTileDimension());
        var error = 0;
        if (0 < gradient) {
            while (curCol * _graphics.getTileDimension() < _destPoint.getLeft()) {
                graphics.drawPoint(curCol, curRow);
                 if(gradient < 1) {
                    ++curCol;
                    error += gradient;
                    if(error > 0.5) {
                        ++curRow;
                        error -= 1;
                    }
                } else {
                    ++curRow;
                    error += 1/gradient;
                    if(error > 0.5) {
                        ++curCol;
                        error -= 1;
                    }
                }
            }
        } else {
            gradient *= -1;
            while (curCol * _graphics.getTileDimension() < _destPoint.getLeft()) {
                graphics.drawPoint(curCol, curRow);
                 if(gradient < 1) {
                    ++curCol;
                    error += gradient;
                    if(error > 0.5) {
                        --curRow;
                        error -= 1;
                    }
                } else {
                    --curRow;
                    error += 1/gradient;
                    if(error > 0.5) {
                        ++curCol;
                        error -= 1;
                    }
                }
            }
        }
    }
        
    return {
        draw : function() {
            BresenhamAlgorithm();
        },
    }
}

/* Test Body */
var firstCircle, secondCircle;
var BresenhamDemo;
var canvas;
var logicLoop;
document.addEventListener("DOMContentLoaded", function() {
    canvas = document.getElementById('display');
    BresenhamDemo = Graphics(canvas.getContext('2d'));
    firstCircle = {
        point: Point(20, 20),
        handleEvent : EventHandler,
    };
    secondCircle = {
        point: Point(400, 400),
        handleEvent : EventHandler,
    };
    logicLoop = setInterval(updateDisplay, 1000/60);
    canvasMouseDownHandlerInitializer();
});

function updateDisplay() {
    BresenhamDemo.clearCanvas();
    BresenhamDemo.drawBresenhamLine(firstCircle.point, secondCircle.point);
    BresenhamDemo.drawLine(firstCircle.point, secondCircle.point);
    BresenhamDemo.drawCircle(firstCircle.point);
    BresenhamDemo.drawCircle(secondCircle.point);
}

function canvasMouseDownHandlerInitializer() {
    canvas.addEventListener('mousedown', firstCircle);
    canvas.addEventListener('mousedown', secondCircle);
}

function EventHandler(e) {
    if (e.type == 'mousedown') {
        MouseClickHandler(e, this);
    } else if (e.type == 'mousemove') {
        MouseMoveHandler(e, this);
    } else if (e.type == 'mouseup') {
        MouseUpHandler(e, this);
    }
}

function MouseClickHandler(e, circle) {
    var mouseX = e.pageX - canvas.offsetLeft;
    var mouseY = e.pageY - canvas.offsetTop;
    var dx = (mouseX - circle.point.getLeft());
    var dy = (mouseY - circle.point.getTop());
    if( dx*dx + dy*dy < Constants.Radius * Constants.Radius ) {
        canvas.addEventListener('mousemove', circle);
        canvas.addEventListener('mouseup', circle);
    }
}

function MouseMoveHandler(e, circle) {
    var mouseX = e.pageX - canvas.offsetLeft;
    var mouseY = e.pageY - canvas.offsetTop;
    circle.point = Point(mouseX, mouseY);
}

function MouseUpHandler(e, circle) {
    canvas.removeEventListener('mousemove', circle);
    canvas.removeEventListener('mouseup', circle);
}
