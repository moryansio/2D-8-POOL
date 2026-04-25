class Ball {
    constructor(x, y, color, type, num) {
        this.x = x; 
        this.y = y;
        this.vx = 0; 
        this.vy = 0;
        this.color = color;
        this.type = type; // 'cue', 'solid', 'striped', 'black'
        this.num = num;   
        this.inPocket = false;
    }

    update() {
    if (this.inPocket) return;

   
    this.x += this.vx;
    this.y += this.vy;

    
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    
    if (speed > 0) {
       
        const frictionForce = 0.008; 
        
        
        const newSpeed = Math.max(0, speed - frictionForce);
        
       
        const ratio = newSpeed / speed;
        this.vx *= ratio;
        this.vy *= ratio;
    }

    
    if (speed < 0.2) {
        this.vx = 0;
        this.vy = 0;
    }

    
    const r = CONST.BALL_RADIUS;
    
   
    if (this.x - r < 0) {
        this.vx *= -0.8; 
        this.x = r;
    } else if (this.x + r > CONST.TABLE_WIDTH) {
        this.vx *= -0.8;
        this.x = CONST.TABLE_WIDTH - r;
    }

    
    if (this.y - r < 0) {
        this.vy *= -0.8;
        this.y = r;
    } else if (this.y + r > CONST.TABLE_HEIGHT) {
        this.vy *= -0.8;
        this.y = CONST.TABLE_HEIGHT - r;
    }
}

    draw(ctx) {
        if (this.inPocket) return;

        const r = CONST.BALL_RADIUS;

        ctx.save();
        
        
        ctx.beginPath();
        ctx.arc(this.x + 3, this.y + 3, r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fill();

        ctx.translate(this.x, this.y);

       
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fillStyle = (this.type === 'striped') ? '#ffffff' : this.color;
        ctx.fill();

        
        if (this.type === 'striped') {
            ctx.save();
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.clip(); 
            
            ctx.fillStyle = this.color;
            ctx.fillRect(-r, -r * 0.55, r * 2, r * 1.1);
            ctx.restore();
        }

        
        if (this.type !== 'cue') {
            ctx.beginPath();
            ctx.arc(0, 0, r * 0.45, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();

            ctx.fillStyle = '#000000';
            ctx.font = `bold ${r * 0.6}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.num, 0, 1);
        }

        
        const grad = ctx.createRadialGradient(-r*0.3, -r*0.3, r*0.1, 0, 0, r);
        grad.addColorStop(0, 'rgba(255,255,255,0.4)');
        grad.addColorStop(1, 'rgba(0,0,0,0.15)');
        
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.restore();
    }
}

