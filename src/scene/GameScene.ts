import Phaser from "phaser";
import { 
    PLAYER_SPEED_Y, 
    LEFT_PLAYER_X, 
    RIGHT_PLAYER_X, 
    TIME_EVENT_COUNTDOWN, 
    BALL_SPEED_FACTOR,
    BALL_MAX_SCALE, 
    BALL_MIN_SCALE,
    PLAYER_MAX_SCALE,
    PLAYER_MIN_SCALE,
    BIGGER_FACTOR,
    SMALLER_FACTOR
} from "../constants/game";

export class GameScene extends Phaser.Scene {
    private leftPlayer!: Phaser.Physics.Arcade.Image;
    private rightPlayer!: Phaser.Physics.Arcade.Image;
    private controls!: {
        leftPlayer: {
            up: Phaser.Input.Keyboard.Key;
            down: Phaser.Input.Keyboard.Key;
            space: Phaser.Input.Keyboard.Key;
        };
        rightPlayer: {
            up: Phaser.Input.Keyboard.Key;
            down: Phaser.Input.Keyboard.Key;
            shift: Phaser.Input.Keyboard.Key;
        };
    };
    private ball!: Phaser.Physics.Arcade.Image;
    private leftPlayerScore: number = 0;
    private rightPlayerScore: number = 0;
    private scorePanel!: Phaser.GameObjects.Text;
    private eventText!: Phaser.GameObjects.Text;
    private countDown: number = TIME_EVENT_COUNTDOWN;
    private lowerPlayerSpeed: boolean = false;
    private fasterPlayerSpeed: boolean = false;
    private playerSpeed: number = PLAYER_SPEED_Y;
    private playerBigger?: Phaser.Physics.Arcade.Image;
    private playerSmaller?: Phaser.Physics.Arcade.Image;
    private ballBigger?: Phaser.Physics.Arcade.Image;
    private ballSmaller?: Phaser.Physics.Arcade.Image;
    private lastContact!: Phaser.Physics.Arcade.Image;
    private penultimateContact!: Phaser.Physics.Arcade.Image;
    private eventName: string = 'Normal';
    private eventTimer!: Phaser.Time.TimerEvent;
    private powerUpTimer!: Phaser.Time.TimerEvent;
    private gameEnd: boolean = false;
    private gameStart: boolean = false;
    
    constructor() {
        super('GameScene')
    }

    create() {
        this.add.image(0,0,'background').setOrigin(0, 0);
        this.leftPlayer = this.physics.add.image(LEFT_PLAYER_X, this.scale.height / 2, 'leftPlayer').setScale(0.5);
        this.rightPlayer = this.physics.add.image(RIGHT_PLAYER_X, this.scale.height / 2, 'rightPlayer').setScale(0.5);
        this.ball = this.physics.add.image(this.scale.width / 2, this.scale.height / 2, 'ball');

        this.ball.setVelocity(0);
        this.ball.setBounce(1);  
        this.ball.setCollideWorldBounds(true);

        this.physics.world.setBoundsCollision(
            false,
            false, 
            true,  
            true   
        );
        
        this.leftPlayer.setBounce(0);
        this.leftPlayer.setCollideWorldBounds(true);
        this.leftPlayer.setImmovable(true);
        this.leftPlayer.setPushable(false);

        this.rightPlayer.setBounce(0);
        this.rightPlayer.setCollideWorldBounds(true);
        this.rightPlayer.setImmovable(true);
        this.rightPlayer.setPushable(false);

        this.controls = {
            leftPlayer: {
                up: this.input.keyboard!.addKey(
                    Phaser.Input.Keyboard.KeyCodes.W
                ),
                down: this.input.keyboard!.addKey(
                    Phaser.Input.Keyboard.KeyCodes.S
                ),
                space: this.input.keyboard!.addKey(
                    Phaser.Input.Keyboard.KeyCodes.SPACE
                ),
            },
            rightPlayer: {
                up: this.input.keyboard!.addKey(
                    Phaser.Input.Keyboard.KeyCodes.UP
                ),
                down: this.input.keyboard!.addKey(
                    Phaser.Input.Keyboard.KeyCodes.DOWN
                ),
                shift: this.input.keyboard!.addKey(
                    Phaser.Input.Keyboard.KeyCodes.SHIFT
                ),
            }
        };

        this.sound.play('backgroundMusic', {
            loop: true,
            volume: 0.5
        });
        
        this.eventTimer = this.time.addEvent({
            delay: 1000,
            loop: true,
            callback: this.startNewEvent,
            callbackScope: this,
            paused: true,
        })

        this.powerUpTimer = this.time.addEvent({
            delay: 5000,
            loop: true,
            callback: this.spawnPowerUps,
            callbackScope: this,
            paused: true,
        })

        this.scorePanel = this.add.text(this.scale.width / 2 - 150, 10, 'P1: 0  P2: 0', {
            fontSize: '40px',
            color: '#0x37895',
            stroke: '#ffffff',
            strokeThickness: 4
        })

        this.eventText = this.add.text(this.scale.width -230, 10, `Next Event: 10 \n${this.eventName}`, {
            fontSize: '24px',
            color: '#0x37895',
            stroke: '#ffffff',
            strokeThickness: 2
        })

        this.physics.add.collider(this.leftPlayer, this.ball, this.handlePlayerBallCollission, undefined, this);
        this.physics.add.collider(this.rightPlayer, this.ball, this.handlePlayerBallCollission, undefined, this);    

    }

