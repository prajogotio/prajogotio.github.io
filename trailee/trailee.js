var display;
var mouseTrailer;
var mousePointer;
var trailee;
var trailingLoop;
var ctr = 0;
var buffer;
function Trailee(graphics) {
    this.graphics = graphics;
    this.initializeBuffer();
}

Trailee.prototype.initializeBuffer = function() {
    var g = buffer.getContext('2d');
    buffer.width = 300;
    buffer.height = 300;
    g.strokeStyle = "white";
    g.lineWidth = 1.2;
    g.moveTo(100, 100);
    g.bezierCurveTo(50, 87, 50, 160, 100, 120);
    g.moveTo(100, 100);
    g.bezierCurveTo(150, 87, 150, 160, 100, 120);
    g.stroke();
}

Trailee.prototype.renderAtPosition = function(left, top) {
    //change to the shape i want later
    //this.graphics.strokeStyle = "white";
    //this.graphics.arc(left, top, 25, 0, Math.PI * 2);
    //this.graphics.stroke();
    //this.graphics.strokeStyle = "white";
    //this.graphics.strokeRect(left - 15, top - 15, 30, 30);
    this.graphics.drawImage(buffer, 50, 87, 100, 73, left - 50, top - 20, 100, 73);
}

document.addEventListener("DOMContentLoaded", function(e) {
    display = document.getElementById('display');
    buffer = document.createElement('canvas');
    mousePointer = new MousePointer(512, 320);
    trailee = new Trailee(display.getContext('2d'));
    mouseTrailer = new MouseTrailer(mousePointer, trailee, 20);
    startTrailing();
});

function startTrailing() {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("keydown", handleKeyDown);
    trailingLoop = setInterval(function() {
        display.getContext('2d').fillStyle = "black";
        display.getContext('2d').fillRect(0, 0, 1024, 640);
        mouseTrailer.update();
    }, 1000/60);
}

function handleMouseMove(e) {
    mousePointer.setPosition(e.pageX - display.offsetLeft, e.pageY - display.offsetTop);
}

function handleKeyDown(e) {
    if (e.which == 80) {
        clearInterval(trailingLoop);
    }
}