class Physics {
    /**
     * @param {Ball} b1 
     * @param {Ball} b2 
     */
    static resolveCollision(b1, b2) {
        
        if (b1.inPocket || b2.inPocket) return;

        const dx = b2.x - b1.x;
        const dy = b2.y - b1.y;
        const distSq = dx * dx + dy * dy; 
        const minPlayerDist = CONST.BALL_RADIUS * 2;

        
        if (distSq < minPlayerDist * minPlayerDist && distSq > 0) {
            const dist = Math.sqrt(distSq);
            
           
            const overlap = (minPlayerDist - dist);
            const nx = dx / dist; 
            const ny = dy / dist; 
            
            b1.x -= nx * overlap / 2;
            b1.y -= ny * overlap / 2;
            b2.x += nx * overlap / 2;
            b2.y += ny * overlap / 2;

            
            const v1n = b1.vx * nx + b1.vy * ny;
            const v2n = b2.vx * nx + b2.vy * ny;

            
            const relNormalVelocity = v1n - v2n;

            
            if (relNormalVelocity < 0) return;

            const restitution = 0.98;

            
            const impulse = (-(1 + restitution) * relNormalVelocity) / 2;

            
            b1.vx += impulse * nx;
            b1.vy += impulse * ny;
            b2.vx -= impulse * nx;
            b2.vy -= impulse * ny;

            
            const tx = -ny; 
            const ty = nx;  

            const v1t = b1.vx * tx + b1.vy * ty;
            const v2t = b2.vx * tx + b2.vy * ty;

            
            const frictionBetweenBalls = 0.04; 
            const tangentImpulse = (v1t - v2t) * frictionBetweenBalls;

            b1.vx -= tangentImpulse * tx;
            b1.vy -= tangentImpulse * ty;
            b2.vx += tangentImpulse * tx;
            b2.vy += tangentImpulse * ty;
        }
    }
}

window.Physics = Physics;