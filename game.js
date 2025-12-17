const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
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
let obstacle;
let safeZone;

const game = new Phaser.Game(config);

function preload () {
    // No assets to load for the prototype
}

function create () {
    // Create the ground and make it a static physics body
    const ground = this.add.rectangle(400, 580, 800, 40, 0x00ff00);
    this.physics.add.existing(ground, true);

    // Create the safe zone
    safeZone = this.add.rectangle(400, 20, 800, 40, 0x0000ff);
    this.physics.add.existing(safeZone, true);


    // Create the player (chicken)
    player = this.physics.add.sprite(400, 550, null);
    player.setCollideWorldBounds(true);
    // Use a graphics object to create a simple white square for the player
    let playerGraphics = this.make.graphics({x: -15, y: -15});
    playerGraphics.fillStyle(0xffffff);
    playerGraphics.fillRect(0, 0, 30, 30);
    player.setTexture(playerGraphics.generateTexture('player', 30, 30));
    playerGraphics.destroy();


    // Create the obstacle (car)
    obstacle = this.physics.add.sprite(0, 400, null);
    obstacle.setImmovable(true);
    obstacle.body.allowGravity = false;
    // Use a graphics object to create a simple red rectangle for the obstacle
    let obstacleGraphics = this.make.graphics({x: -40, y: -15});
    obstacleGraphics.fillStyle(0xff0000);
    obstacleGraphics.fillRect(0, 0, 80, 30);
    obstacle.setTexture(obstacleGraphics.generateTexture('obstacle', 80, 30));
    obstacleGraphics.destroy();


    // Set up keyboard input
    cursors = this.input.keyboard.createCursorKeys();

    // Collision detection
    this.physics.add.collider(player, ground);
    this.physics.add.collider(player, obstacle, gameOver, null, this);
    this.physics.add.collider(player, safeZone, win, null, this);
}

function update () {
    // Player movement
    if (cursors.left.isDown) {
        player.setVelocityX(-160);
    } else if (cursors.right.isDown) {
        player.setVelocityX(160);
    } else {
        player.setVelocityX(0);
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-330);
    }

    // Obstacle movement
    obstacle.setVelocityX(200);
    if (obstacle.x > config.width) {
        obstacle.x = -40;
    }
}

function gameOver() {
    this.physics.pause();
    player.setTint(0xff0000);
    // You can add a "Game Over" text here
    this.add.text(300, 250, 'GAME OVER', { fontSize: '32px', fill: '#fff' });
}

function win() {
    this.physics.pause();
    player.setTint(0x00ff00);
    // You can add a "You Win" text here
    this.add.text(300, 250, 'YOU WIN!', { fontSize: '32px', fill: '#fff' });
}
