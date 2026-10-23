import Phaser from "phaser";

export class PreloadScene extends Phaser.Scene {

    constructor() {
        super('PrelaodScene')
    }
    preload() {
        this.load.image('background', 'public/assets/background.png');
        this.load.image('ball', "public/assets/ball_red_small.png");
        this.load.image('leftPlayer', "public/assets/left_player.png");
        this.load.image('rightPlayer', "public/assets/right_player.png");
        this.load.image('playerBigger', "public/assets/player_bigger.png");
        this.load.image('playerSmaller', "public/assets/player_smaller.png");
        this.load.image('ballBigger', "public/assets/ball_bigger.png");
        this.load.image('ballSmaller', "public/assets/ball_smaller.png");
        this.load.audio('ping', "assets/audio/ping.mp3");
        this.load.audio('backgroundMusic', "assets/audio/background_music.mp3");
    }

    create() {
        this.scene.start('GameScene');
    }
}