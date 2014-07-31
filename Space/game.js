var ASSET_MANAGER = new AssetManager();
var player = {};
var enemy = {};
var background = {};
var explosion = {};
var ship_ctx = {};
var bullet_ctx = {};
var bg_ctx = {};
var enemy_ctx = {};
var scoreBoard = {};
var statusBoard = {};
var gameStarted = false;
//asset
const SHIP_PNG = 'ship.png';
const WEAPON_PNG = 'weapon.png';
const BG_GIF = 'bg.gif';
const ENEMY_PNG = 'enemy.png';
const EXPLOSION_PNG = 'explosion.png';

//canvas
const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 600;

//init ship
const SHIP_INIT_X = 200;
const SHIP_INIT_Y = 120;
const SHIP_SRC_X = 47;
const SHIP_SRC_Y = 140;
const SHIP_SRC_WIDTH = 24;
const SHIP_SRC_HEIGHT = 27;
const SHIP_WIDTH = 48;
const SHIP_HEIGHT = 50;

//ship property
const SHIP_SPEED = 4;


const HEIGHT_LIMIT = 200;

//weapon
const BULLET_SRC_X = 61;  
const BULLET_SRC_Y = 99;
const BULLET_SRC_WIDTH = 12;
const BULLET_SRC_HEIGHT = 22;

const BULLET_WIDTH = 19;
const BULLET_HEIGHT = 22;

const BULLET_SPEED = 8;
const BULLET_RATE = 1000;

//bg
const BG_SRC_WIDTH = 640;
const BG_SRC_HEIGHT = 610;
const BG_SPEED = 3;

//ENEMY
const ENEMY_SRC_WIDTH = 87;
const ENEMY_SRC_HEIGHT = 52;
const ENEMY_WIDTH = 87;
const ENEMY_HEIGHT = 52;
const ENEMY_SPEED = 1;
const SPAWN_RATE = 2000;
const ENEMY_ATTACK_RATE = 1000;
const ENEMY_ATTACK_PROB = 0.01;

const ENEMY_BULLET_SRC_X = 38;
const ENEMY_BULLET_SRC_Y = 0;
const ENEMY_BULLET_SRC_WIDTH = 10;
const ENEMY_BULLET_SRC_HEIGHT = 10;
const ENEMY_BULLET_WIDTH = 15;
const ENEMY_BULLET_HEIGHT = 15;
const ENEMY_BULLET_SPEED = 2;

//explosion
const EXPLOSION_SRC_X = 2;
const EXPLOSION_SRC_Y = 2;
const EXPLOSION_SRC_WIDTH = 12;
const EXPLOSION_SRC_HEIGHT = 28;
const EXPLOSION_WIDTH = 43;
const EXPLOSION_HEIGHT = 59;
const EXPLOSION_ANIM_RATE = 100;
const EXPLOSTION_MAX_FRAME = 13;
//animation
const FPS = 60;

//key
const KEY_LEFT = 37;
const KEY_UP = 38;
const KEY_RIGHT = 39;
const KEY_DOWN = 40;
const KEY_SPACE = 32;

ASSET_MANAGER.pushAsset(SHIP_PNG);
ASSET_MANAGER.pushAsset(WEAPON_PNG);
ASSET_MANAGER.pushAsset(BG_GIF);
ASSET_MANAGER.pushAsset(ENEMY_PNG);
ASSET_MANAGER.pushAsset(EXPLOSION_PNG);
ASSET_MANAGER.downloadAll(startGame);


function startGame(){
	//Init
	player = new Player();
	enemy = new Enemy();
	background = new Background();
	explosion = new Explosion();

	ship_ctx = document.getElementById("ship_display").getContext("2d");
	bullet_ctx = document.getElementById("bullet_display").getContext("2d");
	bg_ctx = document.getElementById("bg_display").getContext("2d");
	enemy_ctx = document.getElementById("enemy_display").getContext("2d");

	scoreBoard = document.getElementById("score");
	statusBoard = document.getElementById("state");
	statusBoard.innerHTML = "PRESS ANY KEY TO START GAME";
	//Input handler
	addEventListener("keydown", function(e){
		startTrigger();
		player.command.addCommand(e.which);
	}, false);
	addEventListener("keyup", function(e){
		player.command.deleteCommand(e.which, player.deleteCommandCallback);
	}, false);
}

