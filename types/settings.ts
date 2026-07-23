// Settings types and default values
export interface GameSettings {
  difficulty: 'easy' | 'normal';
  soundEnabled: boolean;
  ghostReplayEnabled: boolean;
  version: string;
}

export const DEFAULT_SETTINGS: GameSettings = {
  difficulty: 'normal',
  soundEnabled: true,
  ghostReplayEnabled: false,
  version: '1.2.7'
};

export const SETTINGS_STORAGE_KEY = 'hoppy-game-settings';