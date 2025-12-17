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

const game = new Phaser.Game(config);

function preload () {
    // Load the new chicken SVG asset
    this.load.svg('chicken', 'assets/chicken.svg');
}

function create () {
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

    // Player movement
    if (cursors.left.isDown) {
        player.setVelocityX(-300);
    } else if (cursors.right.isDown) {
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
    const x = Phaser.Math.Between(0, config.width);
    const obstacle = obstacles.create(x, 0, null);

    // Use a graphics object to create a simple red rectangle for the obstacle
    let obstacleGraphics = this.make.graphics({x: -20, y: -10});
    obstacleGraphics.fillStyle(0xff0000);
    obstacleGraphics.fillRect(0, 0, 40, 20);
    obstacle.setTexture(obstacleGraphics.generateTexture('obstacle_falling', 40, 20));
    obstacleGraphics.destroy();

    // Set vertical and new horizontal velocity
    obstacle.setVelocityY(200);
    obstacle.setVelocityX(Phaser.Math.Between(-150, 150));

    // Make obstacles bounce off the screen edges
    obstacle.setCollideWorldBounds(true);
    obstacle.setBounce(1);
}

function hitObstacle(player, obstacle) {
    this.physics.pause();
    player.setTint(0xff0000);
    isGameOver = true;
    this.add.text(300, 250, 'GAME OVER', { fontSize: '48px', fill: '#fff' });
}
