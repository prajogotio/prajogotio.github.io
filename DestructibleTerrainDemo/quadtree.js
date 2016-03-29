/* Destructible Terrain Test */

var constants = {
    minArea : 8,
};

var type = {
    EMPTY : {
        index : 0,
        color : "white",
    },
    DIRT : {
        index : 1,
        color : "brown",
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
            x + width >= this.x + this.width &&
            y <= this.y &&
            y + height >= this.y + this.height);
}

Node.prototype.isFullyOutside = function(x, y, width, height) {
    return (this.x + this.width <= x ||
            this.y + this.height <= y ||
            x + width <= this.x ||
            y + height <= this.y);
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
    canvas.strokeStyle = "black";
    canvas.fillRect(this.x, this.y, this.width, this.height);
    canvas.strokeRect(this.x, this.y, this.width, this.height);
}

var canvas;
var qt;

document.addEventListener('DOMContentLoaded', function() {
    qt = new QuadTree(512, 512);
    canvas = document.getElementById('display');
    qt.render(canvas.getContext('2d'));
    canvas.addEventListener('mousedown', function(e) {
        empty(e);
        canvas.addEventListener('mousemove', empty);
        canvas.addEventListener('mouseup', function(){
            canvas.removeEventListener('mousemove', empty);
        });
    });
});

function empty(e) {
    var cx = Math.floor(e.pageX - canvas.offsetLeft);
    var cy = Math.floor(e.pageY - canvas.offsetTop);
    qt.insert(cx-16, cy-16, 32, 32, type.EMPTY);
    qt.render(canvas.getContext('2d'));
}