function startTrigger(){
	if(gameStarted) return;
	//Game Loop
	setInterval(main, 1000/FPS);
	statusBoard.innerHTML = "";
	gameStarted = true;
}

function main(){
	scoreBoard.innerHTML = player.score;
	collisionHandler();
	if (!player.isDead) update();
	render();
	if(player.isDead){
		statusBoard.innerHTML = "GAME OVER";
		statusBoard.style.setProperty("color", "white");
	}
}

function update(){
	player.command.handleCommand();
	player.bullet.update();
	background.update();
	enemy.update();
}

function render(){
	ship_ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	bullet_ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	enemy_ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	if(!player.isDead) player.ship.render();
	player.bullet.render();
	background.render();
	enemy.render();
	explosion.render();
}

function Ship(){
	this.x = SHIP_INIT_X;
	this.y = SHIP_INIT_Y;

	this.velocity = SHIP_SPEED;

	this.renderable = new Renderable();
	this.renderable.setAsset(SHIP_SRC_X, SHIP_SRC_Y, SHIP_SRC_WIDTH, SHIP_SRC_HEIGHT, ASSET_MANAGER.getAsset(SHIP_PNG) );
	this.renderable.initialize(SHIP_INIT_X, CANVAS_HEIGHT - SHIP_INIT_Y, SHIP_WIDTH, SHIP_HEIGHT, document.getElementById("ship_display").getContext("2d") );
}

Ship.prototype.render = function(){

	this.renderable.update(this.x, CANVAS_HEIGHT - this.y); 
	this.renderable.render();
}

Ship.prototype.update = function(x, y){
	this.x = x;
	this.y = y;
}

Ship.prototype.straightenUp = function(){
	this.renderable.switchFrame(SHIP_SRC_X, SHIP_SRC_Y);
}

Ship.prototype.tiltLeft = function(){
	this.renderable.switchFrame(SHIP_SRC_X - SHIP_SRC_WIDTH, SHIP_SRC_Y);
}

Ship.prototype.tiltRight = function(){
	this.renderable.switchFrame(SHIP_SRC_X + SHIP_SRC_WIDTH, SHIP_SRC_Y);
}

function Bullet(){
	this.bulletQueue = [];
	this.velocity = BULLET_SPEED;
	this.renderable = new Renderable();
	this.renderable.setAsset(BULLET_SRC_X, BULLET_SRC_Y, BULLET_SRC_WIDTH, BULLET_SRC_HEIGHT, ASSET_MANAGER.getAsset(WEAPON_PNG) );
	this.renderable.initialize(0, 0, BULLET_WIDTH, BULLET_HEIGHT, document.getElementById("bullet_display").getContext("2d") );
	this.lastFire = Date.now();
}

Bullet.prototype.fire = function(init_x, init_y){
	var curTime = Date.now();
	if(curTime - this.lastFire < BULLET_RATE) return;
	this.lastFire = curTime;
	this.bulletQueue.push({x : init_x, y : init_y});
}

Bullet.prototype.update = function(){
	if(this.bulletQueue.length === 0) return;
	for( var i = 0; i < this.bulletQueue.length; ++i){
		this.bulletQueue[i].y += this.velocity;
	}
	if(this.bulletQueue[0].y > CANVAS_HEIGHT) this.bulletQueue.splice(0,1);
}

