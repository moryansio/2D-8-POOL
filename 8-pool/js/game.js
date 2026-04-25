class Game {
    constructor() {
        this.balls = [];
        this.table = typeof Table !== 'undefined' ? new Table() : null;
        this.bot = null; 
        
        this.gameMode = 'pvp';
        this.gameRunning = false;
        this.isWaitingForStop = false;
        this.placingCueBall = false; 
        this.input = null; 
        this.botIsThinking = false;

        
        this.scoreP1 = 0;
        this.scoreP2 = 0;

        this.gameState = {
            currentPlayer: 1,
            playerGroups: { 1: null, 2: null }, 
            p1Balls: [],
            p2Balls: [],
            turnActive: true,
            pottedThisTurn: [], 
            cueBallFouled: false
        };
    }

    isMoving() {
        return this.balls.some(b => !b.inPocket && (Math.abs(b.vx) > 0.1 || Math.abs(b.vy) > 0.1));
    }

    start(mode) {
        this.gameMode = mode;
        if (mode === 'pve' && typeof PoolBot !== 'undefined') {
            this.bot = new PoolBot(this);
        } else {
            this.bot = null;
        }

        this.gameRunning = true;
        this.initTable();
        
        const menu = document.getElementById('menu-overlay');
        const modeMenu = document.getElementById('mode-menu');
        if (menu) menu.classList.add('hidden');
        if (modeMenu) modeMenu.classList.add('hidden');
    }

    exit() {
        this.gameRunning = false;
        const menu = document.getElementById('menu-overlay');
        if (menu) menu.classList.remove('hidden');
        this.balls = [];
    }

    initTable() {
        const centerY = CONST.TABLE_HEIGHT / 2;
        this.balls = [];
        this.gameState.p1Balls = [];
        this.gameState.p2Balls = [];
        this.gameState.playerGroups = { 1: null, 2: null };
        this.gameState.currentPlayer = 1;
        this.gameState.turnActive = true;
        this.isWaitingForStop = false;
        this.placingCueBall = false;

        this.balls.push(new Ball(250, centerY, '#ffffff', 'cue', 0));
        
        const startX = 650;
        const rack = [[1], [9, 2], [10, 8, 3], [11, 7, 14, 4], [5, 13, 15, 6, 12]];
        const colors = {
            1:'#f1c40f', 2:'#2980b9', 3:'#e74c3c', 4:'#8e44ad', 5:'#d35400', 
            6:'#27ae60', 7:'#c0392b', 8:'#000000', 9:'#f1c40f', 10:'#2980b9', 
            11:'#e74c3c', 12:'#8e44ad', 13:'#d35400', 14:'#27ae60', 15:'#c0392b'
        };

        rack.forEach((row, rowIndex) => {
            row.forEach((num, colIndex) => {
                const x = startX + rowIndex * (CONST.BALL_RADIUS * 1.74);
                const y = centerY - (rowIndex * CONST.BALL_RADIUS) + colIndex * (CONST.BALL_RADIUS * 2.02);
                let type = (num === 8) ? 'black' : (num > 8 ? 'striped' : 'solid');
                this.balls.push(new Ball(x, y, colors[num], type, num));
            });
        });
        
        this.updateInterface();
    }

    onShot() {
        this.gameState.turnActive = false;
        this.gameState.pottedThisTurn = [];
        this.gameState.cueBallFouled = false;
        this.isWaitingForStop = true;
    }

    update() {
        if (!this.gameRunning) return;

        this.balls.forEach(ball => {
            if (!ball.inPocket) ball.update();
        }); 
        
        this.checkCollisions();

        if (this.isWaitingForStop && !this.isMoving()) {
            this.isWaitingForStop = false;
            console.log("The balls have stopped, I'm switching players...");
            this.handleTurnEnd();
        }

        if (this.gameMode === 'pve' && 
            this.gameState.currentPlayer === 2 && 
            !this.isMoving() && 
            !this.isWaitingForStop && 
            !this.botIsThinking) {
            
            this.triggerBot();
        }
    }

    checkCollisions() {
        const radius = CONST.BALL_RADIUS;
        const pocketR = 35; 
        const pockets = [
            {x: 0, y: 0}, {x: CONST.TABLE_WIDTH/2, y: 0}, {x: CONST.TABLE_WIDTH, y: 0},
            {x: 0, y: CONST.TABLE_HEIGHT}, {x: CONST.TABLE_WIDTH/2, y: CONST.TABLE_HEIGHT}, {x: CONST.TABLE_WIDTH, y: CONST.TABLE_HEIGHT}
        ];

        for (let i = 0; i < this.balls.length; i++) {
            const b1 = this.balls[i];
            if (b1.inPocket) continue;

            for (let p of pockets) {
                if (Math.hypot(b1.x - p.x, b1.y - p.y) < pocketR) {
                    this.handleBallPot(b1);
                    break;
                }
            }
            if (b1.inPocket) continue;

            if (b1.x - radius < 0) { b1.x = radius; b1.vx *= -0.8; }
            if (b1.x + radius > CONST.TABLE_WIDTH) { b1.x = CONST.TABLE_WIDTH - radius; b1.vx *= -0.8; }
            if (b1.y - radius < 0) { b1.y = radius; b1.vy *= -0.8; }
            if (b1.y + radius > CONST.TABLE_HEIGHT) { b1.y = CONST.TABLE_HEIGHT - radius; b1.vy *= -0.8; }

            for (let j = i + 1; j < this.balls.length; j++) {
                const b2 = this.balls[j];
                if (!b2.inPocket && typeof Physics !== 'undefined') {
                    Physics.resolveCollision(b1, b2);
                }
            }
        }
    }

    handleBallPot(ball) {
        ball.inPocket = true;
        ball.vx = 0; ball.vy = 0;
        this.gameState.pottedThisTurn.push(ball);
        if (ball.type === 'cue') {
            this.gameState.cueBallFouled = true;
        }
    }

    handleTurnEnd() {
        const { pottedThisTurn, currentPlayer, playerGroups } = this.gameState;
        const cuePotted = this.gameState.cueBallFouled;
        const blackPotted = pottedThisTurn.find(b => b.type === 'black');
        const coloredPotted = pottedThisTurn.filter(b => b.type !== 'cue' && b.type !== 'black');

        
        if (blackPotted) {
            const myType = playerGroups[currentPlayer];
            const remainingMyBalls = this.balls.filter(b => !b.inPocket && b.type === myType).length;
            if (myType && remainingMyBalls === 0 && !cuePotted) {
                this.endGame(currentPlayer, "Victory! The black ball is pocketed with the final shot..");
            } else {
                const winner = (currentPlayer === 1) ? 2 : 1;
                this.endGame(winner, "Loss. Black is potted prematurely or with a foul.");
            }
            return;
        }

        
        if (cuePotted) {
            const cue = this.balls.find(b => b.type === 'cue');
            cue.inPocket = false; 
            cue.vx = 0; cue.vy = 0;
            cue.x = 250; cue.y = CONST.TABLE_HEIGHT / 2;
            
            this.switchPlayer();

            if (this.gameMode === 'pve' && this.gameState.currentPlayer === 2) {
                this.placingCueBall = false;
                this.triggerBot(); 
            } else {
                this.placingCueBall = true;
            }
            return;
        }

        
        if (coloredPotted.length > 0 && !playerGroups[currentPlayer]) {
            const firstBall = coloredPotted[0];
            this.gameState.playerGroups[currentPlayer] = firstBall.type;
            const otherPlayer = currentPlayer === 1 ? 2 : 1;
            this.gameState.playerGroups[otherPlayer] = (firstBall.type === 'solid' ? 'striped' : 'solid');
        }

        
        const myType = playerGroups[currentPlayer];
        const opponentType = myType === 'solid' ? 'striped' : (myType === 'striped' ? 'solid' : null);
        
        const hitOwnGroup = coloredPotted.some(b => b.type === myType);
        const hitOpponentGroup = opponentType ? coloredPotted.some(b => b.type === opponentType) : false;

       
        if (coloredPotted.length > 0 && !hitOpponentGroup) {
            this.syncPottedToUI(coloredPotted);
            this.updateInterface();
            
            
            if (this.gameMode === 'pve' && this.gameState.currentPlayer === 2) {
                this.gameState.turnActive = false;
                this.triggerBot();
            } else {
                this.gameState.turnActive = true;
            }
        } else {
            
            this.syncPottedToUI(coloredPotted);
            this.switchPlayer();
        }
    }

    syncPottedToUI(newBalls) {
        newBalls.forEach(ball => {
            const group = ball.type;
            if (group === this.gameState.playerGroups[1]) this.gameState.p1Balls.push(ball);
            else if (group === this.gameState.playerGroups[2]) this.gameState.p2Balls.push(ball);
        });
    }

    switchPlayer() {
        this.gameState.currentPlayer = this.gameState.currentPlayer === 1 ? 2 : 1;
        this.updateInterface();

        if (this.gameMode === 'pve' && this.gameState.currentPlayer === 2) {
            this.gameState.turnActive = false; 
            this.triggerBot();
        } else {
            this.gameState.turnActive = true; 
        }
    }

    triggerBot() {
        if (!this.gameRunning || !this.bot || this.botIsThinking) return;

        const cueBall = this.balls.find(b => b.type === 'cue');
        if (!cueBall || cueBall.inPocket) return;

        this.botIsThinking = true;

        setTimeout(() => {
            if (this.gameRunning && this.gameState.currentPlayer === 2) {
                const shot = this.bot.calculateShot();
                if (shot) {
                    if (cueBall) {
                        cueBall.vx = Math.cos(shot.angle) * shot.power;
                        cueBall.vy = Math.sin(shot.angle) * shot.power;
                        this.onShot(); 
                    }
                } else {
                    this.switchPlayer();
                }
            }
            this.botIsThinking = false;
        }, 1200); 
    }

    updateInterface() {
        const { currentPlayer, playerGroups } = this.gameState;
        const turnP1 = document.getElementById('turn-p1');
        if (turnP1) {
            const isActive = currentPlayer === 1;
            turnP1.classList.toggle('active', isActive);
            turnP1.innerText = isActive ? 'GOES' : 'WAIT';
        }
        const turnP2 = document.getElementById('turn-p2');
        if (turnP2) {
            const isActive = currentPlayer === 2;
            turnP2.classList.toggle('active', isActive);
            turnP2.innerText = isActive ? 'GOES' : 'WAIT';
        }
        const scoreEl = document.getElementById('score-counter');
        if (scoreEl) {
            scoreEl.innerText = `${this.scoreP1.toString().padStart(2, '0')}:${this.scoreP2.toString().padStart(2, '0')}`;
        }
        const t1 = document.getElementById('type-p1');
        const t2 = document.getElementById('type-p2');
        if (t1) t1.innerText = playerGroups[1] ? (playerGroups[1] === 'solid' ? 'SOLID' : 'STRIPED') : 'ANY';
        if (t2) t2.innerText = playerGroups[2] ? (playerGroups[2] === 'solid' ? 'SOLID' : 'STRIPED') : 'ANY';
        this.renderPottedBalls('potted-p1', this.gameState.p1Balls);
        this.renderPottedBalls('potted-p2', this.gameState.p2Balls);
    }

    renderPottedBalls(id, balls) {
        const container = document.getElementById(id);
        if (!container) return;
        container.innerHTML = '';
        balls.forEach(b => {
            const ballDiv = document.createElement('div');
            ballDiv.style.position = 'relative';
            ballDiv.style.width = '26px';
            ballDiv.style.height = '26px';
            ballDiv.style.borderRadius = '50%';
            ballDiv.style.backgroundColor = (b.type === 'striped') ? '#ffffff' : b.color;
            ballDiv.style.display = 'inline-block';
            ballDiv.style.margin = '3px';
            ballDiv.style.boxShadow = 'inset -2px -2px 4px rgba(0,0,0,0.4)';
            ballDiv.style.overflow = 'hidden';
            if (b.type === 'striped') {
                const stripe = document.createElement('div');
                stripe.style.position = 'absolute';
                stripe.style.top = '20%'; stripe.style.left = '0';
                stripe.style.width = '100%'; stripe.style.height = '60%';
                stripe.style.backgroundColor = b.color;
                ballDiv.appendChild(stripe);
            }
            const numCircle = document.createElement('div');
            numCircle.style.position = 'absolute';
            numCircle.style.top = '50%'; numCircle.style.left = '50%';
            numCircle.style.transform = 'translate(-50%, -50%)';
            numCircle.style.width = '12px'; numCircle.style.height = '12px';
            numCircle.style.backgroundColor = '#fff';
            numCircle.style.borderRadius = '50%';
            numCircle.style.display = 'flex';
            numCircle.style.alignItems = 'center';
            numCircle.style.justifyContent = 'center';
            const numText = document.createElement('span');
            numText.innerText = b.num;
            numText.style.fontSize = '8px';
            numText.style.fontWeight = 'bold';
            numText.style.color = '#000';
            numCircle.appendChild(numText);
            ballDiv.appendChild(numCircle);
            container.appendChild(ballDiv);
        });
    }

    endGame(winner, reason) {
        this.gameRunning = false;
        if (winner === 1) this.scoreP1++;
        else if (winner === 2) this.scoreP2++;
        this.updateInterface();
        const screen = document.getElementById('end-screen');
        if (screen) {
            document.getElementById('winner-text').innerText = `PLAYER ${winner} WINS!`;
            document.getElementById('win-reason').innerText = reason;
            screen.classList.remove('hidden');
        }
    }
}


window.startGame = (mode) => { window.game.start(mode); };
window.restartGame = () => {
    document.getElementById('end-screen').classList.add('hidden');
    window.game.initTable();
    window.game.gameRunning = true;
};
window.exitToMenu = () => {
    window.game.gameRunning = false;
    document.getElementById('end-screen').classList.add('hidden');
    document.getElementById('mode-menu').classList.add('hidden');
    document.getElementById('settings').classList.add('hidden');
    document.getElementById('menu-overlay').classList.remove('hidden');
};

if (!window.game) window.game = new Game();

window.ui = {
    showModeMenu: function(show) {
        document.getElementById('menu-overlay').classList.toggle('hidden', show);
        document.getElementById('mode-menu').classList.toggle('hidden', !show);
    },
    toggleSettings: function(show) {
        document.getElementById('menu-overlay').classList.toggle('hidden', show);
        document.getElementById('settings').classList.toggle('hidden', !show);
    }
};