    update() {
        if (!this.gameStart) {
            this.serveBall();
        } 
        this.eventText.setText('Next Event: ' + this.countDown.toString(TIME_EVENT_COUNTDOWN) + '\n' + this.eventName);

        this.movePlayer(
            this.leftPlayer,
            this.controls.leftPlayer
        );

        this.movePlayer(
            this.rightPlayer,
            this.controls.rightPlayer
        );

        if (this.ball.x > this.scale.width) {
            this.leftPlayerScore++;
            this.resetGame();
        } else if (this.ball.x + this.ball.width < 0) {
            this.rightPlayerScore++
            this.resetGame();
        }
    }

    private resetGame() {
        this.resetBall();
        this.resetPlayer();
        this.scorePanel.setText(`P1: ${this.leftPlayerScore}  P2: ${this.rightPlayerScore} `);
        this.defaultSpeed();
        this.gameStart = false;
        this.countDown = TIME_EVENT_COUNTDOWN;
        this.eventName = "Normal";
        this.resetEvents();
        this.resetPowerUps();
    }

    resetPowerUps() {
        this.powerUpTimer.reset({
            delay: 5000,
            loop: true,
            callback: this.spawnPowerUps,
            callbackScope: this,
            paused: true,
        })
    }

    resetEvents() {
        this.eventTimer.reset({
            delay: 1000,
            loop: true,
            callback: this.startNewEvent,
            callbackScope: this,
            paused: true,
        });
    }

    private handlePlayerBallCollission: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback =
        (_player, ballObj) => {
            const player = _player as Phaser.Physics.Arcade.Image;
            const ball = ballObj as Phaser.Physics.Arcade.Image;
            this.penultimateContact = this.lastContact;
            this.lastContact = player;

            this.sound.play("ping", {
                loop: false,
                volume: 0.3
            });

            this.handleReboundBallFromPlayer(ball, player);
        };

    private handleReboundBallFromPlayer(ball: Phaser.Physics.Arcade.Image, player: Phaser.Physics.Arcade.Image) {
        const hitboxOffset = Phaser.Math.Clamp((ball.y - player.y) / (player.displayHeight / 2), -1, 1);
        const maxAngle = Phaser.Math.DegToRad(60);
        const jitter = Phaser.Math.DegToRad(Phaser.Math.Between(-5, 5));
        const angle = hitboxOffset * maxAngle + jitter;
        const speed = this.ball.body!.velocity.length() * BALL_SPEED_FACTOR;
        const direction = player === this.leftPlayer ? 1 : -1;

        ball.setVelocity(
            Math.cos(angle) * speed * direction,
            Math.sin(angle) * speed
        )
    }

    private handlePowerUpBallCollission: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback =
        (_powerUp, ballObj) => {

            const powerUp = _powerUp as Phaser.Physics.Arcade.Image;
            const ball = ballObj as Phaser.Physics.Arcade.Image;

            if (powerUp.texture.key === 'playerBigger') {
                if (this.lastContact ) {
                    this.applyScale(this.lastContact, BIGGER_FACTOR, PLAYER_MIN_SCALE, PLAYER_MAX_SCALE);
                }
            } else if (powerUp.texture.key === 'playerSmaller') {
                if (this.penultimateContact) {
                    this.applyScale(this.penultimateContact, SMALLER_FACTOR, PLAYER_MIN_SCALE, PLAYER_MAX_SCALE);
                }
            } else if (powerUp.texture.key === 'ballBigger' ) {
                this.applyScale(ball, BIGGER_FACTOR, BALL_MIN_SCALE, BALL_MAX_SCALE);
            } else if (powerUp.texture.key === 'ballSmaller') {
                this.applyScale(ball, SMALLER_FACTOR, BALL_MIN_SCALE, BALL_MAX_SCALE);
            }

            powerUp.destroy();
        };

    private applyScale(target: Phaser.GameObjects.Image, factor: number, min: number, max: number) {
        const nextScale = Phaser.Math.Clamp(target.scaleY * factor, min, max);
        target.setScale(nextScale);
    }

    private resetBall() {
        this.ball.setVelocity(0);
        this.ball.setPosition(this.scale.width / 2, this.scale.height / 2);
        this.ball.setAcceleration(0, 0);
    }

