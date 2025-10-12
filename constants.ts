
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

export const GROUND_HEIGHT = 80;

export const RABBIT_WIDTH = 60;
export const RABBIT_HEIGHT = 50;
export const RABBIT_INITIAL_X = 50;
export const RABBIT_JUMP_VELOCITY = 22;
export const GRAVITY = -0.8;

export const TREE_WIDTH = 60;

// Progressive difficulty system:
// Game starts with smaller, easier trees and gradually increases difficulty
export const MIN_TREE_HEIGHT = 40;  // Starting minimum height (easier)
export const MAX_TREE_HEIGHT = 100; // Starting maximum height (easier)
export const LATE_GAME_MIN_HEIGHT = 60;  // Full difficulty minimum (original)
export const LATE_GAME_MAX_HEIGHT = 180; // Full difficulty maximum (original)
// Full difficulty is reached at score 20

export const INITIAL_GAME_SPEED = 2.5;  // Slower start for easier gameplay
export const GAME_SPEED_INCREMENT = 0.003;  // More gradual speed increase

export const HIGH_SCORE_KEY = 'hoppyAvoidanceHighScore';
