class Renderer {
    constructor(canvas, gameInstance) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.game = gameInstance;
        
        
        this.canvas.width = CONST.TABLE_WIDTH;
        this.canvas.height = CONST.TABLE_HEIGHT;
    }

    start() {
        const frame = () => {
            if (this.game.gameRunning) {
                this.game.update();
            }
            this.draw(); 
            requestAnimationFrame(frame);
        };
        frame();
    }

    draw() {
        const { ctx } = this;
        const { width, height } = this.canvas;

        
        ctx.clearRect(0, 0, width, height);

        
        if (this.game.table) {
            this.game.table.draw(ctx);
        } else {
            
            ctx.fillStyle = '#2d6333'; 
            ctx.fillRect(0, 0, width, height);
        }

       
        if (this.game.input) {
            this.game.input.draw(ctx); 
        }

       
        this.game.balls.forEach(ball => {
            if (!ball.inPocket) {
                ball.draw(ctx);
            }
        });
    }

   
}

window.Renderer = Renderer;