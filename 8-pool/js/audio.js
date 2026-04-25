class AudioManager {
    constructor() {
        this.bgMusic = new Audio('theme.ogg'); 
        this.bgMusic.loop = true;
        this.bgMusic.volume = 0.5;
        
        
        this.musicToggle = document.getElementById('musicToggle');
        this.volumeSlider = document.getElementById('volumeSlider');

        this.initListeners();
    }

    initListeners() {
        
        if (this.musicToggle) {
            this.musicToggle.onchange = (e) => {
                if (e.target.checked) this.playMusic();
                else this.bgMusic.pause();
            };
        }

        
        if (this.volumeSlider) {
            this.volumeSlider.oninput = (e) => {
                this.setVolume(e.target.value);
            };
        }
    }

    playMusic() {
        
        this.bgMusic.play().catch(e => {
            console.log("The sound is bloked. Need to be interacted with the buttons in the menu.");
        });
    }

    setVolume(value) {
        
        this.bgMusic.volume = value;
    }
}


window.audioManager = new AudioManager();