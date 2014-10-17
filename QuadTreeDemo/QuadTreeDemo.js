/* Let's try Module Pattern here! */

var Constants = {
    CANVAS_WIDTH : 640,
    CANVAS_HEIGHT : 480,
    POINT_RADIUS : 5,
    POINT_SPEED : 3,
    QUADRANT_MINIMUM_AREA : 400,
};

/* Class definition using module pattern (the open type) */
function Points(left, top) {
    var _left = left;
    var _top = top;
    var _radius = Constants.POINT_RADIUS;
    var _movementVector = { deltaLeft : 0, deltaTop : 0 };
    
    return {
        getLeft : function() {
            return _left;
        },
        getTop : function() {
            return _top;
        },
        setMovementVector : function(deltaLeft, deltaTop) {
            _movementVector.deltaLeft = deltaLeft;
            _movementVector.deltaTop = deltaTop;
        },
        move : function() {
            _left += _movementVector.deltaLeft;
            _top += _movementVector.deltaTop;
            this.handleBorderCollision();
        },
        drawSelf : function(canvas) {
            canvas.save();
            canvas.fillStyle = "red";
            canvas.beginPath();
            canvas.arc(_left, _top, _radius, 0, Math.PI*2, true);
            canvas.closePath();
            canvas.fill();
            canvas.restore();
        },
        handleBorderCollision : function() {
            if (_left <= 0 || _left >= Constants.CANVAS_WIDTH) {
                _movementVector.deltaLeft *= -1;
            }
            if (_top <= 0 || _top >= Constants.CANVAS_HEIGHT) {
                _movementVector.deltaTop *= -1;
            }
        },
    };
}

function PointContainer() {
    var _points = [];
    var _size = 0;
    
    return {
        getIndex : function(index) {
            return _points[index];
        },
        insertPoint : function(point) {
            _points[_size] = point;
            ++_size;
        },
        drawElements : function(canvas) {
            for (var index = 0; index < _size; ++index) {
                _points[index].drawSelf(canvas);
            }
        },
        getSize : function() {
            return _size;
        },
        updateElements : function() {
            for (var index = 0; index < _size; ++index) {
                _points[index].move();
            }
        },
    };
}

function Quadrant(left, top, width, height, context) {
    /* Private Variables and Constructor */
    var _top = top;
    var _left = left;
    var _width = width;
    var _height = height;
    var _pointContainer = PointContainer();
    var _canvas = context;
    var _quadrant = [];
    
    drawBorder();
    
    /* Private Functions */
    
    function drawBorder() {
        _canvas.save();
        _canvas.strokeStyle = "black";
        _canvas.strokeRect(_left, _top, _width, _height);
        _canvas.restore();
    }
    
    function splitToQuadrants() {
        if ( containsAtMostOnePoint() ) return;
        if ( isTooSmall() ) {
            highlightSelf();
            return;
        }
        initializeQuadrants();
        classifyElementsToRespectiveQuadrants();
        continueSplitOnQuadrants();
    }
    
    function containsAtMostOnePoint() {
        return _pointContainer.getSize() <= 1;
    }
    
    function isTooSmall() {
        return _width * _height <= Constants.QUADRANT_MINIMUM_AREA;
    }
    
    function highlightSelf() {
        _canvas.save();
        _canvas.strokeStyle = "red";
        _canvas.lineWidth = 8;
        _canvas.strokeRect(_left, _top, _width, _height);
        _canvas.restore();
    }
        
    function initializeQuadrants() {
        midWidth = _width/2;
        midHeight = _height/2;
        _quadrant.push(Quadrant(_left, _top, midWidth, midHeight, _canvas));
        _quadrant.push(Quadrant(_left + midWidth, _top, midWidth, midHeight, _canvas));
        _quadrant.push(Quadrant(_left, _top + midHeight, midWidth, midHeight, _canvas));
        _quadrant.push(Quadrant(_left + midWidth, _top + midHeight, midWidth, midHeight, _canvas));
    }
    
    function classifyElementsToRespectiveQuadrants() {
        for (var index = 0; index < _pointContainer.getSize(); ++index) {
            for (var qindex = 0; qindex < 4; ++qindex) {
                if (_quadrant[qindex].containsPoint(_pointContainer.getIndex(index))) {
                    _quadrant[qindex].insertIntoPointContainer(_pointContainer.getIndex(index));
                    break;
                }
            }
        }
    }
    
    function continueSplitOnQuadrants() {
        for (var qindex = 0; qindex < 4; ++qindex) {
            _quadrant[qindex].split();
        }
    }
    
    return {
        /* Public Function */
        split : function() {
            splitToQuadrants();
        },
        insertIntoPointContainer : function(point) {
            _pointContainer.insertPoint(point);
        },
        drawElements : function() {
            _canvas.save();
            _canvas.fillStyle = "white";
            _canvas.fillRect(_left, _top, _width, _height);
            _pointContainer.drawElements(_canvas);
            _canvas.restore();
        },
        containsPoint : function(point) {
            if (_left <= point.getLeft() && point.getLeft() <= _left + _width) {
                if(_top <= point.getTop() && point.getTop() <= _top + _height) {
                    return true;
                }
            }
            return false;
        },
        clearQuadrants : function() {
            _quadrant = [];
        },
        updateElements : function() {
            _pointContainer.updateElements();
        },
    };
}
