// Settings types and default values
export interface GameSettings {
  difficulty: 'easy' | 'normal';
  soundEnabled: boolean;
  version: string;
}

export const DEFAULT_SETTINGS: GameSettings = {
  difficulty: 'normal',
  soundEnabled: true,
  version: '1.1.0'
};

export const SETTINGS_STORAGE_KEY = 'hoppy-game-settings';