var BOUNDING_RECT_OFFSET = 8;
var BOUNDING_RECT_SIZE = 48;
var BGM_URL = 'assets/silverbell.mp3';
var TIME_ALIVE = 2000;
var MAP_LEFT = 100;
var MAP_TOP = 100;
var command = {};
var player;
var display;
var mapDisplay;
var gameloop;
var assetManager;
var mapLevel;
var gameMap;
var announcement;
var startButton;
var lastIdle;
var levelBoard;
var countdown;
var counterloop;

document.addEventListener('DOMContentLoaded', function(){
	display = document.getElementById('display');
	mapDisplay = document.getElementById('mapdisplay');
	announcement = document.getElementById('announcement');
	startButton = document.getElementById('start');
	levelBoard = document.getElementById('level');
	assetManager = new AssetManager();
	assetManager.pushAssetURL(PLAYER_ASSET_URL);
	assetManager.pushAssetURL('assets/Tile_Finish_Unlocked.png');
	assetManager.pushAssetURL('assets/Tile_Cracked.png');
	assetManager.pushAssetURL('assets/Tile_Clean.png');
	assetManager.pushAssetURL('assets/Tile_Broken.png');
	assetManager.pushAssetURL('assets/Tile_Finish_Locked.png');
	assetManager.pushAssetURL('assets/Tile_Blocked.png');
	assetManager.pushAssetURL({'url': BGM_URL, 'type': 'sound'});
	assetManager.setCompletionHandler(gameIsReady);
	assetManager.setDownloadedHandler(downloadedHandler);
	assetManager.downloadAssets();

});

function BGMStarter() {
	BGM = assetManager.getAsset(BGM_URL);
	BGM.addEventListener('ended', function() {
		this.currentTime = 0;
		this.play();
	}, false);
	BGM.play();
}

function downloadedHandler() {
	var progress = (assetManager.processed / assetManager.numOfAssets) * 100;
	start.innerHTML = 'loading: ' + parseInt(progress) + "%";
}

function gameIsReady() {
	Tile.prototype.setImages();
	BGMStarter();
	startButton.innerHTML = 'Start Fross';
	startButton.addEventListener('click', function() {
		startButtonHandler();
	});
	document.addEventListener('keydown', keyDownHandler);
}

function startButtonHandler() {
	document.removeEventListener('keydown', keyDownHandler);
	startButton.style.setProperty('z-index', -1);
	startButton.style.setProperty('opacity', 0);
	var instruction = document.getElementById('instruction');
	instruction.style.setProperty('opacity', 0);
	instruction.style.setProperty('z-index', -1);
	initializeGame();
}

function keyDownHandler() {
	startButtonHandler();
}

function initializeGame() {
	clearScreen()
	initializeEventListener();
	initializePlayer(0, 0);
	initializeMap(MAP_LEFT, MAP_TOP);
	command = {};
	countDownBeforeGameLoop();
}

function startGameLoop() {
	lastIdle = Date.now();
	gameloop = setInterval(function() {
		gameLogic();
	}, 1000/60)
}

function initializePlayer(left, top) {
	PLAYER_ASSET = assetManager.getAsset(PLAYER_ASSET_URL);
	player = new Player(new Sprite(display.getContext('2d'), PLAYER_ASSET, left, top, TILE_SIZE, TILE_SIZE), left, top);
}

function initializeMap(left, top) {
	mapLevel = 1;
	setMapLevel(mapLevel, left, top);
}

function setMapLevel(level, left, top) {
	levelBoard.innerHTML = 'Level '+level;
	mapDisplay.getContext('2d').clearRect(0,0,1024,640);
	gameMap = new FloorMap(level, mapDisplay, left, top);
	var startPos = gameMap.getStartingPosition();
	player.setPosition(startPos.left, startPos.top);
	player.render();
}

