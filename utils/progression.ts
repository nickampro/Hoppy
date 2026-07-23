export interface PlayerProgress {
  playerName: string;
  totalGames: number;
  totalScore: number;
  bestScore: number;
  xp: number;
  level: number;
  longestStreak: number;
  achievements: string[];
}

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
}

const PROGRESS_KEY = 'hoppy-player-progress';

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'first_run',
    title: 'First Hop',
    description: 'Finish your first run.'
  },
  {
    id: 'score_25',
    title: 'Tree Runner',
    description: 'Reach a score of 25 in a single run.'
  },
  {
    id: 'score_75',
    title: 'Sky Sprinter',
    description: 'Reach a score of 75 in a single run.'
  },
  {
    id: 'games_10',
    title: 'Committed Hopper',
    description: 'Play 10 runs.'
  },
  {
    id: 'total_500',
    title: 'Score Collector',
    description: 'Accumulate 500 total points.'
  },
  {
    id: 'streak_10',
    title: 'Combo Artist',
    description: 'Hit a streak of 10 in one run.'
  },
  {
    id: 'level_10',
    title: 'Forest Legend',
    description: 'Reach account level 10.'
  }
];

const DEFAULT_PROGRESS: PlayerProgress = {
  playerName: '',
  totalGames: 0,
  totalScore: 0,
  bestScore: 0,
  xp: 0,
  level: 1,
  longestStreak: 0,
  achievements: []
};

export const loadProgress = (): PlayerProgress => {
  try {
    const saved = localStorage.getItem(PROGRESS_KEY);
    if (!saved) {
      return DEFAULT_PROGRESS;
    }

    return { ...DEFAULT_PROGRESS, ...JSON.parse(saved) };
  } catch (error) {
    console.warn('Failed to load progression:', error);
    return DEFAULT_PROGRESS;
  }
};

export const savePlayerName = (name: string): PlayerProgress => {
  const progress = loadProgress();
  const updated = {
    ...progress,
    playerName: name.trim()
  };

  persistProgress(updated);
  return updated;
};

const getLevelFromXp = (xp: number): number => {
  return Math.max(1, Math.floor(Math.sqrt(xp / 60)) + 1);
};

const calculateXpGain = (score: number, maxStreak: number): number => {
  return Math.max(20, score * 6 + maxStreak * 10);
};

const unlockAchievements = (progress: PlayerProgress, score: number, maxStreak: number): string[] => {
  const unlocked: string[] = [];

  const maybeUnlock = (id: string, condition: boolean) => {
    if (condition && !progress.achievements.includes(id)) {
      progress.achievements.push(id);
      unlocked.push(id);
    }
  };

  maybeUnlock('first_run', progress.totalGames >= 1);
  maybeUnlock('score_25', score >= 25);
  maybeUnlock('score_75', score >= 75);
  maybeUnlock('games_10', progress.totalGames >= 10);
  maybeUnlock('total_500', progress.totalScore >= 500);
  maybeUnlock('streak_10', maxStreak >= 10);
  maybeUnlock('level_10', progress.level >= 10);

  return unlocked;
};

export const recordGameResult = (score: number, maxStreak: number): {
  progress: PlayerProgress;
  unlockedAchievementIds: string[];
  xpGained: number;
} => {
  const progress = loadProgress();
  const xpGained = calculateXpGain(score, maxStreak);

  progress.totalGames += 1;
  progress.totalScore += score;
  progress.bestScore = Math.max(progress.bestScore, score);
  progress.longestStreak = Math.max(progress.longestStreak, maxStreak);
  progress.xp += xpGained;
  progress.level = getLevelFromXp(progress.xp);

  const unlockedAchievementIds = unlockAchievements(progress, score, maxStreak);
  persistProgress(progress);

  return { progress, unlockedAchievementIds, xpGained };
};

const persistProgress = (progress: PlayerProgress): void => {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Failed to save progression:', error);
  }
};

export const getAchievementById = (id: string): AchievementDefinition | undefined => {
  return ACHIEVEMENTS.find(achievement => achievement.id === id);
};

export const getTierName = (score: number): string => {
  if (score >= 120) return 'Legend';
  if (score >= 80) return 'Master';
  if (score >= 45) return 'Expert';
  if (score >= 20) return 'Challenger';
  if (score >= 10) return 'Rising';
  return 'Rookie';
};
