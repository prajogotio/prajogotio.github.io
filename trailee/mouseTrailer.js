var TRAIL_NODE_SPEED = 1.5;
var TRAIL_NODE_DELAY = 28;         // In milliseconds
var EPS = 1e-12;

function TrailNode(left, top, parentNode) {
    this.left = left;
    this.top = top;
    this.parentNode = parentNode;
    this.speed = TRAIL_NODE_SPEED;
    this.delay = TRAIL_NODE_DELAY;
    this.isMoving = false;
    this.isPreparedToMove = false;
}

TrailNode.prototype.getNextNode = function() {
    return this.nextNode;
}

TrailNode.prototype.setNextNode = function(nextNode) {
    this.nextNode = nextNode;
}

TrailNode.prototype.updatePosition = function() {
    ctr++;
    if(this.isMoving) {
        this.moveToParent();
        if(this.isParentDisplaced() === false) {
            this.stopMoving();
        }
    } else if (this.isParentDisplaced()) {
        this.timeWhenParentDisplaced = new Date();
        this.isMoving = true;
    }
    this.getNextNode().updatePosition();
}

TrailNode.prototype.stopMoving = function() {
    this.isMoving = false;
    this.isPreparedToMove = false;
}

TrailNode.prototype.moveToParent = function() {
    if(this.isReadyToMove()) {
        this.approachParentVertically();
        this.approachParentHorizontally();
    }
}

TrailNode.prototype.approachParentHorizontally = function() {
    var deltaLeft = this.parentNode.getLeft() - this.getLeft();
    if(deltaLeft > 0) deltaLeft = Math.min(deltaLeft, this.approachSpeed(deltaLeft));
    else deltaLeft = Math.max(deltaLeft, -this.approachSpeed(deltaLeft));
    this.setLeft(this.getLeft() + deltaLeft);
}

TrailNode.prototype.approachParentVertically = function() {
    var deltaTop = this.parentNode.getTop() - this.getTop();
    if(deltaTop > 0) deltaTop = Math.min(deltaTop, this.approachSpeed(deltaTop));
    else deltaTop = Math.max(deltaTop, -this.approachSpeed(deltaTop));
    this.setTop(this.getTop() + deltaTop);
}

TrailNode.prototype.approachSpeed = function(delta) {
    return delta * delta / (TRAIL_NODE_DELAY * TRAIL_NODE_DELAY);
}

TrailNode.prototype.isParentDisplaced = function() {
    return (Math.abs(this.parentNode.getLeft() - this.getLeft()) > EPS
         || Math.abs(this.parentNode.getTop() - this.getTop()) > EPS);
}

TrailNode.prototype.isReadyToMove = function() {
    if (this.isPreparedToMove) return true;
    var now = new Date();
    if (now - this.timeWhenParentDisplaced > this.delay) {
        this.isPreparedToMove = true;
        return true;
    } else {
        return false;
    }
}

TrailNode.prototype.getLeft = function() {
    return this.left;
}

TrailNode.prototype.getTop = function() {
    return this.top;
}

TrailNode.prototype.setLeft = function(left) {
    this.left = left;
}

TrailNode.prototype.setTop = function(top){
    this.top = top;
}

function NullTrailNode() {
}

NullTrailNode.prototype.updatePosition = function() {
    // NOP
}

function MousePointer(left, top) {
    this.left = left;
    this.top = top;
}

MousePointer.prototype.getTop = function() {
    return this.top;
}

MousePointer.prototype.getLeft = function() {
    return this.left;
}

MousePointer.prototype.setPosition = function(left, top) {
    this.left = left;
    this.top = top;
}

function MouseTrailer(mousePointer, renderableObject, length) {
    this.renderableObject = renderableObject;
    this.mousePointer = mousePointer;
    this.length = length;
    this.head = new RenderableDecorator(this.renderableObject, new TrailNode(mousePointer.getLeft(), mousePointer.getTop(), mousePointer));
    this.initializeTrailer();
}

MouseTrailer.prototype.initializeTrailer = function() {
    var counter = 1;
    var currentNode = this.head;
    while (counter < this.length) {
        currentNode.setNextNode(new RenderableDecorator(this.renderableObject, new TrailNode(currentNode.getLeft(), currentNode.getTop(), currentNode)));
        currentNode = currentNode.getNextNode();
        ++counter;
    }
    currentNode.setNextNode(new NullTrailNode());
}

MouseTrailer.prototype.update = function() {
    ctr = 0;
    this.head.updatePosition();
}

function RenderableDecorator(renderableObject, trailNode) {
    this.trailNode = trailNode;
    this.renderableObject = renderableObject;
}

RenderableDecorator.prototype.updatePosition = function() {
    this.renderSelf();
    this.trailNode.updatePosition();
}

RenderableDecorator.prototype.getNextNode = function() {
    return this.trailNode.getNextNode();
}

RenderableDecorator.prototype.setNextNode = function(nextNode) {
    this.trailNode.setNextNode(nextNode);
}

RenderableDecorator.prototype.getLeft = function() {
    return this.trailNode.getLeft();
}

RenderableDecorator.prototype.getTop = function() {
    return this.trailNode.getTop();
}

RenderableDecorator.prototype.setTop = function(top) {
    this.trailNode.setTop(top);
}

RenderableDecorator.prototype.setLeft = function(left) {
    this.trailNode.setLeft(left);
}

RenderableDecorator.prototype.renderSelf = function() {
    this.renderableObject.renderAtPosition(this.getLeft(), this.getTop());
}

