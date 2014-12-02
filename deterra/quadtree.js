/* Destructible Terrain Test */

var constants = {
    minArea : 256,
    
    EMPTY : 0,
    DIRT : 1,
    infinity : 1e9,
};

var type = {
    EMPTY : {
        index : constants.EMPTY,
        color : "white",
        stroke : "white",
    },
    DIRT : {
        index : constants.DIRT,
        color : "black",
        stroke : "white",
    },
};

function QuadTree(width, height){
    this.root = new Node(0, 0, width, height, type.DIRT, this);
}

/* Only supports rectangular area insertion */
QuadTree.prototype.insert = function(x, y, width, height, type){
    this.root.modifyNode(x, y, width, height, type);
}

QuadTree.prototype.render = function(canvas) {
    this.root.renderNodes(canvas);
}

QuadTree.prototype.groundY = function(x, y, width, height) {
    return this.root.findDirtWithLowestYValue(x, y, width, height);
}

QuadTree.prototype.ceilingY = function(x, y, width, height) {
    return this.root.findDirtWithHighestYValue(x, y, width, height);
}

QuadTree.prototype.leftWallX = function(x, y, width, height) {
    return this.root.findDirtWithHighestXValue(x, y, width, height);
}

QuadTree.prototype.rightWallX = function(x, y, width, height) {
    return this.root.findDirtWithLowestXValue(x, y, width, height);
}

function Node(x, y, width, height, type, parent) {
    this.x = x;
    this.y = y;
    this.height = height;
    this.width = width;
    this.parent = parent;
    this.type = type;
    this.area = width * height;
    this.isLeaf = true;
    this.quadrant = [];
}

Node.prototype.modifyNode = function(x, y, width, height, type){
    if (this.isFullyContained(x, y, width, height)) {
        this.type = type;
        this.isLeaf = true;
        return;
    } else if (this.isFullyOutside(x, y, width, height)) {
        return;
    } else {
        if (this.area <= constants.minArea) return;
        if (this.isLeaf) {
            this.split();
        }
        this.modifyChildNodes(x, y, width, height, type);
    }
}

Node.prototype.isFullyContained = function(x, y, width, height) {
    return (x <= this.x && 
            x + width >= this.x + this.width  &&
            y <= this.y  &&
            y + height >= this.y + this.height);
}

Node.prototype.isFullyOutside = function(x, y, width, height) {
    return (this.x + this.width < x ||
            this.y + this.height < y ||
            x + width < this.x ||
            y + height < this.y);
}

Node.prototype.split = function() {
    this.quadrant = [];
    this.isLeaf = false;
    var childWidth = this.width/2;
    var childHeight = this.height/2;
    this.quadrant.push(new Node(this.x, this.y, childWidth, childHeight, this.type, this));
    this.quadrant.push(new Node(this.x + childWidth, this.y, childWidth, childHeight, this.type, this));
    this.quadrant.push(new Node(this.x, this.y + childHeight, childWidth, childHeight, this.type, this));
    this.quadrant.push(new Node(this.x + childWidth, this.y + childHeight, childWidth, childHeight, this.type, this));
}

Node.prototype.modifyChildNodes = function(x, y, width, height, type) {
    for (var i = 0; i < 4; ++i) {
        this.quadrant[i].modifyNode(x, y, width, height, type);
    }
    var sameType = true;
    for (var i = 1; i < 4; ++i) {
        if (!this.quadrant[i].isLeaf 
            || !this.quadrant[i-1].isLeaf
            || this.quadrant[i].type.index !== this.quadrant[i-1].type.index) {
            sameType = false;
            break;
        }
    }
    if (sameType) {
        this.mergeQuadrants();
    }
}

Node.prototype.mergeQuadrants = function() {
    this.type = this.quadrant[0].type;
    this.quadrant = [];
    this.isLeaf = true;
}

Node.prototype.renderNodes = function(canvas) {
    if (this.isLeaf) {
        this.renderSelf(canvas);
    } else {
        for (var i = 0; i < 4; ++i) {
            this.quadrant[i].renderNodes(canvas);
        }
    }
}

