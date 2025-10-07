
export interface Tree {
  id: number;
  x: number;
  height: number;
  passed: boolean;
}

export enum GameStatus {
  Start,
  Playing,
  GameOver,
}
