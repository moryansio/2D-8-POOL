class Table {
    constructor() {
        this.pockets = CONST.POCKETS;
    }

    draw(ctx) {
        const w = CONST.TABLE_WIDTH;
        const h = CONST.TABLE_HEIGHT;
        const borderSize = 25; 

        ctx.save();

     
        ctx.fillStyle = '#3e2723'; 
        ctx.fillRect(-borderSize, -borderSize, w + borderSize * 2, h + borderSize * 2);
        
    
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 2;
        ctx.strokeRect(-borderSize, -borderSize, w + borderSize * 2, h + borderSize * 2);

      
        const clothGrad = ctx.createRadialGradient(w / 2, h / 2, 100, w / 2, h / 2, w * 0.8);
        clothGrad.addColorStop(0, '#3a7d41'); 
        clothGrad.addColorStop(1, '#244d28');
        ctx.fillStyle = clothGrad;
        ctx.fillRect(0, 0, w, h);

    
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 15;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 10;
        ctx.strokeRect(0, 0, w, h);
        
      
        ctx.shadowBlur = 0;

       
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        
      
        ctx.beginPath();
        ctx.moveTo(250, 0);
        ctx.lineTo(250, h);
        ctx.stroke();

      
        ctx.beginPath();
        ctx.arc(650, h / 2, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();

      
        this.drawPockets(ctx);
        
        ctx.restore();
    }

    drawPockets(ctx) {
        this.pockets.forEach(p => {
            const r = CONST.POCKET_RADIUS;

         
            const pocketGrad = ctx.createRadialGradient(p.x, p.y, r * 0.2, p.x, p.y, r);
            pocketGrad.addColorStop(0, '#000000');
            pocketGrad.addColorStop(0.7, '#0a0a0a');
            pocketGrad.addColorStop(1, '#1a1a1a');

            ctx.beginPath();
            ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
            ctx.fillStyle = pocketGrad;
            ctx.fill();

         
            ctx.beginPath();
            ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
            ctx.strokeStyle = '#222'; 
            ctx.lineWidth = 4;
            ctx.stroke();

          
            ctx.beginPath();
            ctx.arc(p.x, p.y, r - 1, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.lineWidth = 1;
            ctx.stroke();
        });
    }

    checkPocket(ball) {
        return this.pockets.some(p => {
            const dist = Math.hypot(ball.x - p.x, ball.y - p.y);
           
            return dist < CONST.POCKET_RADIUS;
        });
    }
}

window.Table = Table;