Bullet.prototype.render = function(){
	if(this.bulletQueue.length === 0) return;
	for( var i = 0; i < this.bulletQueue.length; ++i){
		this.renderable.update(this.bulletQueue[i].x, CANVAS_HEIGHT - this.bulletQueue[i].y);
		this.renderable.render();
		this.renderable.update(this.bulletQueue[i].x + SHIP_WIDTH - BULLET_WIDTH, CANVAS_HEIGHT - this.bulletQueue[i].y);
		this.renderable.render();
	}
}

function Background(){
	this.x = 0;
	this.y = CANVAS_HEIGHT;

	this.renderable = new Renderable();
	this.renderable.setAsset(0, 0, BG_SRC_WIDTH, BG_SRC_HEIGHT, ASSET_MANAGER.getAsset(BG_GIF) );
	this.renderable.initialize(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, document.getElementById("bg_display").getContext("2d") );
}

Background.prototype.update = function(){
	this.y -= BG_SPEED;
	if(this.y < 0) this.y = CANVAS_HEIGHT;
}

Background.prototype.render = function(){
	this.renderable.update(this.x, CANVAS_HEIGHT - this.y);
	this.renderable.render();
	this.renderable.update(this.x, -this.y);
	this.renderable.render();
}

//Player composes of all objects defining a player
function Player(){
	this.ship = new Ship();
	this.bullet = new Bullet();
	this.command = new Command();

	this.isDead = false;

	this.score = 0;

	this.deleteCommandCallback = function(){
		checkState();
	}

	var self = this;

	var shipMoveDown = function(){
		self.ship.y -= self.ship.velocity;
		inBound();
	}

	var shipMoveUp = function(){
		self.ship.y += self.ship.velocity;
		inBound();
	}

	var shipMoveLeft = function(){
		self.ship.x -= self.ship.velocity;
		self.ship.tiltLeft();
		inBound();
	}

	var shipMoveRight = function(){
		self.ship.x += self.ship.velocity;
		self.ship.tiltRight();
		inBound();
	}

	var fireBullet = function(){
		self.bullet.fire(self.ship.x, self.ship.y);
	}

	var checkState = function(){
		if(self.command.commandSet[KEY_LEFT] === undefined && self.command.commandSet[KEY_RIGHT] === undefined){
			self.ship.straightenUp();
		}
	}

	var inBound = function(){
		if(self.ship.x < 0) self.ship.x = 0;
		if(self.ship.y < SHIP_HEIGHT) self.ship.y = SHIP_HEIGHT;
		if(self.ship.x > CANVAS_WIDTH - SHIP_WIDTH) self.ship.x = CANVAS_WIDTH - SHIP_WIDTH;
		if(self.ship.y > HEIGHT_LIMIT) self.ship.y = HEIGHT_LIMIT;
	}
	this.command.setHandle(KEY_SPACE, fireBullet);
	this.command.setHandle(KEY_DOWN, shipMoveDown);
	this.command.setHandle(KEY_UP, shipMoveUp);
	this.command.setHandle(KEY_RIGHT, shipMoveRight);
	this.command.setHandle(KEY_LEFT, shipMoveLeft);
}

function Enemy(){
	this.enemyList = [];
	this.enemyBullet = [];
	this.lastSpawn = Date.now();
	this.velocity = ENEMY_SPEED;

	this.renderable = new Renderable();
	this.renderable.setAsset(0, 0, ENEMY_SRC_WIDTH, ENEMY_SRC_HEIGHT, ASSET_MANAGER.getAsset(ENEMY_PNG) );
	this.renderable.initialize(0, 0, ENEMY_WIDTH, ENEMY_HEIGHT, document.getElementById("enemy_display").getContext("2d") );

	this.bullet = new Renderable();
	this.bullet.setAsset(ENEMY_BULLET_SRC_X, ENEMY_BULLET_SRC_Y, ENEMY_BULLET_SRC_WIDTH, ENEMY_BULLET_SRC_HEIGHT, ASSET_MANAGER.getAsset(WEAPON_PNG) );
	this.bullet.initialize(0, 0, ENEMY_BULLET_WIDTH, ENEMY_BULLET_HEIGHT, document.getElementById("bullet_display").getContext("2d") );
}