Node.prototype.renderSelf = function(canvas) {
    canvas.fillStyle = this.type.color;
    canvas.fillRect(this.x, this.y, this.width, this.height);
    canvas.strokeStyle = this.type.stroke;
    canvas.strokeRect(this.x, this.y, this.width, this.height);
}

Node.prototype.findDirtWithLowestYValue = function(x, y, w, h) {
    if (this.isFullyOutside(x, y, w, h)) {
        return constants.infinity;
    } 
    if (this.isFullyContained(x, y, w, h)) {
        if(this.isLeaf) {
            if(this.type.index === constants.DIRT) {
                return this.y;
            } else {
                return constants.infinity;
            }
        } else {
            for (var i = 0; i < 4; ++i) {
                return this.quadrant[i].findDirtWithLowestYValue(x, y, w, h);
            }
        }
    }
    var smallestY = constants.infinity;
    if (this.isLeaf) {
        if (this.type.index === constants.DIRT) {
            smallestY = this.y;
        } else {
            smallestY = constants.infinity;
        }
    } else {
        for (var i = 0; i < 4; ++i) {
            smallestY = Math.min(smallestY, this.quadrant[i].findDirtWithLowestYValue(x, y, w, h));
        }
    }
    return smallestY;
}

Node.prototype.findDirtWithHighestYValue = function(x, y, w, h) {
    if (this.isFullyOutside(x, y, w, h)) {
        return 0;
    } 
    if (this.isFullyContained(x, y, w, h)) {
        if(this.isLeaf) {
            if(this.type.index === constants.DIRT) {
                return this.y + this.height;
            } else {
                return 0;
            }
        } else {
            for (var i = 0; i < 4; ++i) {
                return this.quadrant[i].findDirtWithHighestYValue(x, y, w, h);
            }
        }
    }
    var highestY = 0;
    if (this.isLeaf) {
        if (this.type.index === constants.DIRT) {
            highestY = this.y + this.height;
        } else {
            highestY = 0;
        }
    } else {
        for (var i = 0; i < 4; ++i) {
            highestY = Math.max(highestY, this.quadrant[i].findDirtWithHighestYValue(x, y, w, h));
        }
    }
    return highestY;
}

Node.prototype.findDirtWithHighestXValue = function(x, y, w, h) {
    if (this.isFullyOutside(x, y, w, h)) {
        return 0;
    } 
    if (this.isFullyContained(x, y, w, h)) {
        if(this.isLeaf) {
            if(this.type.index === constants.DIRT) {
                return this.x + this.width;
            } else {
                return 0;
            }
        } else {
            for (var i = 0; i < 4; ++i) {
                return this.quadrant[i].findDirtWithHighestXValue(x, y, w, h);
            }
        }
    }
    var highestX = 0;
    if (this.isLeaf) {
        if (this.type.index === constants.DIRT) {
            highestX = this.x + this.width;
        } else {
            highestX = 0;
        }
    } else {
        for (var i = 0; i < 4; ++i) {
            highestX = Math.max(highestX, this.quadrant[i].findDirtWithHighestXValue(x, y, w, h));
        }
    }
    return highestX;
}

Node.prototype.findDirtWithLowestXValue = function(x, y, w, h) {
    if (this.isFullyOutside(x, y, w, h)) {
        return constants.infinity;
    } 
    if (this.isFullyContained(x, y, w, h)) {
        if(this.isLeaf) {
            if(this.type.index === constants.DIRT) {
                return this.x;
            } else {
                return constants.infinity;
            }
        } else {
            for (var i = 0; i < 4; ++i) {
                return this.quadrant[i].findDirtWithLowestXValue(x, y, w, h);
            }
        }
    }
    var lowestX = constants.infinity;
    if (this.isLeaf) {
        if (this.type.index === constants.DIRT) {
            lowestX = this.x;
        } else {
            lowestX = constants.infinity;
        }
    } else {
        for (var i = 0; i < 4; ++i) {
            lowestX = Math.min(lowestX, this.quadrant[i].findDirtWithLowestXValue(x, y, w, h));
        }
    }
    return lowestX;
}