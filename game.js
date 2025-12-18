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

// --- New/Modified Global Variables ---
let player;
let cursors;
let obstacles;
let gifts; // For power-ups
let score;
let scoreText;
let lives;
let hearts; // UI display for lives
let isGameOver;
let isInvincible;
let virtualKeys;

const game = new Phaser.Game(config);

function preload () {
    this.load.svg('background', 'assets/background.svg');
    this.load.svg('chicken', 'assets/chicken.svg');
    this.load.svg('fox_clown', 'assets/fox_clown.svg');
    this.load.svg('heart', 'assets/heart.svg'); // New heart asset
    this.load.svg('gift', 'assets/gift.svg');   // New gift asset
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
    player.setCircle(player.width / 4, player.width / 4, player.height / 4); // Improved hitbox
    player.setCollideWorldBounds(true);
    player.body.allowGravity = false;

    // --- Physics Groups ---
    obstacles = this.physics.add.group();
    gifts = this.physics.add.group();

    // --- Input Setup ---
    cursors = this.input.keyboard.createCursorKeys();
    virtualKeys = { left: false, right: false };
    this.input.on('pointerdown', handleTouchStart, this);
    this.input.on('pointerup', handleTouchEnd, this);
    this.input.on('pointerout', handleTouchEnd, this);

    // --- Colliders ---
    this.physics.add.collider(player, obstacles, hitObstacle, null, this);
    this.physics.add.overlap(player, gifts, collectGift, null, this); // Overlap for collection

    // --- Timed Events ---
    this.time.addEvent({ delay: 1000, callback: spawnObstacle, callbackScope: this, loop: true });
    this.time.addEvent({ delay: 15000, callback: spawnGift, callbackScope: this, loop: true }); // Spawn gifts less often
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
}

function spawnObstacle() {
    if (isGameOver) { return; }
    const speedMultiplier = Math.min(2.5, 1 + Math.floor(score / 2000) * 0.25);
    const verticalSpeed = 150 * speedMultiplier;
    const horizontalSpeedRange = 100 * speedMultiplier;

    const x = Phaser.Math.Between(0, config.width);
    const obstacle = obstacles.create(x, 0, 'fox_clown');
    obstacle.setScale(0.5);
    obstacle.setCircle(obstacle.width / 4, obstacle.width / 4, obstacle.height / 4); // Improved hitbox

    obstacle.setVelocityY(verticalSpeed);
    obstacle.setVelocityX(Phaser.Math.Between(-horizontalSpeedRange, horizontalSpeedRange));
    obstacle.setCollideWorldBounds(true);
    obstacle.setBounce(1);
}

// --- New Function: spawnGift ---
function spawnGift() {
    if (isGameOver) { return; }
    const x = Phaser.Math.Between(0, config.width);
    const gift = gifts.create(x, 0, 'gift');
    gift.setScale(0.6);
    gift.setVelocityY(100); // Gifts fall slowly
}

// --- New Function: collectGift ---
function collectGift(player, gift) {
    gift.destroy();
    if (lives < 3) {
        lives++;
        const heart = hearts.create(config.width - 40 - ((lives - 1) * 45), 35, 'heart');
        heart.setScale(0.08).setScrollFactor(0);
    }
}

function handleTouchStart(pointer) {
    if (pointer.x < config.width / 2) { virtualKeys.left = true; virtualKeys.right = false; }
    else { virtualKeys.left = false; virtualKeys.right = true; }
}

function handleTouchEnd() {
    virtualKeys.left = false;
    virtualKeys.right = false;
}

// --- Reworked Function: hitObstacle ---
function hitObstacle(player, obstacle) {
    if (isInvincible) {
        return; // Player can't be hit
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
        obstacle.destroy(); // Destroy the obstacle that hit the player

        // Blink tween to show invincibility
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