Enemy.prototype.update = function(){
	this.spawn();
	this.move();
	this.fire();
	this.updateBullet();
}

Enemy.prototype.spawn = function(){
	var curTime = Date.now();
	if(curTime - this.lastSpawn < SPAWN_RATE) return;
	this.lastSpawn = curTime;
	var rdmTurn = (Math.random() > 0.5) ? -1 : 1;
	this.enemyList.push({x : Math.random() * CANVAS_WIDTH, y : CANVAS_HEIGHT + ENEMY_HEIGHT, lastFire : curTime, lastTurn : curTime, turn: rdmTurn, lastFire: curTime});
}

Enemy.prototype.fire = function(){
	var curTime = Date.now();
	for(var i = 0; i < this.enemyList.length; ++i){
		if(curTime - this.enemyList[i].lastFire < ENEMY_ATTACK_RATE) continue;
		if(Math.random() < ENEMY_ATTACK_PROB){
			this.enemyList[i].lastFire = curTime;
			this.enemyBullet.push({x: this.enemyList[i].x + ENEMY_WIDTH/2, y: this.enemyList[i].y - ENEMY_HEIGHT});
		}
	}
}

Enemy.prototype.updateBullet = function(){
	var i = 0;
	while( i < this.enemyBullet.length){
		this.enemyBullet[i].y -= ENEMY_BULLET_SPEED;
		if(this.enemyBullet[i].y < 0) this.enemyBullet.splice(i, 1);
		else ++i;
	}
}

Enemy.prototype.renderBullet = function(){
	if(this.enemyBullet.length === 0) return;
	for(var i = 0; i < this.enemyBullet.length; ++i){
		this.bullet.update(this.enemyBullet[i].x, CANVAS_HEIGHT - this.enemyBullet[i].y);
		this.bullet.render();
	}
}

Enemy.prototype.move = function(){
	var curTime = Date.now();
	if(this.enemyList.length === 0) return;
	for(var i = 0; i < this.enemyList.length; ++i){
		this.enemyList[i].y -= this.velocity;
		if(curTime - this.enemyList[i].lastTurn > 1000) {
			this.enemyList[i].lastTurn = curTime;
			this.enemyList[i].turn = (Math.random() > 0.5) ? -1 : 1;
		}
		this.enemyList[i].x += this.enemyList[i].turn * this.velocity;
		if(this.enemyList[i].x < 0) {
			this.enemyList[i].x = 0;
			this.enemyList[i].turn *= -1;
		}
		if(this.enemyList[i].x > CANVAS_WIDTH - ENEMY_WIDTH) {
			this.enemyList[i].x = CANVAS_WIDTH - ENEMY_WIDTH;
			this.enemyList[i].turn *= -1;
		}
	}
	if(this.enemyList[0].y < 0) this.enemyList.splice(0,1);
}

Enemy.prototype.render = function(){
	if(this.enemyList.length === 0) return;
	for(var i = 0; i < this.enemyList.length; ++i){
		this.renderable.update(this.enemyList[i].x, CANVAS_HEIGHT - this.enemyList[i].y);
		this.renderable.render();
	}
	this.renderBullet();
}

