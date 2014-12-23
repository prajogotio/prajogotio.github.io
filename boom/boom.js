var maze = {
    DOM : {},
    canvas : {
        width : 1024,
        height: 640,
    },
    map : {
        row : 24,
        col : 24,
        data : [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
                1,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,1,
                1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,
                1,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,1,
                1,0,0,1,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,1,
                1,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,1,
                1,0,0,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,1,
                1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                1,0,0,1,1,1,1,1,1,1,1,1,1,0,1,1,1,0,1,1,1,1,1,1,
                1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,1,0,0,0,1,
                1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,1,
                1,1,1,1,1,1,1,1,1,1,1,0,0,0,1,0,0,0,0,0,0,0,0,1,
                1,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,1,
                1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,
                1,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,1,
                1,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,1,
                1,0,0,0,0,0,0,0,0,0,1,0,0,0,1,1,1,1,1,1,1,1,1,1,
                1,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,1,
                1,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,1,
                1,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,1,
                1,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,1,
                1,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,1,
                1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,1,
                1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        cell : function(row, col) {
            return this.data[row * this.row + col];
        },
        tile : {
            dim : 96,
        },
        wall : {
            height : 164,
        },
        textureMap : {
            height : 400,
            width : 600,
        },
    },
    inf : 1e308,
}

var assets = { 
    counter : 0,
    numOfAssets : 0,
    cache : {},
};


var player = {
    FOV : 60,
    horizon : 300,
    alpha : 90,
    x : 12*96,
    y : 150,
    speed : 3,
    mouseX : 512,
    command : {},
    handleEvent : playerEventHandler,
    update : playerUpdater,
    oscilation: 0,
    height: 300,
    isShooting : false,
};

var startButton;
var background;

var enemyList = [];
var enemyCanvas;

var game;
var gameAnimationLoop;

function playerEventHandler(e) {
    
    if (e.type == 'keydown') {
        if (e.which === 87) {
            player.command['UP'] = true;
        }
        if (e.which === 65) {
            player.command['LEFT'] = true;
        }
        if (e.which === 83) {
            player.command['DOWN'] = true;
        }
        if (e.which === 68) {
            player.command['RIGHT'] = true;
        }
        if (e.which === 82) {
            playerReloadHandler();
        }
    } else if (e.type == 'keyup') {
        if (e.which === 87) {
            delete player.command['UP'];
        }
        if (e.which === 65) {
            delete player.command['LEFT'];
        }
        if (e.which === 83) {
            delete player.command['DOWN'];
        }
        if (e.which === 68) {
            delete player.command['RIGHT'];
        }
        if (e.which === 80) {
            stopGame();
        }
    } else if ( e.type == 'mousemove' ) {
        playerMouseMoveHandler(e);
    } else if ( e.type == 'mousedown' ) {
        playerShootingHandler();
        e.preventDefault();
    } else if ( e.type == 'mouseup' ) {
        //in a threaded environment, this is a very bad approach.
        //player.isShooting = false;
    }
}

function playerAttackedEventHandler() {
    player.health--;
    if(player.health < 0) player.health = 0;
    displayHealthBar();
    if (player.health === 0) {
        player.DOM.fillStyle = "rgba(130, 0, 0, 0.4)"; 
        player.DOM.fillRect(0, 0, maze.canvas.width, maze.canvas.height);
        player.isDead = true;
        player.DOM.fillStyle = "white";
        player.DOM.font = "70px Times";
        player.DOM.fillText("Wasted", 400, 200);
        player.DOM.font = "40px Times";
        player.DOM.fillText("Your soul belongs to the BOOM", 290, 400);
        setTimeout(function(){
            exitGameLoop();
            setTimeout(function(){
                startButton.innerHTML = "<h1>BOOM</h1> Click to Try Again";
                startButton.style.setProperty('display', 'block');
            }, 1000);
        }, 500);
    }
};

function playerMouseMoveHandler(e) {
    var x = e.screenX - maze.DOM.offsetLeft;
    var y = e.screenY - maze.DOM.offsetTop;
    var dT = (x - player.mouseX) * 0.75;
    player.height = (-e.screenY + 300) + 300;
    player.horizon = player.height;
    player.mouseX = x;
    player.alpha += dT;
    if( player.alpha > 360 ) player.alpha -= 360;
    if( player.alpha < -360 ) player.alpha += 360;
}

function playerShootingHandler() {
    var curTime = Date.now();
    if(player.bullet == 0) {
        alertToReload();
        return;
    }
    if(curTime - player.lastShoot > 612) {
        player.isShooting = true;
        --player.bullet;
        player.lastShoot = curTime;
        displayBulletBar();
    }
}

function playerUpdater() {
    playerMovementUpdate();
    if (player.isShooting) {
        if (Date.now() - player.lastShoot > 100) player.isShooting = false;
    }
    if (maze.map.cell( Math.floor(player.y/maze.map.tile.dim), Math.floor(player.x/maze.map.tile.dim) ) === 2) {
        gameIsWon();
    }
}

function playerMovementUpdate() {
    if (player.command['UP']) {
        var dx = player.speed * Math.cos(player.alpha / 180 * Math.PI);
        var dy = player.speed * Math.sin(player.alpha / 180 * Math.PI);
        if(collisionWithWall(player.x + dx*2, player.y + dy*2)) return;
        player.x += dx;
        player.y += dy;
        player.horizon = player.height + 27.4 * Math.sin(((player.oscilation+10) % 180) / 180 * Math.PI*0.12);
        player.oscilation += 7;
    }
    if(player.command['LEFT']) {
        dx = player.speed * 0.5 * Math.cos((player.alpha - 90) / 180 * Math.PI);
        dy = player.speed * 0.5 * Math.sin((player.alpha - 90) / 180 * Math.PI);
        if(collisionWithWall(player.x - dx*2, player.y - dy*2)) return;
        player.x += dx;
        player.y += dy;
    }
    if (player.command['RIGHT']) {
        dx = player.speed * 0.5 * Math.cos((player.alpha + 90) / 180 * Math.PI);
        dy = player.speed * 0.5 * Math.sin((player.alpha + 90) / 180* Math.PI);
        if(collisionWithWall(player.x + dx*2, player.y + dy*2)) return;
        player.x += dx;
        player.y += dy;
    }
    if (player.command['DOWN']) {
        var dx = player.speed * Math.cos(player.alpha / 180 * Math.PI);
        var dy = player.speed * Math.sin(player.alpha / 180 * Math.PI);
        if(collisionWithWall(player.x - dx*2, player.y - dy*2)) return;
        player.x -= dx;
        player.y -= dy;
        player.horizon = player.height + 22.4 * Math.sin(((player.oscilation+10) % 180) / 180 * Math.PI*0.09);
        player.oscilation += 10;
    }
}

function collisionWithWall(x, y) {
    //console.log(player.alpha, player.x, player.y);
    var row = Math.floor( y / maze.map.tile.dim );
    var col = Math.floor( x / maze.map.tile.dim );
    if(maze.map.cell(row, col) == 1) return true;
    return false;
}

function MazeGraphics(canvas, texture_map) {
    var graphics = canvas;
    var gWidth = maze.canvas.width;
    var gHeight = maze.canvas.height;
    var gImageData;
    return {
        startBuffer : function() {
            gImageData = graphics.createImageData(maze.canvas.width, maze.canvas.height);
        },
        bufferVerticalLine : function(col, startRow, endRow, distance) {
            for (var row = Math.max(0, startRow); row < Math.min(gHeight, endRow); ++row) {
                var gCell = row * 4 * gWidth + 4 * col;
                gImageData.data[gCell] = Math.min(240, 13000/distance);
                gImageData.data[gCell + 1] = Math.min(234, 12000/distance);
                gImageData.data[gCell + 2] = Math.min(220, 12300/distance);
                gImageData.data[gCell + 3] = 255;
            }
        },
        flushBuffer : function() {
            graphics.putImageData(gImageData, 0, 0);
        },
    };
}

function RayCastMaze(g) {
    var graphics = g;
    var screenWidth = maze.canvas.width;
    var screenHeight = maze.canvas.height;
    var delta = player.FOV/screenWidth;
    var distToScreen = screenWidth/(2*tangent(player.FOV));
    
    function renderMaze() {
        graphics.startBuffer();
        var beta = player.alpha - screenWidth/2 * delta;
        for (var col = 0; col < screenWidth; ++col) {
            drawWall(col, beta);
            beta += delta;
        }
        drawBackground();
        graphics.flushBuffer();
    }
    function drawWall(col, beta) {
        var distToWall = findDistanceToWall(beta);
        var wallHeight = (distToScreen / distToWall) * maze.map.wall.height; 
        graphics.bufferVerticalLine(col, Math.floor(player.horizon - wallHeight/2), Math.floor(player.horizon + wallHeight/2), distToWall);
    }
    
    function findDistanceToWall(beta){
        if (beta < 0) beta += 360;
        if (beta >= 360) beta -= 360;
        var vD = findVerticalIntersection(beta);
        var hD = findHorizontalIntersection(beta);
        return Math.sqrt(Math.min(vD, hD)) * cosine(player.alpha-beta);
    }
    
    function findVerticalIntersection(beta) {
        if (beta === 0 || beta === 180) return maze.inf;
        var dy, dx;
        var py = findCoorInTile(player.y);
        var qy = maze.map.tile.dim - py;
        var cx, cy;
        if (beta < 180) {
            dy = maze.map.tile.dim;
            dx = dy / tangent(beta);
            cy = player.y + qy + 1;
            cx = player.x + qy / tangent(beta);
        } else {
            dy = -maze.map.tile.dim;
            dx = dy / tangent(beta);
            cy = player.y - py - 1;
            cx = player.x - py / tangent(beta);
        }
        return findIntersectionDistance(cx, cy, dx, dy);
    }
    
    function findHorizontalIntersection(beta) {
        if (beta === 90 || beta === 270) return maze.inf;
        var dx, dy;
        var px = findCoorInTile(player.x);
        var qx = maze.map.tile.dim - px;
        var cx, cy;
        if (beta < 90 || beta > 270) {
            dx = maze.map.tile.dim;
            dy = dx * tangent(beta);
            cx = player.x + qx + 1;
            cy = player.y + qx * tangent(beta);
        } else {
            dx = -maze.map.tile.dim;
            dy = dx * tangent(beta);
            cx = player.x - px - 1;
            cy = player.y - px * tangent(beta);
        }        
        return findIntersectionDistance(cx, cy, dx, dy);
    }
    
    function findIntersectionDistance(cx, cy, dx, dy) {
        while (true) {
            var row = Math.floor(cy / maze.map.tile.dim);
            var col = Math.floor(cx / maze.map.tile.dim);
            if (row < 0 || col < 0) break;
            if (row >= maze.map.row || col >= maze.map.col) break;
            if (maze.map.cell(row, col) === 1) {
                return distance(player.x, player.y, cx, cy);
            }
            cx += dx;
            cy += dy;
        }
        return maze.inf;
    }
    
    function findCoorInTile(coor) {
        return coor - maze.map.tile.dim * Math.floor(coor / maze.map.tile.dim);
    }
    
    function distance(x1, y1, x2, y2) {
        var dx = x1 - x2;
        var dy = y1 - y2;
        return dx*dx + dy*dy;
    }
    
    function tangent(beta) {
        return Math.tan(beta / 180 * Math.PI);
    }
    
    function cosine(beta) {
        return Math.cos(beta / 180 * Math.PI);
    }
    
    return {
        render : renderMaze,
    };
}

function Enemy(given_pos_x, given_pos_y, type) {
    var status = {};
    var self = EnemyFactory(given_pos_x, given_pos_y, type, status);
    
    status.lastAttack = Date.now();
    return {
        update : function(){
            self.enemyLogic();
        },
        distance : function(){
            return self.distance();
        },
        canBeSeen : function() {
            return self.canBeSeen();
        },
        gotShotHandler : function(){
            return self.gotShotHandler();
        },
    };
}

function EnemyFactory(given_pos_x, given_pos_y, type, status) {
    var distToScreen = maze.canvas.width/(2*Math.tan(player.FOV/360*Math.PI));
    var pos_x = given_pos_x;
    var pos_y = given_pos_y;
    var movingImage = {};
    var attackImage = {};
    var dieImage = {};
    var height, width, damage, health, speed, offsetY;
    
    if(type == 'Baron') {
        movingImage = {
            img : assets.cache.baronWalk,
            height : 239,
            width : 160,
            frames : 4,
            xOffset : -20,
            movingDelta : 0,
        };
        
        attackImage = {
            img : assets.cache.baronAttack,
            height : 180,
            width : 150,
            frames : 4,
            attackDelta : 0,
        };
        
        dieImage = {
            img : assets.cache.baronDie,
            height : 73,
            width : 55,
            frames : 4,
            dieDelta : 0,
        };
        
        damage = 100;
        health = 300;
        height = 100;
        offsetY = 10;
        width = 70;
        speed = 0.5;

        
        function movementBehavior() { 
            if (100 < distanceWithPlayer() && distanceWithPlayer() < 1024) {
                moveTowardsPlayer();
                status.isMoving = true;
            } else {
                status.isMoving = false;
                movingImage.movingDelta = 0;
            }
        };
        
        function getAngleWithPlayer() {
            var cVector = getUnitVector(player.alpha);
            var dVector = {
                x : pos_x - player.x,
                y : pos_y - player.y,
            };
            var beta = getAngleBetween(cVector, dVector);
            if (dotProduct(cVector, rotate90(dVector)) > 0) beta *= -1;
            return beta;
        }
        
        function handleRender() {
            var beta = getAngleWithPlayer();
            if (player.FOV < Math.abs(beta) ) return;
            var scale = distToScreen / distanceWithPlayer();
            var displayHeight = scale * height;
            var displayWidth = scale * width;
            //if(checkCollisionWithWall(player.alpha + beta)) return;
            var screenOffset = offsetY / distanceWithPlayer() * distToScreen;
            var screenX = 512 + distToScreen * Math.tan(beta/180 * Math.PI) - displayWidth/2;
            var screenY = player.horizon - displayHeight/2 + screenOffset;
            
            if (status.isDead) {
                handleDeadRender(screenX, screenY, displayWidth, displayHeight);
            } else if (status.isMoving) {
                handleMovingRender(screenX, screenY, displayWidth, displayHeight);    
            } else if (status.isAttacking) {
                handleAttackRender(screenX, screenY, displayWidth, displayHeight);
            } else {
                enemyCanvas.drawImage(movingImage.img, movingImage.width*1 + movingImage.xOffset, 0, movingImage.width, movingImage.height-5, screenX, screenY, displayWidth, displayHeight);
            }
        };
        
        function handleMovingRender(screenX, screenY, displayWidth, displayHeight) {
            var frame = Math.floor(movingImage.movingDelta * movingImage.frames);
            if (frame >= movingImage.frames) frame = movingImage.frames - 1;
            var imageX, imageY;
            var imageWidth = movingImage.width;
            var imageHeight = movingImage.height;
            if (frame == 0) {
                imageX = movingImage.width * 1;
                imageY = 0;
                imageWidth -= 3;
                imageHeight -= 4;
            } else if (frame == 1) {
                imageX = movingImage.width * 1 - 140;
                imageY = 0;
                imageWidth -= 22;
                imageHeight -= 4;
            } else if (frame == 2) {
                imageX = movingImage.width * 3 - 20;
                imageY = 0;
                imageHeight -= 4;
            } else if (frame == 3) {
                imageX = movingImage.width * 2;
                imageY = 0;
                imageWidth -= 28;
                imageHeight -= 4;
            }
            enemyCanvas.drawImage(movingImage.img, imageX + movingImage.xOffset, imageY, imageWidth, imageHeight, screenX, screenY, displayWidth, displayHeight); 
            movingImage.movingDelta += 0.02;
            if(movingImage.movingDelta > 1) movingImage.movingDelta = 0;
        };
        
        function attackBehavior() {
            if (status.isAttacking || player.isDead) return;
            if (distanceWithPlayer() <= 101 && timeElapsedSinceLastAttack() >= 5) {
                status.lastAttack = Date.now();
                status.isAttacking = true;
                playerAttackedEventHandler();
            } else {
                status.isAttacking = false;
            }
        };
        
        function handleAttackRender(screenX, screenY, displayWidth, displayHeight) { 
            var curFrame = Math.floor(attackImage.attackDelta * attackImage.frames);
            if (curFrame >= dieImage.frames) curFrame = attackImage.frames - 1;
            var imageX, imageY, imageWidth, imageHeight;
            
            imageY = 57;
            imageHeight = 176;
            if (curFrame == 0) {
                imageX = 0;
                imageWidth = 159;
            } else if(curFrame == 1) {
                imageWidth = 174;
                imageX = 159;
            } else if(curFrame == 2) {
                imageWidth = 133;
                imageX = 159 + 174;
            } else if(curFrame == 3) {
                imageWidth = 123;
                imageX = 159 + 174 + 133;
            }
            enemyCanvas.drawImage(attackImage.img, imageX, imageY, imageWidth, imageHeight, screenX, screenY, displayWidth, displayHeight);
            attackImage.attackDelta += 0.05;
            if(attackImage.attackDelta > 1) {
                status.isAttacking = false;
                attackImage.attackDelta = 0;
            }
        };
        
        function handleDeadRender(screenX, screenY, displayWidth, displayHeight) {
            var curFrame = Math.floor(dieImage.dieDelta * dieImage.frames);
            if (curFrame >= dieImage.frames) curFrame = dieImage.frames - 1;
            enemyCanvas.drawImage(dieImage.img, dieImage.width * curFrame, dieImage.height, dieImage.width, dieImage.height, screenX, screenY, displayWidth, displayHeight);
            dieImage.dieDelta += 0.04;
            if(dieImage.dieDelta > 1) dieImage.dieDelta = 1;
        };
    }
    function moveTowardsPlayer() {
        var dx, dy;
        if( player.x < pos_x ) {
            dx = -speed;
        } else {
            dx = speed;
        }
        if (player.y < pos_y ) {
            dy = -speed;
        } else {
            dy = speed;
        }
        pos_x += dx;
        pos_y += dy;
    }
    
    function distanceWithPlayer() {
        var dx = player.x - pos_x;
        var dy = player.y - pos_y;
        return Math.sqrt(dx*dx + dy*dy);
    }
    
    function angleWithPlayer() {
        var dx = pos_x - player.x;
        var dy = pos_y - player.y;
        if(dx === 0 && dy >= 0) return 90;
        if(dx === 0 && dy < 0) return 270;
        var theta = Math.atan(dy/dx) / Math.PI * 180;
        if(dx > 0 && dy > 0) return theta;
        else if(dx > 0 && dy < 0) return 360 + theta;
        else if(dx < 0 && dy > 0) return 180 + theta;
        else if(dx < 0 && dy < 0) return 180 + theta;
    }

    
    function ensureAngleIn360Range(alpha) {
        if (alpha > 360) alpha = alpha - 360*Math.floor(alpha/360);
        else if (alpha < -360) alpha = alpha + 360*Math.ceil(alpha/360);
        return alpha;
    }
    
    function checkCollisionWithWall(beta) {
        beta = ensureAngleIn360Range(beta);
        if(beta < 0) beta += 360;
        var m = Math.tan(beta /180 * Math.PI);
        var x0 = player.x;
        var y0 = player.y;
        var k = -m * x0 + y0;
        var dist = distanceWithPlayer();
        var dx = 0;
        var dy = 0;
        while(dx * dx + dy * dy <= dist * dist) {
            if ( Math.floor(((curX + 1) * m + k) / maze.map.tile.dim) == Math.floor((y0+dy)/maze.map.tile.dim)) {
                if(beta < 90 || beta > 270) dx++;
                else --dx;
            } else {
                if(beta < 180) dy++;
                else --dy;
            }
            var curX = dx + x0;
            var col = Math.floor(curX / maze.map.tile.dim);
            var row = Math.floor((y0 + dy) / maze.map.tile.dim);
            if (maze.map.cell(row, col) === 1) return true;
        }
        return false;
    }
    
    function gotShot() {
        var beta = Math.abs(getAngleWithPlayer());
        var offsetW = Math.sin(beta*Math.PI/180.0) * distanceWithPlayer();
        var offsetH = (player.horizon - 300) / distToScreen * distanceWithPlayer();
        return (Math.abs(offsetW) < width/2 && Math.abs(offsetH + offsetY) < height/2)
    }
    
    function bulletCollisionHandler() {
        if(status.isDead) return false;
        if(player.isShooting && gotShot()) {
            playerReceiveScore();
            status.isDead = true;
            return true;
        }
        return false;
    }
    
    function timeElapsedSinceLastAttack() {
        var curTime = Date.now();
        return (curTime - status.lastAttack) / 1000;
    }
    
    return {
        enemyLogic : function() {
            if(!status.isDead) {
                movementBehavior();
                attackBehavior();
            }
            handleRender();
        },
        distance : function() {
            return distanceWithPlayer();
        },
        canBeSeen : function() {
            return !checkCollisionWithWall(getAngleWithPlayer() + player.alpha);
        },
        gotShotHandler : function() {
            return bulletCollisionHandler();
        },
    };
}

function addNewEnemy(type) {
    enemyList = [];
    var cnt = 150;
    for (var i = 7; i < maze.map.row; ++i){
        for (var j = 0; j < maze.map.col; ++j){
            if (Math.random() > 0.75 && maze.map.cell(i, j) === 0) {
                enemyList.push(Enemy(i * maze.map.tile.dim + maze.map.tile.dim/2, j * maze.map.tile.dim + maze.map.tile.dim/2, 'Baron'));
                --cnt;
            }
            if (cnt === 0) return;
        }
    }
    enemyList.push(TheKey(22 * 96 + 48 , 22 * 96 + 48));
};

function enemyUpdater(){
    enemyCanvas.clearRect(0, 0, 1024, 640);
    var enemyZBuffer = [];
    for (var i = 0; i < enemyList.length; ++i) {
        if (enemyList[i].canBeSeen()) {
            enemyZBuffer.push(enemyList[i]);
        }
    }
    //sorting with insertion, if later can use more than 100 sprites,
    //i'll change this to qsort
    
    for (var i = 1; i < enemyZBuffer.length; ++i) {
        var j = i;
        while(j > 0 && enemyZBuffer[j-1].distance() < enemyZBuffer[j].distance()){
            var tmp = enemyZBuffer[j];
            enemyZBuffer[j] = enemyZBuffer[j-1];
            enemyZBuffer[j-1] = tmp;
            --j;
        }
    }
    if (player.isShooting) {
        for (var i = enemyZBuffer.length - 1; i >= 0; --i) {
            if(enemyZBuffer[i].gotShotHandler()) {
                player.isShooting = false;
                break;
            }
        }
    }
    for (var i = 0; i < enemyZBuffer.length; ++i) {
        enemyZBuffer[i].update();
    }
}

function initialize() {
    maze.DOM = document.getElementById('maze');
    player.DOM = document.getElementById('player').getContext('2d');
    enemyCanvas = document.getElementById('enemy').getContext('2d');
    game = RayCastMaze(MazeGraphics(maze.DOM.getContext('2d')));
    loadAssets();
}

function registerEventListeners(){
    document.addEventListener('keydown', player);
    document.addEventListener('keyup', player);
    document.addEventListener('mousemove', player);
    document.addEventListener('mousedown', player);
    document.addEventListener('mouseup', player);
}

function deregisterEventListeners(){
    document.removeEventListener('keydown', player);
    document.removeEventListener('keyup', player);
    document.removeEventListener('mousemove', player);
    document.removeEventListener('mousedown', player);
    document.removeEventListener('mouseup', player);
}

function loadAssets() {
    var queue = [];
    //queue.push({path:'assets/wall_texture.jpg', name:'textureMap'});
    queue.push({path:'assets/player_arm.png', name:'playerArm'});
    queue.push({path:'assets/crosshair.png', name:'crossHair'});
    queue.push({path:'assets/enemy_baron_walk.png', name:'baronWalk'});
    queue.push({path:'assets/enemy_baron_attack.png', name:'baronAttack'});
    queue.push({path:'assets/enemy_baron_die.png', name:'baronDie'});
    queue.push({path:'assets/heart.gif', name:'heart'});
    queue.push({path:'assets/bullet.png', name:'bullet'});
    queue.push({path:'assets/numbers.png', name:'numbers'});
    queue.push({path:'assets/key.png', name:'key'});
    
    assets.numOfAssets = queue.length;
    for (var i = 0; i < queue.length; ++i) {        
        var img = new Image();
        img.addEventListener("load", function(e){
            ++assets.counter;
            assetDownloadedHandle();
        });
        img.addEventListener("error", function(e){
            ++assets.counter;
            console.log("Error while retrieving assets");
        });
        img.src = queue[i].path;
        assets.cache[queue[i].name] = img;
    }
}

function assetDownloadedHandle() {
    if (assets.counter !== assets.numOfAssets) {
        startButton.innerHTML = "<h1>BOOM ("+ Math.floor(assets.counter/assets.numOfAssets * 100) +"%)</h1>";
        return;
    }
    startButton.innerHTML = "<h1> BOOM </h1><p>Click To Start!</p>";
    startButton.addEventListener('mousedown', function() {
        enterGameLoop();
        startButton.style.setProperty('display', 'none');
    });
}

function initializePlayerStatus() {
    player.health = 5;
    player.bulletSupply = 100;
    player.bullet = 5;
    player.reloadRate = 5;
    player.score = 0;
    player.lastShoot = Date.now() - 912;
    player.command = {};
    player.isShooting = false;
    player.x = 12 * 96;
    player.y = 150;
    player.alpha = 90;
    player.isDead = false;
    player.mouseX = 512;
    player.horizon = 300;
    player.DOM.clearRect(0, 0, maze.canvas.width, maze.canvas.height);
    player.DOM.drawImage(assets.cache.playerArm, 212, 240, 900, 400);
    player.DOM.drawImage(assets.cache.crossHair, 460, 260, 100, 100);
    displayHealthBar();
    displayBulletBar();
    displayBulletSupplyBar();
    displayScore();
}

function displayHealthBar() {
    player.DOM.clearRect(20, 500, 350, 70);
    for (var i = 0; i < player.health; ++i) {
        player.DOM.drawImage(assets.cache.heart, 20 + i * 70, 500, 70, 70);
    }
}

function displayBulletBar(){
    player.DOM.clearRect(20, 295, 60, 190);
    for (var i = 0; i < player.bullet; ++i) {
        player.DOM.drawImage(assets.cache.bullet, 20, 450 - i * 29, 60, 38);
    }
}

function alertToReload() {
    player.DOM.fillStyle = "red";
    player.DOM.font = "50px Arial";
    player.DOM.fillText("Reload!", 420, 100);
}

function playerReloadHandler() {
    if (player.bulletSupply <= 0) return;
    player.DOM.clearRect(420, 32, 440, 70)
    player.bullet = player.reloadRate;
    player.bulletSupply -= player.reloadRate;
    if(player.bulletSupply < 0) player.bulletSupply = 0;
    displayBulletBar();
    displayBulletSupplyBar();
}

function displayBulletSupplyBar() {
    player.DOM.clearRect(0, 240, 130, 50);
    var num = player.bulletSupply;
    for (var i = 0; i < 3; ++i) {
        player.DOM.drawImage(assets.cache.numbers, 40*(num%10), 0, 36, 59, 20 + 38 * (2-i), 240, 34, 49);
        num = Math.floor(num/10);
    }
}

function stopGame() {
    player.DOM.fillStyle = "rgba(130, 0, 0, 0.4)"; 
    player.DOM.fillRect(0, 0, maze.canvas.width, maze.canvas.height);
    player.isDead = true;
    player.DOM.fillStyle = "white";
    player.DOM.font = "70px Times";
    player.DOM.fillText("Stopped", 400, 200);
    player.DOM.font = "40px Times";
    player.DOM.fillText("Reload Page to Play Again", 290, 400);
    exitGameLoop();
}

function exitGameLoop() {
    clearInterval(gameAnimationLoop);
    deregisterEventListeners();
    document.body.style.setProperty('cursor', 'default');
}

function drawBackground() {
    background.fillStyle = "rgba(200, 194, 2, 0.8)";
    background.fillRect(0, 0, maze.canvas.width, player.horizon);
    background.fillStyle = "rgb(145, 145, 130)";
    background.fillRect(0, player.horizon, maze.canvas.width, maze.canvas.height - player.horizon);
}

function playerReceiveScore() {
    player.score++;
    displayScore();
}

function displayScore() {
    player.DOM.clearRect(900, 20, 130, 50);
    var num = player.score;
    for (var i = 0; i < 3; ++i) {
        player.DOM.drawImage(assets.cache.numbers, 40*(num%10), 0, 36, 59, 900 + 38 * (2-i), 20, 34, 49);
        num = Math.floor(num/10);
    }
}

function TheKey(given_pos_x, given_pos_y) {
    var self = Initialize(given_pos_x, given_pos_y);
    
    function Initialize(given_pos_x, given_pos_y) {
        var distToScreen = maze.canvas.width/(2*Math.tan(player.FOV/360*Math.PI));
        var pos_x = given_pos_x;
        var pos_y = given_pos_y;
            
        var height = 50;
        var width = 37;
            
        function handleRender() {
            var beta = getAngleWithPlayer();
            if (player.FOV < Math.abs(beta) ) return;
            var scale = distToScreen / distanceWithPlayer();
            var displayHeight = scale * height;
            var displayWidth = scale * width;
            var screenOffset = 10 / distanceWithPlayer() * distToScreen;
            var screenX = 512 + distToScreen * Math.tan(beta/180 * Math.PI) - displayWidth/2;
            var screenY = player.horizon - displayHeight/2 + screenOffset;
            enemyCanvas.drawImage(assets.cache.key, 0, 0, 24, 52, screenX, screenY, displayWidth, displayHeight);
        }
        
        function distanceWithPlayer() {
            var dx = player.x - pos_x;
            var dy = player.y - pos_y;
            return Math.sqrt(dx*dx + dy*dy);
        }
        
        function angleWithPlayer() {
            var dx = pos_x - player.x;
            var dy = pos_y - player.y;
            if(dx === 0 && dy >= 0) return 90;
            if(dx === 0 && dy < 0) return 270;
            var theta = Math.atan(dy/dx) / Math.PI * 180;
            if(dx > 0 && dy > 0) return theta;
            else if(dx > 0 && dy < 0) return 360 + theta;
            else if(dx < 0 && dy > 0) return 180 + theta;
            else if(dx < 0 && dy < 0) return 180 + theta;
        }

        
        function ensureAngleIn360Range(alpha) {
            if (alpha > 360) alpha = alpha - 360*Math.floor(alpha/360);
            else if (alpha < -360) alpha = alpha + 360*Math.ceil(alpha/360);
            return alpha;
        }
        
        function checkCollisionWithWall(beta) {
            beta = ensureAngleIn360Range(beta);
            if(beta < 0) beta += 360;
            var m = Math.tan(beta /180 * Math.PI);
            var x0 = player.x;
            var y0 = player.y;
            var k = -m * x0 + y0;
            var dist = distanceWithPlayer();
            var dx = 0;
            var dy = 0;
            while(dx * dx + dy * dy <= dist * dist) {
                if ( Math.floor(((curX + 1) * m + k) / maze.map.tile.dim) == Math.floor((y0+dy)/maze.map.tile.dim)) {
                    if(beta < 90 || beta > 270) dx++;
                    else --dx;
                } else {
                    if(beta < 180) dy++;
                    else --dy;
                }
                var curX = dx + x0;
                var col = Math.floor(curX / maze.map.tile.dim);
                var row = Math.floor((y0 + dy) / maze.map.tile.dim);
                if (maze.map.cell(row, col) === 1) return true;
            }
            return false;
        }
        
        function getAngleWithPlayer() {
            var cVector = getUnitVector(player.alpha);
            var dVector = {
                x : pos_x - player.x,
                y : pos_y - player.y,
            };
            var beta = getAngleBetween(cVector, dVector);
            if (dotProduct(cVector, rotate90(dVector)) > 0) beta *= -1;
            return beta;
        }
        
        return {
            render : function() {
                handleRender();
            },
            distance : function() {
                return distanceWithPlayer();
            },
            canBeSeen : function() {
                return !checkCollisionWithWall(getAngleWithPlayer() + player.alpha);
            },
        };
    }
    
    return {
        update : function(){
            self.render();
        },
        distance : function(){
            return self.distance();
        },
        canBeSeen : function() {
            return self.canBeSeen();
        },
        gotShotHandler : function() {},
    };
}

function gameIsWon() {
    player.DOM.fillStyle = "rgba(0, 130, 0, 0.4)"; 
    player.DOM.fillRect(0, 0, maze.canvas.width, maze.canvas.height);
    player.isDead = true;
    player.DOM.fillStyle = "white";
    player.DOM.font = "70px Times";
    player.DOM.fillText("Congrats!", 400, 200);
    player.DOM.font = "40px Times";
    player.DOM.fillText("You have escaped the BOOM!", 290, 400);
    exitGameLoop();
}

function enterGameLoop() {
    registerEventListeners();
    initializePlayerStatus();
    addNewEnemy();
    drawBackground();
    gameAnimationLoop = setInterval(function(){ 
        game.render();
        player.update();
        enemyUpdater();
    }, 1000/60);
    document.body.style.setProperty('cursor', 'none');
}

document.addEventListener("DOMContentLoaded", function() {
    startButton = document.getElementById('startButton');
    background = document.getElementById('background').getContext('2d');
    initialize();
});