function initializeEventListener() {

	document.addEventListener('keydown', function(e) {
		if(e.which == 37) {
			command['LEFT'] = true;
		} else if (e.which == 38) {
			command['UP'] = true;
		} else if (e.which == 39) {
			command['RIGHT'] = true;
		} else if (e.which == 40) {
			command['DOWN'] = true;
		}
	});
	document.addEventListener('keyup', function(e) {
		if(e.which == 37) {
			delete command['LEFT'];
		} else if (e.which == 38) {
			delete command['UP'];
		} else if (e.which == 39) {
			delete command['RIGHT'];
		} else if (e.which == 40) {
			delete command['DOWN'];
		}
	})
}

function gameLogic() {
	commandHandler();
	render();
	checkGameState();
}

function commandHandler() {
	var notMoving = true;
	if(command['UP']) {
		if(collisionCheck(32, 32-10, 1, 1)) {
			notMoving = false;
			player.moveUp();
		}
	}
	if(command['DOWN']) {
		if(collisionCheck(32, 32+10, 1, 1)) {
			notMoving = false;
			player.moveDown();
		}
	}
	if(command['RIGHT']) {
		if(collisionCheck(32 + 10, 32, 1, 1)) {
			notMoving = false;
			player.moveRight();
		}
	}
	if(command['LEFT']) {
		if(collisionCheck(32 - 10, 32, 1, 1)) {
			notMoving = false;
			player.moveLeft();
		}
	}
	if(notMoving) {
		player.stopMoving();
	} else {
		lastIdle = Date.now();
	}
}


function collisionCheck(leftOffset, topOffset, width, height) {
	return gameMap.willStepOn(player.left + leftOffset,
							  player.top + topOffset,
							  width,
							  height);
}

function render(){
	display.getContext('2d').clearRect(0, 0, 1024, 640);
	player.render();
	gameMap.render();
}

function countDownBeforeGameLoop() {
	countdown = Date.now();
	counterloop = setInterval(function() {
		announcement.style.setProperty('opacity', 1);
		var diff = parseInt((Date.now() - countdown)/800);
		diff = 3 - diff;
		if(diff == 0) {
			clearInterval(counterloop);
			announcement.style.setProperty('opacity', 0);
			startGameLoop();
			return;
		}
		announcement.innerHTML = parseInt(diff);
	})
}

function checkGameState() {
	if(Date.now() - lastIdle > TIME_ALIVE) {
		gameOver();
	}else if (!collisionCheck(32, 32, 1, 1)) {
		gameOver();	
	} else if(gameMap.isSatisfied() && playerIsAtFinishTile()) {
		nextLevel();
	} else {
		gameMap.isSteppingOn(player.left + 30, player.top + 30, 2, 2);
	}
}

function playerIsAtFinishTile() {
	var finishPos = gameMap.getFinishingPosition();
	return gameMap.collisionWith(finishPos.left, finishPos.top, player.left, player.top, BOUNDING_RECT_SIZE, BOUNDING_RECT_SIZE);
}

function nextLevel() {
	player.stopMoving();
	mapLevel++;
	clearScreen();
	setMapLevel(mapLevel, MAP_LEFT, MAP_TOP);
	clearInterval(gameloop);
	countDownBeforeGameLoop();
}

function clearScreen() {
	mapDisplay.getContext('2d').clearRect(0, 0, 1024, 640);
	display.getContext('2d').clearRect(0, 0, 1024, 640);
}

function gameOver() {
	clearInterval(gameloop);
	player.fallDown();
	announceGameOver();
	setTimeout(function() {
		showRestartButton();
	}, 1200);
}

function announceGameOver() {
	announcement.innerHTML = "You Died <br> Level Achieved: " + mapLevel;
	announcement.style.setProperty('opacity', 1);
}

function showRestartButton() {
	announcement.style.setProperty('opacity', 0);
	startButton.innerHTML = 'Restart Fross';
	startButton.style.setProperty('z-index', 10);
	startButton.style.setProperty('opacity', 1);
	document.addEventListener('keydown', keyDownHandler);
}

function restartGame() {
	initializeGame();
}