function collisionHandler(){
	var j = 0;
	//bullet againts enemy
	while( j < player.bullet.bulletQueue.length ){
		var collisionOccured = false;
		for(var i = 0; i < enemy.enemyList.length; ++i){
			var collided = collisionCheck(enemy.enemyList[i].x, enemy.enemyList[i].y, ENEMY_WIDTH, ENEMY_HEIGHT, 
				player.bullet.bulletQueue[j].x, player.bullet.bulletQueue[j].y, BULLET_WIDTH, BULLET_HEIGHT);
			if(collided){
				explosion.addExplosion(enemy.enemyList[i].x, enemy.enemyList[i].y);
				enemy.enemyList.splice(i,1);
				player.bullet.bulletQueue.splice(j,1);
				collisionOccured = true;
				player.score += 500;
				break;
			}
		}
		if(!collisionOccured) ++j;
	}

	//ship against enemy
	for(var i = 0; i < enemy.enemyList.length; ++i){
		var collided = collisionCheck(enemy.enemyList[i].x, enemy.enemyList[i].y, ENEMY_WIDTH, ENEMY_HEIGHT, 
			player.ship.x, player.ship.y, SHIP_WIDTH, SHIP_HEIGHT);
		if(collided){
			explosion.addExplosion(enemy.enemyList[i].x, enemy.enemyList[i].y);
			explosion.addExplosion(player.ship.x, player.ship.y);
			enemy.enemyList.splice(i,1);
			player.isDead = true;
			break;
		}
	}

	//ship against enemy's bullet
	for(var i = 0; i < enemy.enemyBullet.length; ++i){
		var collided = collisionCheck(enemy.enemyBullet[i].x, enemy.enemyBullet[i].y, ENEMY_BULLET_WIDTH, ENEMY_BULLET_HEIGHT, 
			player.ship.x + 1.2*ENEMY_BULLET_WIDTH, player.ship.y - 1.5*ENEMY_BULLET_HEIGHT, SHIP_WIDTH - 1.5*ENEMY_BULLET_WIDTH, SHIP_HEIGHT - ENEMY_BULLET_HEIGHT);
		if(collided){
			explosion.addExplosion(player.ship.x, player.ship.y);
			enemy.enemyBullet.splice(i,1);
			player.isDead = true;
			break;
		}
	}	

}

function collisionCheck(x1, y1, w1, h1, x2, y2, w2, h2){
	var horizontal = false;
	var vertical = false;
	if(x1 + w1 >= x2 && x2 + w2 >= x1) horizontal = true;
	if(y1 + h1 >= y2 && y2 + h2 >= y1) vertical = true;
	return horizontal && vertical;
}

function Explosion(){
	this.explosionQueue = [];
	this.renderable = new Renderable();
	this.renderable.setAsset(EXPLOSION_SRC_X, EXPLOSION_SRC_Y, EXPLOSION_SRC_WIDTH, EXPLOSION_SRC_HEIGHT, ASSET_MANAGER.getAsset(EXPLOSION_PNG) );
	this.renderable.initialize(0, 0, EXPLOSION_WIDTH, EXPLOSION_HEIGHT, document.getElementById("enemy_display").getContext("2d") );

}

Explosion.prototype.addExplosion = function(init_x, init_y){
	this.explosionQueue.push({x: init_x, y:init_y, animStart : Date.now()});
}

Explosion.prototype.render = function(){
	if(this.explosionQueue.length === 0) return;
	var curTime = Date.now();
	for(var i = 0; i < this.explosionQueue.length; ++i){
		var frame = Math.floor((curTime - this.explosionQueue[i].animStart) / EXPLOSION_ANIM_RATE);
		if(frame < 13){
			this.renderable.update(this.explosionQueue[i].x, CANVAS_HEIGHT - this.explosionQueue[i].y);
			this.renderable.switchFrame(frame * EXPLOSION_SRC_WIDTH, EXPLOSION_SRC_HEIGHT + EXPLOSION_SRC_Y);
			this.renderable.render();

			this.renderable.update(this.explosionQueue[i].x + EXPLOSION_WIDTH - EXPLOSION_SRC_X, CANVAS_HEIGHT - this.explosionQueue[i].y);
			this.renderable.switchFrame(frame * EXPLOSION_SRC_WIDTH, EXPLOSION_SRC_Y);
			this.renderable.render();
		}
	}
	if(Math.floor((curTime - this.explosionQueue[0].animStart)/EXPLOSION_ANIM_RATE) >= 13) this.explosionQueue.splice(0,1);
}