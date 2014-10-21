var Map = {
    data : [],
    cell : function(row, col) {
        return this.data[this.dim * row + col];
    },
    dim : 32,
    tile : {
        length : 64,
    },
    wall : {
        height : 32,
    },
    INF : 1000000000,
    generateMap : function() {
        for (var i = 0; i < this.dim * this.dim; ++i) {
            if( Math.random() > 0.9 ) this.data.push(1);
            else this.data.push(0);
        }
    },
};

var Screen = {
    height : 400,
    width : 640,
    FOV : 60,
};

function Point(_x, _y) {
    return {
        x : _x,
        y : _y,
    };
}

function RayCast(g) {
    var graphics = g;
    var delta = Screen.FOV/Screen.width;
    var distToScreen = Screen.width / (2 * tangent(Screen.FOV/2));
    var alpha;
    
    function rayCast(pos, curAlpha) {
        alpha = curAlpha;
        var beta = Math.floor(alpha - Screen.FOV/2);
        for (var column = 0; column < Screen.width; ++column) {
            var orientation = beta;
            if (orientation < 0) orientation += 360;
            if (orientation >= 360) orientation -= 360;
            orientation = orientation;
            renderWallIntersection(pos, orientation, column);
            beta += delta;
        }
    }
    
    function renderWallIntersection(pos, beta, column) {
        var distToWall = findIntersectionDist(pos, beta);
        var wallHeight = Math.floor(Map.wall.height * distToScreen / distToWall);
        //console.log(beta, distToWall);
        graphics.bufferVerticalLine(column, wallHeight, distToWall);
    }
    
    function findIntersectionDist(pos, beta) {
        var hCross = findHorizontalIntersection(pos, beta);
        var vCross = findVerticalIntersection(pos, beta);
        //console.log(hCross, vCross);
        return Math.min(distance(pos, hCross), distance(pos, vCross)) * Math.abs(cosine(alpha - beta));
    }
    
    function findHorizontalIntersection(pos, beta) {
        var curPos;
        var tilePos = getPositionRelativeToTile(pos);
        var pX = tilePos.x, pY = tilePos.y, qX = Map.tile.length - pX, qY = Map.tile.length - pY;
        var dX, dY;
        if (beta === 90 || beta === 270) {
            return Point(Map.INF, Map.INF);
        }
        if ((beta < 90) || (270 < beta) ) {
            dX = Map.tile.length;
            dY = dX * tangent(beta);
            curPos = Point(pos.x + qX + 1, pos.y + qX * tangent(beta));
        } else {
            dX = -Map.tile.length;
            dY = dX * tangent(beta);
            curPos = Point(pos.x - pX - 1, pos.y + -pX * tangent(beta));
        }
        while ( true ) {
            var curGridCoor = getGridCoor(curPos);
            var curRow = curGridCoor.x;
            var curCol = curGridCoor.y;
            //console.log(curRow, curCol);
            if (curRow < 0 || curRow >= Map.dim || curCol < 0 || curCol >= Map.dim) {
                return Point(Map.INF, Map.INF);
            }
            if (Map.cell(curRow, curCol) === 1) {
                return Point(curPos.x, curPos.y);
            }
            curPos.x += dX;
            curPos.y += dY;
        }
    }
    
    function findVerticalIntersection(pos, beta) {
        var curPos;
        var tilePos = getPositionRelativeToTile(pos);
        var pX = tilePos.x, pY = tilePos.y, qX = Map.tile.length - pX, qY = Map.tile.length - pY;
        var dX, dY;
        if (beta === 0 || beta === 180) {
            return Point(Map.INF, Map.INF);
        }
        if (beta < 180) {
            dY = Map.tile.length;
            dX = dY / tangent(beta);
            curPos = Point(pos.x + (qY / tangent(beta)), pos.y + qY + 1);
        } else {
            dY = -Map.tile.length;
            dX = dY / tangent(beta);
            curPos = Point(pos.x + (-pY / tangent(beta)) , pos.y - pY - 1);
        }
        while ( true ) {
            var curGridCoor = getGridCoor(curPos);
            var curRow = curGridCoor.x;
            var curCol = curGridCoor.y;
            if (curRow < 0 || curRow >= Map.dim || curCol < 0 || curCol >= Map.dim) {
                return Point(Map.INF, Map.INF);
            }
            if (Map.cell(curRow, curCol) === 1) {
                return Point(curPos.x, curPos.y);
            }
            curPos.x += dX;
            curPos.y += dY;
        }
    }
    
    function getPositionRelativeToTile(pos) {
        var gridCoor = getGridCoor(pos);
        return Point(pos.x - Map.tile.length * gridCoor.x, pos.y - Map.tile.length * gridCoor.y);
    }
    
    function getGridCoor(pos) {
        var row = Math.floor(pos.y / Map.tile.length);
        var col = Math.floor(pos.x / Map.tile.length);
        return Point(col, row);
    }
    
    
    function distance(pos1, pos2) {
        var dx = pos1.x - pos2.x;
        var dy = pos1.y - pos2.y;
        return Math.sqrt(dx*dx + dy*dy);
    }
    
    function tangent(degree) {
        //degree = degree - 360 * Math.floor(degree/360);
        //if(degree > 180) degree -= 360;
        return Math.tan(degree/180 * Math.PI);
    }
    
    function cosine(degree) {
        //degree = degree - 360 * Math.floor(degree/360);
        //if(degree > 180) degree -= 360;
        return Math.cos(degree/180 * Math.PI);
    }
    
    return {
        display : function(pos, alpha) {
            graphics.startBuffer();
            rayCast(pos, alpha);
            graphics.flushBuffer();
        },
    };
}

