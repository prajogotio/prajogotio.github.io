//Command Object
function Command(){
	this.commandSet = {};
	this.handleSet = {};
}

Command.prototype.addCommand = function(cmd){
	this.commandSet[cmd] = true;
}

Command.prototype.setHandle = function(cmd, cmdCallback){
	this.handleSet[cmd] = cmdCallback;
}

Command.prototype.deleteCommand = function(cmd, deleteCallback){
	delete this.commandSet[cmd];
	deleteCallback();
}

Command.prototype.handleCommand = function(){
	for(var cmd in this.commandSet){
		if(this.handleSet[cmd] !== undefined)
			this.handleSet[cmd]();
	}
}