var SPAWN_RATE = 0.085;

var physics = {
    gravity : 0.266,
};

function Player(x, y) {
    this.x = x;
    this.y = y;
    this.width = 28;
    this.height = 50;
    this.color = "blue";
    this.speed = 3;
    this.upthrust = -5;
    this.velocity = {x : 0, y : 0};
    this.isJumping = false;
}

Player.prototype.renderSelf = function(canvas) {
    canvas.fillStyle = this.color;
    canvas.strokeStyle = "white";
    canvas.fillRect(this.x, this.y, this.width, this.height);
    canvas.strokeRect(this.x, this.y, this.width, this.height);
}

Player.prototype.jump = function() {
    if(this.isJumping) return;
    this.velocity.y = this.upthrust;
    this.isJumping = true;
}

Player.prototype.moveLeft = function() {
    this.velocity.x = -this.speed;
}

Player.prototype.moveRight = function() {
    this.velocity.x = this.speed;
}

Player.prototype.updatePosition = function() {
    this.collisionWithCeilings();
    this.collisionWithGround();
    
    this.x += this.velocity.x;
    this.collisionWithWall();
    this.velocity.x = 0;
    this.gravityEffect();
}

Player.prototype.gravityEffect = function() {
    this.velocity.y += physics.gravity;
}

Player.prototype.collisionWithWall = function() {
    var x;
    if(this.velocity.x === 0) return;
    if(this.velocity.x < 0) {
        x = qt.leftWallX(this.x, this.y, this.width, this.height * 0.88);
        //if(this.x + this.width < x) return;
        if(this.x < x) {
            this.x = x + 1;
            this.velocity.x = 0;
        }
    } else if(this.velocity.x >= 0) {
        x = qt.rightWallX(this.x, this.y, this.width, this.height * 0.88);
        //if(x + this.width < this.x) return;
        if(this.x + this.width > x) {
            this.x = x - this.width - 1;
            this.velocity.x = 0;
        }
    }
}

Player.prototype.collisionWithGround = function() {
    if(this.velocity.y < 0) return;
    var y = qt.groundY(this.x, this.y, this.width, this.height + this.velocity.y);
    if( y > this.y + 2*this.height + player.velocity.y) {
        this.isJumping = true;
    }
    if (y <= this.y + this.height*0.80 ) {
        this.velocity.y = 0;
        return;
    } else if (y <= this.y + 2*this.height + player.velocity.y) {
        this.velocity.y = 0;
        this.y = y - this.height;
        this.isJumping = false;
    } 
    this.y += this.velocity.y;
}

Player.prototype.collisionWithCeilings = function() {
    if (this.isJumping){
        var y = qt.ceilingY(this.x , this.y + this.velocity.y * 1000/60, this.width, this.height - this.velocity.y * 1000/60);
        if(this.y + this.height < y) {
            this.y += this.velocity.y;
            return;
        }
        if(y >= this.y + this.velocity.y) {
            this.y = y+1;
            this.velocity.y = 0;
        }
        this.y += this.velocity.y;
    }
}


var canvas;
var qt;
var player;
var loop;
var command = {};
var bomberList = [];
var start_button;
var time_score;
var timeStarted;

document.addEventListener('DOMContentLoaded', function() {
    start_button = document.getElementById("start_button");
    time_score = document.getElementById('time_score');
    start_button.addEventListener('mousedown', function() {
        start_button.style.setProperty('display', 'none');
        document.getElementById("instruction").style.setProperty('display', 'none');
        startGame();
    });
});

