//states: x, y, image to render, which canvas
//method: render to canvas

function Renderable(){
	this.canvas = {};
	this.y = 0;
	this.x = 0;
	this.width = 0;
	this.height = 0;

	this.imageAsset = {};
	this.src_x = 0;
	this.src_y = 0;
	this.src_width = 0;
	this.src_height = 0;
}

Renderable.prototype.setAsset = function(src_x, src_y, src_width, src_height, img){
	this.src_x = src_x;
	this.src_y = src_y;
	this.src_width = src_width;
	this.src_height = src_height;

	this.imageAsset = img;
}

Renderable.prototype.initialize = function(x, y, width, height, canvas){
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.canvas = canvas;
}

Renderable.prototype.update = function(new_x, new_y){
	this.x = new_x;
	this.y = new_y;
}

Renderable.prototype.render = function(){
	this.canvas.drawImage(
			this.imageAsset, 
			this.src_x, 
			this.src_y,
			this.src_width, 
			this.src_height,
			this.x,
			this.y,
			this.width,
			this.height
	);
}

Renderable.prototype.switchFrame = function(src_x, src_y){
	this.src_x = src_x;
	this.src_y = src_y;
}