
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

export const GROUND_HEIGHT = 80;

export const RABBIT_WIDTH = 60;
export const RABBIT_HEIGHT = 50;
export const RABBIT_INITIAL_X = 50;
export const RABBIT_JUMP_VELOCITY = 22;
export const GRAVITY = -0.8;

export const TREE_WIDTH = 60;
export const ROCK_WIDTH = 52;
export const RIVER_WIDTH = 95;

export const RABBIT_MOVE_SPEED = 6;
export const RABBIT_MIN_X = 30;
export const RABBIT_MAX_X = GAME_WIDTH - RABBIT_WIDTH - 30;

// Progressive difficulty system:
// Game starts with smaller, easier trees and gradually increases difficulty
export const MIN_TREE_HEIGHT = 40;  // Starting minimum height (easier)
export const MAX_TREE_HEIGHT = 100; // Starting maximum height (easier)
export const LATE_GAME_MIN_HEIGHT = 60;  // Full difficulty minimum (original)
export const LATE_GAME_MAX_HEIGHT = 180; // Full difficulty maximum (original)
// Full difficulty is reached at score 20

export const INITIAL_GAME_SPEED = 3.3;
export const GAME_SPEED_INCREMENT = 0.0028;

export const HIGH_SCORE_KEY = 'hoppyAvoidanceHighScore';
