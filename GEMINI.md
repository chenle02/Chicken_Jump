## Project Overview

This project is for the development of a game called "Chicken Jump". The game is about a chicken trying to get back to its barn, navigating through various levels and obstacles.

## Development Plan

*   **Platform:** Web (JavaScript)
*   **Hosting:** GitHub & GitHub Pages
*   **Game Engine/Library:** Phaser 3
*   **Project Structure:** A simple `index.html` with a `game.js` file.
*   **Build Tools:** None for the prototype. Phaser will be loaded from a CDN.
*   **Assets:** Placeholder graphics will be used for the prototype.

## Roadmap (MVP)

### MVP Features
1.  **Playable Character:** A single chicken character controlled by the player.
2.  **Core Movement:** The chicken can move left, right, and jump.
3.  **One Level:** A single, non-scrolling screen.
4.  **One Obstacle:** A simple, repeating obstacle (e.g., a car moving horizontally).
5.  **Win/Lose Condition:** The player wins by reaching a "safe zone" at the top of the screen and loses if hit by the obstacle.

### Core Mechanics
*   **Player Control:** Keyboard input for movement (left, right, up for jump).
*   **Collision:** The game will detect collisions between the chicken and the obstacle. A collision results in a game over.
*   **Goal:** Reach the designated finish line.
