import { GameSettings, DEFAULT_SETTINGS, SETTINGS_STORAGE_KEY } from '../types/settings';

// Load settings from localStorage
export const loadSettings = (): GameSettings => {
  try {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (error) {
    console.warn('Failed to load settings:', error);
  }
  return DEFAULT_SETTINGS;
};

// Save settings to localStorage
export const saveSettings = (settings: GameSettings): void => {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    console.log('⚙️ Settings saved:', settings);
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
};

// Get latest version from local version.json instead of GitHub
export const getLatestVersion = async (): Promise<{
  version: string;
  downloadUrl: string;
  releaseNotes: string;
} | null> => {
  try {
    // Use local version.json instead of GitHub API
    const response = await fetch('/version.json?t=' + Date.now());
    
    if (!response.ok) {
      throw new Error(`Version fetch error: ${response.status}`);
    }
    
    const versionInfo = await response.json();
    
    return {
      version: versionInfo.version,
      downloadUrl: window.location.origin,
      releaseNotes: versionInfo.features ? versionInfo.features.join(', ') : 'Latest features'
    };
  } catch (error) {
    console.warn('Failed to fetch latest version:', error);
    return null;
  }
};

// Check if current version is outdated
export const isVersionOutdated = async (currentVersion: string): Promise<boolean> => {
  const latest = await getLatestVersion();
  if (!latest) return false;
  
  // Simple version comparison (assumes semantic versioning)
  const current = currentVersion.replace('v', '').split('.').map(n => parseInt(n));
  const latestNum = latest.version.replace('v', '').split('.').map(n => parseInt(n));
  
  for (let i = 0; i < Math.max(current.length, latestNum.length); i++) {
    const c = current[i] || 0;
    const l = latestNum[i] || 0;
    
    if (l > c) return true;
    if (l < c) return false;
  }
  
  return false;
};

// Play sound with settings check
export const playGameSound = (soundFile: string, settings: GameSettings): void => {
  if (!settings.soundEnabled) return;
  
  try {
    const audio = new Audio(soundFile);
    audio.volume = 0.3; // Lower volume for better UX
    audio.play().catch(e => console.warn(`Could not play sound ${soundFile}:`, e));
  } catch (e) {
    console.error(`Could not create audio for ${soundFile}:`, e);
  }
};