    private resetPlayer() {
        this.leftPlayer.setPosition(LEFT_PLAYER_X, this.scale.height / 2);
        this.rightPlayer.setPosition(RIGHT_PLAYER_X, this.scale.height / 2);
    }

    private randomEvent() {
        const randomNumber = Phaser.Math.Between(1, 4);
        switch (randomNumber) {
            case 1:
                this.handleBallSpeed(1.2);
                this.eventName = "Fast Ball";
                break;
            case 2:
                this.lowerPlayerSpeed = true;
                this.fasterPlayerSpeed = false;
                this.handlePlayerSpeed(1.2)
                this.eventName = "Slow Player";
                break
            case 3: 
                this.fasterPlayerSpeed = true;
                this.lowerPlayerSpeed = false;
                this.handlePlayerSpeed(2);
                this.eventName = "Fast Player"
                break;
            default:
                this.defaultSpeed()
                this.eventName = "Normal";
        }
    }

    startNewEvent() {
        this.countDown--;
        if (this.countDown <= 0) {
            this.randomEvent();
            this.countDown = TIME_EVENT_COUNTDOWN;
        }
    }

    private handleBallSpeed(factor: number) {
        const velocity = this.ball.body!.velocity;
        this.ball.setVelocity(velocity.x * factor, velocity.y * factor )
    }

    private handlePlayerSpeed(factor: number) {
        const leftPlayerVelocity = this.leftPlayer.body!.velocity;
        const rightPlayerVelocity = this.rightPlayer.body!.velocity;
        this.leftPlayer.setVelocity(leftPlayerVelocity.x, leftPlayerVelocity.y * factor);
        this.rightPlayer.setVelocity(rightPlayerVelocity.x, rightPlayerVelocity.y * factor);
    }

    private defaultSpeed() {
        this.lowerPlayerSpeed = false;
        this.fasterPlayerSpeed = false;
        this.handleBallSpeed(1);
        this.handlePlayerSpeed(1)
    }

    private movePlayer(player: Phaser.Physics.Arcade.Image, controls: {
        up: Phaser.Input.Keyboard.Key;
        down: Phaser.Input.Keyboard.Key;
    }) {

        if (this.lowerPlayerSpeed) {
            this.playerSpeed = PLAYER_SPEED_Y / 2;
        } else if (this.fasterPlayerSpeed) {
            this.playerSpeed = PLAYER_SPEED_Y * 2;
        } else {
            this.playerSpeed = PLAYER_SPEED_Y
        }
        
        if (controls.up.isDown) {
            player.setVelocityY(-this.playerSpeed);
        } else if (controls.down.isDown) {
            player.setVelocityY(this.playerSpeed);
        } else {
            player.setVelocityY(0);
        }
    }

    private spawnPowerUps() {

        const randomNumber = Phaser.Math.Between(1, 4);
        switch (randomNumber) {
            case 1:
                this.playerBigger = this.physics.add.image(Phaser.Math.Between(200, 800), Phaser.Math.Between(100, 400), 'playerBigger').setScale(0.5);
                this.physics.add.overlap(this.playerBigger, this.ball, this.handlePowerUpBallCollission, undefined, this);
                break;
            case 2:
                this.playerSmaller = this.physics.add.image(Phaser.Math.Between(200, 800), Phaser.Math.Between(100, 400), 'playerSmaller').setScale(0.5);
                this.physics.add.overlap(this.playerSmaller, this.ball, this.handlePowerUpBallCollission, undefined, this);
                break;
            case 3:
                this.ballBigger = this.physics.add.image(Phaser.Math.Between(200, 800), Phaser.Math.Between(100, 400), 'ballBigger').setScale(0.5);
                this.physics.add.overlap(this.ballBigger, this.ball, this.handlePowerUpBallCollission, undefined, this);
                break;
            case 4:
                this.ballSmaller = this.physics.add.image(Phaser.Math.Between(200, 800), Phaser.Math.Between(100, 400), 'ballSmaller').setScale(0.5);
                this.physics.add.overlap(this.ballSmaller, this.ball, this.handlePowerUpBallCollission, undefined, this);
                break;
        }
    }

    private serveBall() {
        if (Phaser.Input.Keyboard.JustDown(this.controls.leftPlayer.space) || Phaser.Input.Keyboard.JustDown(this.controls.rightPlayer.shift)) {
            const directionX = Phaser.Math.RND.sign();
            const directionY = Phaser.Math.RND.sign();
            const speedX = Phaser.Math.Between(400, 700) * directionX;
            const speedY = Phaser.Math.Between(100, 350) * directionY;

            this.ball.setVelocity(speedX, speedY);
            this.gameStart = true;
            this.eventTimer.paused = false;
            this.powerUpTimer.paused = false;
        }
    }
}
        
        
        