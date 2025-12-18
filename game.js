const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// --- Global Variables ---
let player;
let cursors;
let obstacles;
let gifts;
let bombs; // New group for bombs
let score;
let scoreText;
let lives;
let hearts;
let isGameOver;
let isInvincible;
let virtualKeys;
const MAX_OBSTACLES = 10; // Max number of obstacles on screen

const game = new Phaser.Game(config);

function preload () {
    this.load.svg('background', 'assets/background.svg');
    this.load.svg('chicken', 'assets/chicken.svg');
    this.load.svg('eagle', 'assets/eagle.svg'); // Load the new eagle asset
    this.load.svg('heart', 'assets/heart.svg');
    this.load.svg('gift', 'assets/gift.svg');
    this.load.svg('bomb', 'assets/bomb.svg'); // New bomb asset
}

function create () {
    // --- Reset Game State ---
    score = 0;
    lives = 3;
    isGameOver = false;
    isInvincible = false;

    // --- World and UI Setup ---
    this.add.image(400, 300, 'background');
    this.add.rectangle(400, 580, 800, 40, 0x00ff00);
    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' });

    // --- Hearts UI ---
    hearts = this.add.group();
    for (let i = 0; i < lives; i++) {
        const heart = hearts.create(config.width - 40 - (i * 45), 35, 'heart');
        heart.setScale(0.08).setScrollFactor(0);
    }

    // --- Player Setup ---
    player = this.physics.add.sprite(400, 550, 'chicken');
    player.setScale(0.5);
    player.setCircle(player.width / 4, player.width / 4, player.height / 4);
    player.setCollideWorldBounds(true);
    player.body.allowGravity = false;

    // --- Physics Groups ---
    obstacles = this.physics.add.group();
    gifts = this.physics.add.group();
    bombs = this.physics.add.group(); // New bombs group

    // --- Input Setup ---
    cursors = this.input.keyboard.createCursorKeys();
    virtualKeys = { left: false, right: false };
    this.input.on('pointerdown', handleTouchStart, this);
    this.input.on('pointerup', handleTouchEnd, this);
    this.input.on('pointerout', handleTouchEnd, this);

    // --- Colliders ---
    this.physics.add.collider(player, obstacles, hitObstacle, null, this);
    this.physics.add.collider(obstacles, obstacles); // Make eagles bounce off each other
    this.physics.add.overlap(player, gifts, collectGift, null, this);
    this.physics.add.overlap(player, bombs, collectBomb, null, this); // New bomb collider

    // --- Timed Events ---
    this.time.addEvent({ delay: 1000, callback: spawnObstacle, callbackScope: this, loop: true });
    this.time.addEvent({ delay: 15000, callback: spawnGift, callbackScope: this, loop: true });
    this.time.addEvent({ delay: 25000, callback: spawnBomb, callbackScope: this, loop: true }); // New bomb spawner
}

function update () {
    if (isGameOver) {
        return;
    }

    // --- Player Movement ---
    if (cursors.left.isDown || virtualKeys.left) {
        player.setVelocityX(-300);
    } else if (cursors.right.isDown || virtualKeys.right) {
        player.setVelocityX(300);
    } else {
        player.setVelocityX(0);
    }

    // --- Score and Cleanup ---
    score += 1;
    scoreText.setText('Score: ' + score);
    obstacles.getChildren().forEach(obstacle => { if (obstacle.y > config.height + 50) { obstacle.destroy(); } });
    gifts.getChildren().forEach(gift => { if (gift.y > config.height + 50) { gift.destroy(); } });
    bombs.getChildren().forEach(bomb => { if (bomb.y > config.height + 50) { bomb.destroy(); } });
}

function spawnObstacle() {
    // --- Obstacle Limit ---
    if (obstacles.countActive(true) >= MAX_OBSTACLES) {
        return;
    }

    if (isGameOver) { return; }
    const speedMultiplier = Math.min(2.5, 1 + Math.floor(score / 2000) * 0.25);
    const verticalSpeed = 250 * finalMultiplier; // Increased base speed from 100
    const horizontalSpeedRange = 180 * finalMultiplier; // Increased base range from 70

    const x = Phaser.Math.Between(0, config.width);
    const obstacle = obstacles.create(x, 0, 'eagle'); // Use the eagle image
    obstacle.setScale(0.5);
    obstacle.setCircle(obstacle.width / 4, obstacle.width / 4, obstacle.height / 4);

    obstacle.setVelocityY(verticalSpeed);
    obstacle.setVelocityX(Phaser.Math.Between(-horizontalSpeedRange, horizontalSpeedRange));
    obstacle.setCollideWorldBounds(true);
    obstacle.setBounce(Phaser.Math.FloatBetween(0.8, 1.0)); // Randomize bounciness
}

function spawnGift() {
    if (isGameOver) { return; }
    const x = Phaser.Math.Between(0, config.width);
    const gift = gifts.create(x, 0, 'gift');
    gift.setScale(0.6);
    gift.setVelocityY(100);
}

// --- New Function: spawnBomb ---
function spawnBomb() {
    if (isGameOver) { return; }
    const x = Phaser.Math.Between(0, config.width);
    const bomb = bombs.create(x, 0, 'bomb');
    bomb.setScale(0.6);
    bomb.setVelocityY(100);
}

function collectGift(player, gift) {
    gift.destroy();
    if (lives < 3) {
        lives++;
        const heart = hearts.create(config.width - 40 - ((lives - 1) * 45), 35, 'heart');
        heart.setScale(0.08).setScrollFactor(0);
    }
}

// --- New Function: collectBomb ---
function collectBomb(player, bomb) {
    bomb.destroy();
    obstacles.clear(true, true); // Destroy all obstacles
}

function handleTouchStart(pointer) {
    if (pointer.x < config.width / 2) { virtualKeys.left = true; virtualKeys.right = false; }
    else { virtualKeys.left = false; virtualKeys.right = true; }
}

function handleTouchEnd() {
    virtualKeys.left = false;
    virtualKeys.right = false;
}

function hitObstacle(player, obstacle) {
    if (isInvincible) {
        return;
    }

    lives--;
    const heart = hearts.getChildren()[hearts.getChildren().length - 1];
    if (heart) {
        heart.destroy();
    }

    if (lives <= 0) {
        // --- Game Over Logic ---
        this.physics.pause();
        isGameOver = true;
        player.setTint(0xff0000);
        this.add.text(300, 250, 'GAME OVER', { fontSize: '48px', fill: '#fff' });
        const replayButton = this.add.text(350, 350, 'Replay', {
            fontSize: '32px', fill: '#0f0', backgroundColor: '#333', padding: { x: 10, y: 5 }
        }).setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.scene.restart())
        .on('pointerover', () => replayButton.setStyle({ fill: '#ff0' }))
        .on('pointerout', () => replayButton.setStyle({ fill: '#0f0' }));
    } else {
        // --- Invincibility Logic ---
        isInvincible = true;
        obstacle.destroy();

        this.tweens.add({
            targets: player,
            alpha: 0.5,
            ease: 'Cubic.easeOut',
            duration: 150,
            repeat: 5,
            yoyo: true,
            onComplete: () => {
                player.alpha = 1;
                isInvincible = false;
            }
        });
    }
}
