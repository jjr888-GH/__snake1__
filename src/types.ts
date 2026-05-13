export type Point = {
  x: number;
  y: number;
};

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type GameStatus = 'IDLE' | 'PLAYING' | 'GAME_OVER';

export const GRID_SIZE = 20;
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;
export const INITIAL_SPEED = 100;
