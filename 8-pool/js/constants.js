
const CONST = {
    
    TABLE_WIDTH: 1000,
    TABLE_HEIGHT: 500,

    
    BALL_RADIUS: 14,
    FRICTION: 0.988,
    
    // pockets 
    POCKET_RADIUS: 24,
    POCKETS: [
        { x: 0, y: 0, type: 'corner' },      // left up
        { x: 500, y: 0, type: 'side' },      // middle up
        { x: 1000, y: 0, type: 'corner' },    // right up
        { x: 0, y: 500, type: 'corner' },     // left bottom
        { x: 500, y: 500, type: 'side' },     // middle bottom
        { x: 1000, y: 500, type: 'corner' }   // right bottom
    ],

    
    COLORS: {
        TABLE_GREEN: '#2e7d32',
        TABLE_BORDER: '#3e2723',
        CLOTH_TEXT: 'rgba(255, 255, 255, 0.1)'
    }
};


window.CONST = CONST;