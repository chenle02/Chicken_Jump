const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }, // No gravity needed for this game type
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let player;
let cursors;
let obstacles;
let score = 0;
let scoreText;
let isGameOver = false;
let virtualKeys; // To hold the state of on-screen buttons

const game = new Phaser.Game(config);

function preload () {
    // Load image assets
    this.load.svg('background', 'assets/background.svg');
    this.load.svg('chicken', 'assets/chicken.svg');
    this.load.svg('fox_clown', 'assets/fox_clown.svg');
    // Removed: this.load.svg('arrow_left', 'assets/arrow_left.svg');
    // Removed: this.load.svg('arrow_right', 'assets/arrow_right.svg');
}

function create () {
    // Add the background image first
    this.add.image(400, 300, 'background');

    // Create the ground (visual only)
    this.add.rectangle(400, 580, 800, 40, 0x00ff00);

    // Create the player using the 'chicken' image
    player = this.physics.add.sprite(400, 550, 'chicken');
    player.setScale(0.5); // Scale the SVG down
    player.setCollideWorldBounds(true);
    player.body.allowGravity = false;

    // Create the obstacles group
    obstacles = this.physics.add.group();

    // Set up keyboard input
    cursors = this.input.keyboard.createCursorKeys();

    // Set up virtual keys for touch input
    virtualKeys = { left: false, right: false };

    // Removed: on-screen arrow sprites and their event listeners
    // const leftArrow = this.add.sprite(70, 530, 'arrow_left').setInteractive();
    // const rightArrow = this.add.sprite(180, 530, 'arrow_right').setInteractive();
    // leftArrow.setScale(0.8).setScrollFactor(0);
    // rightArrow.setScale(0.8).setScrollFactor(0);
    // leftArrow.on('pointerdown', () => { virtualKeys.left = true; });
    // leftArrow.on('pointerup', () => { virtualKeys.left = false; });
    // leftArrow.on('pointerout', () => { virtualKeys.left = false; });
    // rightArrow.on('pointerdown', () => { virtualKeys.right = true; });
    // rightArrow.on('pointerup', () => { virtualKeys.right = false; });
    // rightArrow.on('pointerout', () => { virtualKeys.right = false; });

    // Global touch event listeners for screen halves
    this.input.on('pointerdown', handleTouchStart, this);
    this.input.on('pointerup', handleTouchEnd, this);
    this.input.on('pointerout', handleTouchEnd, this); // In case pointer leaves screen while pressed

    // Collision detection between player and obstacles
    this.physics.add.collider(player, obstacles, hitObstacle, null, this);

    // Score text
    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' });

    // Timer to spawn new obstacles every second
    this.time.addEvent({
        delay: 1000,
        callback: spawnObstacle,
        callbackScope: this,
        loop: true
    });
}

function update () {
    if (isGameOver) {
        return;
    }

    // Player movement with keyboard OR on-screen controls
    if (cursors.left.isDown || virtualKeys.left) {
        player.setVelocityX(-300);
    } else if (cursors.right.isDown || virtualKeys.right) {
        player.setVelocityX(300);
    } else {
        player.setVelocityX(0);
    }

    // Update score
    score += 1;
    scoreText.setText('Score: ' + score);

    // Clean up obstacles that are off-screen
    obstacles.getChildren().forEach(obstacle => {
        if (obstacle.y > config.height + 50) { // Give some buffer
            obstacle.destroy();
        }
    });
}

function spawnObstacle() {
    if (isGameOver) {
        return;
    }

    // --- Speed Calculation ---
    // Increase speed every 2000 points. Cap at a certain max speed.
    const speedMultiplier = 1 + Math.floor(score / 2000) * 0.25;
    const maxSpeedMultiplier = 2.5;
    const finalMultiplier = Math.min(speedMultiplier, maxSpeedMultiplier);

    const verticalSpeed = 150 * finalMultiplier;
    const horizontalSpeedRange = 100 * finalMultiplier;
    // --- End of Speed Calculation ---

    const x = Phaser.Math.Between(0, config.width);
    const obstacle = obstacles.create(x, 0, 'fox_clown'); // Use the fox_clown image
    obstacle.setScale(0.5); // Scale the SVG down

    // Set velocities based on score
    obstacle.setVelocityY(verticalSpeed);
    obstacle.setVelocityX(Phaser.Math.Between(-horizontalSpeedRange, horizontalSpeedRange));

    // Make obstacles bounce off the screen edges
    obstacle.setCollideWorldBounds(true);
    obstacle.setBounce(1);
}

function handleTouchStart(pointer) {
    if (pointer.x < config.width / 2) {
        virtualKeys.left = true;
        virtualKeys.right = false;
    } else {
        virtualKeys.left = false;
        virtualKeys.right = true;
    }
}

function handleTouchEnd() {
    virtualKeys.left = false;
    virtualKeys.right = false;
}

function hitObstacle(player, obstacle) {
    this.physics.pause();
    player.setTint(0xff0000);
    isGameOver = true;
    this.add.text(300, 250, 'GAME OVER', { fontSize: '48px', fill: '#fff' });
}
