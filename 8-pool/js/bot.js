class PoolBot {
    constructor(game) {
        this.game = game;
        this.difficulty = 1;
    }

    calculateShot() {
        const cueBall = this.game.balls.find(b => b.type === 'cue');
        if (!cueBall) return null;

        const targetBalls = this.getTargetBalls();
        
        let bestShot = null;
        let highestScore = -Infinity;

        targetBalls.forEach(targetBall => {
            
            CONST.POCKETS.forEach(pocket => {
                const dxP = pocket.x - targetBall.x;
                const dyP = pocket.y - targetBall.y;
                const distToPocket = Math.hypot(dxP, dyP);
                
                const dirToPocketX = dxP / distToPocket;
                const dirToPocketY = dyP / distToPocket;

                
                if (!this.isPathClear(targetBall, pocket, [targetBall])) return;

                
                const ghostX = targetBall.x - dirToPocketX * (CONST.BALL_RADIUS * 2);
                const ghostY = targetBall.y - dirToPocketY * (CONST.BALL_RADIUS * 2);

                
                if (this.isPathClear(cueBall, {x: ghostX, y: ghostY}, [targetBall, cueBall])) {
                    
                    const dxG = ghostX - cueBall.x;
                    const dyG = ghostY - cueBall.y;
                    const distToGhost = Math.hypot(dxG, dyG);
                    const angleToGhost = Math.atan2(dyG, dxG);

                    
                    let score = 2000;
                    score -= distToPocket * 1.5;
                    score -= distToGhost * 0.5;

                    
                    const dot = (dxG/distToGhost) * dirToPocketX + (dyG/distToGhost) * dirToPocketY;
                    
                
                    if (dot < 0.1) return; 
                    score += dot * 600; 

                    if (score > highestScore) {
                        highestScore = score;
                        const error = (1 - this.difficulty) * (Math.random() - 0.5) * 0.1;
                        
                        bestShot = {
                            angle: angleToGhost + error,
                            power: Math.min(18, (distToPocket + distToGhost) / 45 + 6)
                        };
                    }
                }
            });
        });

       
        if (!bestShot && targetBalls.length > 0) {
            console.log("The bot didn't find a clear path, so it's relying on luck.");
            const fallbackBall = targetBalls[0];
            const dx = fallbackBall.x - cueBall.x;
            const dy = fallbackBall.y - cueBall.y;
            bestShot = {
                angle: Math.atan2(dy, dx),
                power: 12
            };
        }
        

        if (bestShot) console.log("The bot has selected a target. Rating:", Math.floor(highestScore));
        return bestShot;
    }

    getTargetBalls() {
        const currentPlayer = this.game.gameState.currentPlayer;
        const myGroup = this.game.gameState.playerGroups[currentPlayer];

        let balls = this.game.balls.filter(b => !b.inPocket && b.type !== 'cue');

        if (myGroup) {
            const myBalls = balls.filter(b => b.type === myGroup);
            if (myBalls.length > 0) return myBalls;
            return balls.filter(b => b.type === 'black');
        }

        return balls.filter(b => b.type !== 'black');
    }

    isPathClear(start, end, ignoreBalls = []) {
        for (let ball of this.game.balls) {
            if (ball.inPocket || ignoreBalls.some(b => b === ball)) continue;
            
            const dist = this.distToSegment(ball, start, end);
            if (dist < CONST.BALL_RADIUS * 1.9) return false; 
        }
        return true;
    }

    distToSegment(p, v, w) {
        const l2 = Math.pow(v.x - w.x, 2) + Math.pow(v.y - w.y, 2);
        if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
        let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
        t = Math.max(0, Math.min(1, t));
        return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
    }
}

window.PoolBot = PoolBot;