function Graphics(canvas) {
    var g = canvas;
    var curPixelArray;
    return {
        startBuffer: function(){
            curPixelArray = g.createImageData(Screen.width, Screen.height);
        },
        bufferVerticalLine : function(column, height, distance) {
            var horizon = Screen.height/2;
            for (var row = Math.floor(Math.max(0,horizon - height/2)); row < Math.floor(Math.min(Screen.height, horizon + height/2)); ++row) {
                var curPix = row * Screen.width * 4 + column * 4;
                curPixelArray.data[curPix] = Math.max(0, 190 * (900-distance)/100);
                curPixelArray.data[curPix+1] = Math.max(0, 20 * (800-distance)/100);
                curPixelArray.data[curPix+2] = 0;
                curPixelArray.data[curPix+3] = Math.min(255, 255 * distance/200);
            }
            
        },
        flushBuffer : function() {
            g.putImageData(curPixelArray, 0, 0);
        },
    };
}

var player = {
    orient : 0,
    pos : Point(96, 96),
    handleEvent : function(e) {
        if(e.type == 'keydown') {
            if (e.which == 37){
                this.orient--;
                if(this.orient < 0) orient = 35;
            }
            if(e.which == 39) {
                this.orient++;
                if(this.orient > 35) this.orient = 0;
            }
            if(e.which == 38) {
                this.pos.x += 13 * Math.cos(this.orient/18 * Math.PI);
                this.pos.y += 13 * Math.sin(this.orient/18 * Math.PI);
            }
            raycast.display(this.pos, 10*this.orient);
        }
    },
}


var raycast;

document.addEventListener("DOMContentLoaded", function() {
    Map.generateMap();
    var ctx = document.getElementById('display').getContext('2d');
    var bg = document.getElementById('bg').getContext('2d');
    var BG = bg.createImageData(Screen.width, Screen.height);
    for (var row = 0; row < Screen.height; ++row) {
        for (var col = 0; col < Screen.width; ++col) {
            if (row > Screen.height/2) {
                BG.data[row*Screen.width*4 + 4*col + 0] = 20;
                BG.data[row*Screen.width*4 + 4*col + 1] = 210;
                BG.data[row*Screen.width*4 + 4*col + 2] = 20;
                BG.data[row*Screen.width*4 + 4*col + 3] = 255*(row-240)/240;
            } else {
                BG.data[row*Screen.width*4 + 4*col + 0] = 102;
                BG.data[row*Screen.width*4 + 4*col + 1] = 220;
                BG.data[row*Screen.width*4 + 4*col + 2] = 220;
                BG.data[row*Screen.width*4 + 4*col + 3] = 255*(480-row)/480;
            }                
        } 
    }
    bg.putImageData(BG, 0, 0);
    var graphics = Graphics(ctx);
    raycast = RayCast(graphics);
    raycast.display(player.pos, 10*player.orient);
    document.addEventListener("keydown", player);
});

