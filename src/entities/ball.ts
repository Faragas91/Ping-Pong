import Phaser from "phaser";
import { 
    BALL_SPEED_FACTOR,  
    BALL_MAX_SCALE, 
    BALL_MIN_SCALE, 
} from "../constants/game";

export class Ball extends Phaser.Physics.Arcade.Image {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'ball');
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.setBounce(1);
        this.setCollideWorldBounds(true);
        this.setVelocity(0);
    }

    resetBall() {
        this.setVelocity(0);
        this.setPosition(this.scene.scale.width / 2, this.scene.scale.height / 2);
        this.setAcceleration(0, 0);
    }

    serveBall() {
        const directionX = Phaser.Math.RND.sign();
        const directionY = Phaser.Math.RND.sign();
        const speedX = Phaser.Math.Between(400, 700) * directionX;
        const speedY = Phaser.Math.Between(100, 350) * directionY;
        this.setVelocity(speedX, speedY);
    }

    changeSpeed(factor: number) {
        const velocity = this.body!.velocity;
        this.setVelocity(velocity.x * factor, velocity.y * factor )
    }

    reboundFromPlayer(player: Phaser.Physics.Arcade.Image, direction: number) {
        const hitboxOffset = Phaser.Math.Clamp((this.y - player.y) / (player.displayHeight / 2), -1, 1);
        const maxAngle = Phaser.Math.DegToRad(60);
        const jitter = Phaser.Math.DegToRad(Phaser.Math.Between(-5, 5));
        const angle = hitboxOffset * maxAngle + jitter;
        const speed = this.body!.velocity.length() * BALL_SPEED_FACTOR;
        
        this.setVelocity(
            Math.cos(angle) * speed * direction,
            Math.sin(angle) * speed
        )
    }

    scaleBy(factor: number) {
        const nextScale = Phaser.Math.Clamp(this.scaleY * factor, BALL_MIN_SCALE, BALL_MAX_SCALE);
        this.setScale(nextScale);
    }

    getScoredSide(): 'left' | 'right' | null {
        const halfWidth = this.displayWidth / 2;

        if (this.x - halfWidth > this.scene.scale.width) {
            return 'left';
        } 
        if (this.x + halfWidth < 0) {
            return 'right';
        } 
        return null;
    }
}