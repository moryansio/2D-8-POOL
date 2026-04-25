class InputHandler {
    constructor(canvas, gameInstance) {
        this.canvas = canvas;
        this.game = gameInstance;
        this.isDragging = false;
        this.mouse = { x: 0, y: 0 };
        this.maxPower = 15; 
        this.powerScale = 0.10;
        this.init();
    }

    init() {
        
        this.canvas.onmousedown = (e) => {
            
            e.preventDefault();

            
            console.log("Cry! State:", {
                placing: this.game.placingCueBall,
                moving: this.game.isMoving(),
                turnActive: this.game.gameState ? this.game.gameState.turnActive : 'N/A'
            });

           
            if (this.game.placingCueBall) {
                this.placeBall();
                return;
            }

           
            if (!this.game.isMoving() && this.game.gameState && this.game.gameState.turnActive) {
                this.isDragging = true;
                console.log("Aiming has begun");
            }
        };

       
        window.onmousemove = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse = { 
                x: e.clientX - rect.left, 
                y: e.clientY - rect.top 
            };
        };

      
        window.onmouseup = () => {
            if (this.isDragging) {
                console.log("HIT!");
                this.shoot();
                this.isDragging = false;
            }
        };
    }

   
    placeBall() {
        const cueBall = this.game.balls.find(b => b.type === 'cue');
        if (!cueBall) return;
        
        const r = CONST.BALL_RADIUS;
        
        const targetX = Math.max(r, Math.min(this.mouse.x, CONST.TABLE_WIDTH - r));
        const targetY = Math.max(r, Math.min(this.mouse.y, CONST.TABLE_HEIGHT - r));

        
        const isOverlapping = this.game.balls.some(b => {
            if (b === cueBall || b.inPocket) return false;
            return Math.hypot(targetX - b.x, targetY - b.y) < r * 2.1; 
        });

        if (!isOverlapping) {
            cueBall.x = targetX;
            cueBall.y = targetY;
            cueBall.vx = 0;
            cueBall.vy = 0;
            cueBall.inPocket = false;
            this.game.placingCueBall = false;
            if (this.game.gameState) this.game.gameState.turnActive = true; 
            console.log("The cue ball is set");
        }
    }

    shoot() {
    const cueBall = this.game.balls.find(b => b.type === 'cue');
    if (!cueBall || cueBall.inPocket) return;

    const dx = cueBall.x - this.mouse.x;
    const dy = cueBall.y - this.mouse.y;
    const dist = Math.hypot(dx, dy);
    
    if (dist < 10) return;

    const power = Math.min(dist * this.powerScale, this.maxPower);
    const angle = Math.atan2(dy, dx);

    cueBall.vx = Math.cos(angle) * power;
    cueBall.vy = Math.sin(angle) * power;

   
    this.game.isWaitingForStop = true; 
    if (this.game.onShot) this.game.onShot();
    }

    draw(ctx) {
      
        if (this.game.placingCueBall) {
            this.drawPlacementPreview(ctx);
            return;
        }

    
        if (this.isDragging && !this.game.isMoving()) {
            this.drawCue(ctx);
        }
    }

    drawPlacementPreview(ctx) {
        const r = CONST.BALL_RADIUS;
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.mouse.x, this.mouse.y, r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.restore();
    }

    drawCue(ctx) {
        const cueBall = this.game.balls.find(b => b.type === 'cue');
        if (!cueBall || cueBall.inPocket) return;

        const dx = cueBall.x - this.mouse.x;
        const dy = cueBall.y - this.mouse.y;
        const angle = Math.atan2(dy, dx);
        const dist = Math.hypot(dx, dy);

        
        this.drawTrajectory(ctx, cueBall, angle);

       
        const cueLength = 300;
        const offset = 20 + (Math.min(dist, 200) * 0.2); 

        ctx.save();
        ctx.translate(cueBall.x, cueBall.y);
        ctx.rotate(angle + Math.PI); 
        
        
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(offset + 5, -2, cueLength, 6);

       
        const grad = ctx.createLinearGradient(0, -4, 0, 4);
        grad.addColorStop(0, '#5d4037');
        grad.addColorStop(0.5, '#a1887f');
        grad.addColorStop(1, '#5d4037');
        ctx.fillStyle = grad;
        ctx.fillRect(offset, -4, cueLength, 8);
        
      
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(offset, -4, 6, 8);
        
        ctx.restore();
    }

    drawTrajectory(ctx, cueBall, angle) {
        const dirX = Math.cos(angle);
        const dirY = Math.sin(angle);
        const r = CONST.BALL_RADIUS;

        let closestDist = 1000;
        let targetBall = null;

        this.game.balls.forEach(ball => {
            if (ball === cueBall || ball.inPocket) return;

            const vx = ball.x - cueBall.x;
            const vy = ball.y - cueBall.y;
            const proj = vx * dirX + vy * dirY;

            if (proj > 0) {
                const distToLine = Math.abs(vx * -dirY + vy * dirX);
                if (distToLine < r * 2) {
                    const offset = Math.sqrt(Math.pow(r * 2, 2) - Math.pow(distToLine, 2));
                    const collisionDist = proj - offset;
                    if (collisionDist < closestDist) {
                        closestDist = collisionDist;
                        targetBall = ball;
                    }
                }
            }
        });

        ctx.save();
        if (targetBall) {
            const impactX = cueBall.x + dirX * closestDist;
            const impactY = cueBall.y + dirY * closestDist;

            
            ctx.setLineDash([5, 5]);
            ctx.strokeStyle = 'rgba(255,255,255,0.4)';
            ctx.beginPath();
            ctx.moveTo(cueBall.x, cueBall.y);
            ctx.lineTo(impactX, impactY);
            ctx.stroke();

           
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.arc(impactX, impactY, r, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255,255,255,0.8)';
            ctx.stroke();

            
            const outAngle = Math.atan2(targetBall.y - impactY, targetBall.x - impactX);
            ctx.strokeStyle = '#ffff00';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(targetBall.x, targetBall.y);
            ctx.lineTo(targetBall.x + Math.cos(outAngle) * 80, targetBall.y + Math.sin(outAngle) * 80);
            ctx.stroke();
        } else {
          
            ctx.setLineDash([5, 10]);
            ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            ctx.beginPath();
            ctx.moveTo(cueBall.x, cueBall.y);
            ctx.lineTo(cueBall.x + dirX * 500, cueBall.y + dirY * 500);
            ctx.stroke();
        }
        ctx.restore();
    }
}


window.InputHandler = InputHandler;