
let renderer, inputHandler;

window.onload = () => {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error("Critical error: Canvas not found!");
        return;
    }

    if (!window.game) {
        console.error("Error: The Game object is not initialized. Check the order of your HTML scripts!");
        return;
    }

    const gameInstance = window.game;
    
    if (typeof Renderer !== 'undefined') {
        renderer = new Renderer(canvas, gameInstance);
    }
    
    if (typeof InputHandler !== 'undefined') {
        inputHandler = new InputHandler(canvas, gameInstance);
        gameInstance.input = inputHandler;
    }

    gameInstance.exit = window.exitToMenu;

    if (renderer) renderer.start();
    
    console.log("The billiard system has been successfully connected to the Game object.");
};



window.startGame = (mode) => {
    hideAllScreens();
    
    const g = window.game;
    if (!g) return;

    
    g.start(mode); 

    document.getElementById('exit-btn')?.classList.remove('hidden');
    document.getElementById('p1-ui')?.classList.remove('hidden');
    document.getElementById('p2-ui')?.classList.remove('hidden');
    document.getElementById('score-counter')?.classList.remove('hidden');
    
    const p2Label = document.getElementById('p2-name-label');
    if (p2Label) p2Label.innerText = mode === 'pve' ? 'BOT' : 'PLAYER 2';

    
    if (mode === 'pve' && g.gameState.currentPlayer === 2) {
        g.triggerBot();
    }
};

window.exitToMenu = () => {
    if (window.game) window.game.gameRunning = false;
    
    hideAllScreens();
    document.getElementById('exit-btn')?.classList.add('hidden');
    document.getElementById('p1-ui')?.classList.add('hidden');
    document.getElementById('p2-ui')?.classList.add('hidden');
    document.getElementById('score-counter')?.classList.add('hidden');
    document.getElementById('menu-overlay')?.classList.remove('hidden');
    document.getElementById('main-menu')?.classList.remove('hidden');
};

window.restartGame = () => {
    document.getElementById('end-screen')?.classList.add('hidden');
    if (window.game) {
        
        window.game.start(window.game.gameMode);
    }
};

function hideAllScreens() {
    const screens = ['menu-overlay', 'main-menu', 'mode-menu', 'settings', 'end-screen'];
    screens.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
}

window.showModeMenu = (show) => {
    hideAllScreens();
    document.getElementById('menu-overlay')?.classList.remove('hidden');
    if (show) {
        document.getElementById('mode-menu')?.classList.remove('hidden');
    }
};

window.showSettings = (show) => {
    hideAllScreens();
    document.getElementById('menu-overlay')?.classList.remove('hidden');
    if (show) {
        document.getElementById('settings')?.classList.remove('hidden');
    }
};

window.ui = {
    showModeMenu: window.showModeMenu,
    toggleSettings: window.showSettings,
    exitToMenu: window.exitToMenu
};