function startGame() {
    timeStarted = new Date();
    player = new Player(200, 150);
    qt = new QuadTree(1024, 640);
    qt.insert(0, 0, 1024, 320, type.EMPTY);
    bomberList = [];
    canvas = document.getElementById('display');
    //qt.render(canvas.getContext('2d'));
    //player.renderSelf(canvas.getContext('2d'));
    /*
    canvas.addEventListener('mousedown', function(e) {
        empty(e);
        canvas.addEventListener('mousemove', empty);
        canvas.addEventListener('mouseup', function(){
            canvas.removeEventListener('mousemove', empty);
        });
    });
    */
    document.addEventListener('keydown', function(e) {
        if(e.which === 37) {
            command['LEFT'] = true;
        }
        if(e.which === 38) {
            command['UP'] = true;
        }
        if(e.which === 39) {
            command['RIGHT'] = true;
        }
        if(e.which === 80) {
            clearInterval(loop);
        }
        if(e.which === 82) {
            player.x = 0;
            player.y = 0;
        }
    });
    document.addEventListener('keyup', function(e) {
        if(e.which === 37) {
            command['LEFT'] = false;
        }
        if(e.which === 39) {
            command['RIGHT'] = false;
        }
    });
    loop = setInterval(function(){
        logicLoop();
    }, 1000/60);
}

function empty(e) {
    var cx = Math.floor(e.x - canvas.offsetLeft);
    var cy = Math.floor(e.y - canvas.offsetTop);
    qt.insert(cx, cy, 64, 64, type.EMPTY);
}


function logicLoop() {
    commandHandler();
    playerUpdate();
    renderGame();
    enemyLogic();
}

function playerUpdate() {
    if(player.y > 700) return gameOver();
    time_score.innerHTML = (new Date() - timeStarted)/1000;
    
    player.updatePosition();
}

function renderGame(){
    qt.render(canvas.getContext('2d'));
    player.renderSelf(canvas.getContext('2d'));
    for(var i = 0; i < bomberList.length; ++i){
        bomberList[i].renderSelf(canvas.getContext('2d'));
    }
}

function commandHandler(){
    if(command['LEFT']){
        player.moveLeft();
    }
    
    if(command['UP']){
        player.jump();
        delete command['UP'];
    }
    
    if(command['RIGHT']){
        player.moveRight();
    } 
}

function enemyLogic(){
    if(Math.random() < SPAWN_RATE) {
        bomberList.push(new Bomber(Math.random() * 1024, 0));
    }
    var curTime = new Date();
    for(var i = 0; i < bomberList.length; ++i){
        bomberList[i].update(curTime);
    }
    var numOfDeadBombers = 0;
    for(var i = 0; i < bomberList.length; ++i){
        if(bomberList[i].isDead()){
            ++numOfDeadBombers;
        } else break;
    }
    bomberList.splice(0, numOfDeadBombers);
}

function Bomber(x, y){
    this.spawnTime = new Date();
    this.x = x;
    this.y = y;
    this.width = 30;
    this.height = 70;
    this.color = "red";
    this.speed = 1.4;
    this.upthrust = -5;
    this.velocity = {x : 0, y : 0};
    this.isJumping = false;
    this.timeAlive = 2000;
    this.dead = false;
    this.radius = 100;
}

Bomber.prototype = Player.prototype;

Bomber.prototype.randomLogic = function() {
    var randomIndicator = Math.random();
    if(randomIndicator < 0.33) this.moveLeft();
    else if(randomIndicator > 0.66) this.moveRight();
    if(Math.random() < 0.03) this.jump();
}

Bomber.prototype.timeIsUp = function(curTime) {
    return (curTime - this.spawnTime > this.timeAlive);
}

Bomber.prototype.tryExplode = function(curTime) {
    if(this.timeIsUp(curTime)){
        this.removeSurroundingGround();
        this.dead = true;
    }
}

Bomber.prototype.isDead = function(){
    return this.dead;
}

Bomber.prototype.update = function(curTime){
    if(this.y > 700) {
        this.dead = true;
        return;
    }
    this.tryExplode(curTime);
    this.randomLogic();
    this.updatePosition();
}

Bomber.prototype.removeSurroundingGround = function(){
    qt.insert(this.x - this.radius/2, this.y + this.height, this.radius, this.radius, type.EMPTY);
}

function gameOver(){
    start_button.innerHTML = "Game OVER! Time alive: " + time_score.innerHTML + "<br> Click here to Restart";
    start_button.style.setProperty('display', 'block');
    clearInterval(loop);
}