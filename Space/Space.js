//Lets do some OOP, but may be a very BAD design
//JUST FOR FUN

var CANVAS_WIDTH = 480;
var CANVAS_HEIGHT = 600;
var SHIP_INIT_X = 200;
var SHIP_INIT_Y = 120;
var SHIP_SRC_X = 47;
var SHIP_SRC_Y = 140;
var SHIP_SRC_WIDTH = 24;
var SHIP_SRC_HEIGHT = 27;
var SHIP_WIDTH = 50;
var SHIP_HEIGHT = 50;
var SHIP_SPEED = 3;
var HEIGHT_LIMIT = 200;
var FRAME_WIDTH = SHIP_SRC_WIDTH;
var WEAPON_WIDTH = 11;
var WEAPON_HEIGHT = 21;


var Asset = [];
Asset.push( new Image() );
Asset[0].src = "ship.png";
//Asset.push( new Image() );
//Asset[1].src = "weapon.png";
//var AssetLoaded = 0;
//var totAsset = Asset.length;
//Asset[0].onload = function(){ ++AssetLoaded; };
//Asset[1].onload = function(){ ++AssetLoaded; };
Asset[0].onload = function(){ startGame(); }


function Drawable(){
	this.x;
	this.y;
	this.heigth;
	this.width;
	//Info on asset
	this.src_x;
	this.src_y;
	this.src_width;
	this.src_height;

	this.context;

	this.asset;
}


Drawable.prototype = {
	setImg : function(src_x, src_y, src_width, src_height){
		this.src_x = src_x;
		this.src_y = src_y;
		this.src_width = src_width;
		this.src_height = src_height;
	},
	setDisp : function(x, y, height, width){
		this.x = x;
		this.y = y;
		this.heigth = height;
		this.width = width;
	},
	setContext : function(ctx){
		this.context = document.getElementById(ctx).getContext("2d");
	},
	setAsset : function(asset){
		this.asset = asset;
	},
	render : function(){
		this.context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

		this.context.drawImage(
				this.asset, 
				this.src_x, 
				this.src_y,
				this.src_width, 
				this.src_height,
				this.x,
				CANVAS_HEIGHT - this.y,
				this.width,
				this.heigth
		);
	}
}

function SpaceShip(){
	this.drawable = new Drawable();
	this.drawable.setContext("ship_display");
	this.drawable.setAsset(Asset[0]);
	this.drawable.setDisp(SHIP_INIT_X, SHIP_INIT_Y, SHIP_WIDTH, SHIP_HEIGHT);
	this.drawable.setImg(SHIP_SRC_X, SHIP_SRC_Y, SHIP_SRC_WIDTH, SHIP_SRC_HEIGHT);

	this.manouvre = {};
}

SpaceShip.prototype = {
	update: function(){
		this.commandHandler();
		this.drawable.render();
	},
	addCommand: function(key){
		if(key == 37){
			this.manouvre['LEFT'] = "LEFT";
		} else if(key == 38){
			this.manouvre['UP'] = "UP";
		} else if(key == 39){
			this.manouvre['RIGHT'] = "RIGHT";
		} else if(key == 40){
			this.manouvre['DOWN'] = "DOWN";
		}
	},
	removeCommand: function(key){
		if(key == 37){
			delete this.manouvre['LEFT'];
		} else if (key == 38){
			delete this.manouvre['UP'];
		} else if(key == 39){
			delete this.manouvre['RIGHT'];
		} else if (key = 40){
			delete this.manouvre['DOWN'];
		}
	},
	commandHandler : function(){
		this.HandleMovement();
	},
	HandleMovement : function(){
		if(this.manouvre['LEFT'] == "LEFT"){
			this.drawable.x -= SHIP_SPEED;
			this.drawable.setImg(SHIP_SRC_X-FRAME_WIDTH, SHIP_SRC_Y, SHIP_SRC_WIDTH, SHIP_SRC_HEIGHT);
		} else if (this.manouvre['UP'] == "UP"){
			this.drawable.y += SHIP_SPEED;
			this.drawable.setImg(SHIP_SRC_X, SHIP_SRC_Y, SHIP_SRC_WIDTH, SHIP_SRC_HEIGHT);
		} else if (this.manouvre['RIGHT'] == "RIGHT"){
			this.drawable.x += SHIP_SPEED;
			this.drawable.setImg(SHIP_SRC_X+FRAME_WIDTH, SHIP_SRC_Y, SHIP_SRC_WIDTH, SHIP_SRC_HEIGHT);
		} else if (this.manouvre['DOWN'] == "DOWN"){
			this.drawable.y -= SHIP_SPEED;
			this.drawable.setImg(SHIP_SRC_X, SHIP_SRC_Y, SHIP_SRC_WIDTH, SHIP_SRC_HEIGHT);
		} else {
			this.drawable.setImg(SHIP_SRC_X, SHIP_SRC_Y, SHIP_SRC_WIDTH, SHIP_SRC_HEIGHT);
		}
		if(this.drawable.x < 0) this.drawable.x = 0;
		if(this.drawable.x > CANVAS_WIDTH - SHIP_WIDTH) this.drawable.x = CANVAS_WIDTH - SHIP_WIDTH;
		if(this.drawable.y < SHIP_HEIGHT) this.drawable.y = SHIP_HEIGHT;
		if(this.drawable.y > HEIGHT_LIMIT) this.drawable.y = HEIGHT_LIMIT;
	}
}

function startGame(){
	ship = new SpaceShip();

	function gameLogic(){
	//	if(AssetLoaded != totAsset) return;
		ship.update();
	}

	(function eventManager(){
		addEventListener("keydown", function(e){
			ship.addCommand(e.which);
		});

		addEventListener("keyup", function(e){
			ship.removeCommand(e.which);
		});

	})();

	setInterval(gameLogic, 1000/60);
}