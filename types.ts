
export interface Tree {
  id: number;
  x: number;
  height: number;
  width: number;
  type: 'tree' | 'rock' | 'river';
  passed: boolean;
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  date: string;
}

export enum GameStatus {
  Start,
  Playing,
  GameOver,
  NameEntry,
}
