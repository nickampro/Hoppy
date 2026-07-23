import { LeaderboardEntry } from '../types';
import { getGlobalLeaderboard, submitScoreToAPI } from './api';

const LEADERBOARD_KEY = 'hoppy-leaderboard';
const MAX_ENTRIES = 10;

interface ScoreSubmissionResult {
  leaderboard: LeaderboardEntry[];
  rank: number | null;
  submittedToApi: boolean;
}

export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  try {
    // Try to get from global API first
    const apiResult = await getGlobalLeaderboard(MAX_ENTRIES, 'global');
    
    if (apiResult.success && apiResult.leaderboard) {
      // Convert API format to our format
      const apiEntries: LeaderboardEntry[] = apiResult.leaderboard.map(entry => ({
        name: entry.player_name,
        score: entry.score,
        date: entry.created_at
      }));
      
      // Cache locally for offline access
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(apiEntries));
      return apiEntries;
    } else {
      console.warn('Failed to fetch from API, falling back to localStorage:', apiResult.error);
    }
  } catch (error) {
    console.warn('API error, falling back to localStorage:', error);
  }
  
  // Fallback to localStorage
  try {
    const saved = localStorage.getItem(LEADERBOARD_KEY);
    if (!saved) return [];
    
    const entries: LeaderboardEntry[] = JSON.parse(saved);
    return entries.sort((a, b) => b.score - a.score).slice(0, MAX_ENTRIES);
  } catch (error) {
    console.error('Error loading leaderboard:', error);
    return [];
  }
};

export const addLeaderboardEntry = async (name: string, score: number): Promise<LeaderboardEntry[]> => {
  const result = await submitLeaderboardScore(name, score);
  return result.leaderboard;
};

export const submitLeaderboardScore = async (name: string, score: number): Promise<ScoreSubmissionResult> => {
  const playerName = name.trim() || 'Anonymous';
  let rank: number | null = null;
  let submittedToApi = false;

  try {
    const apiResult = await submitScoreToAPI(playerName, score);
    if (apiResult.success) {
      submittedToApi = true;
      rank = apiResult.rank ?? null;
    }
  } catch (error) {
    console.warn('Leaderboard API submission failed, using local fallback:', error);
  }

  const currentLeaderboard = await getLeaderboard();

  const newEntry: LeaderboardEntry = {
    name: playerName,
    score,
    date: new Date().toISOString(),
  };

  const updatedLeaderboard = [...currentLeaderboard, newEntry]
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_ENTRIES);

  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updatedLeaderboard));
  } catch (error) {
    console.error('Error saving leaderboard cache:', error);
  }

  return {
    leaderboard: updatedLeaderboard,
    rank,
    submittedToApi,
  };
};

export const isTopScore = async (score: number): Promise<boolean> => {
  const leaderboard = await getLeaderboard();
  
  // If less than max entries, it's automatically a top score
  if (leaderboard.length < MAX_ENTRIES) {
    return score >= 0;
  }
  
  // Check if score beats the lowest top score
  const lowestTopScore = leaderboard[leaderboard.length - 1]?.score || 0;
  return score > lowestTopScore;
};

export const getLeaderboardPosition = async (score: number): Promise<number> => {
  const leaderboard = await getLeaderboard();
  const position = leaderboard.findIndex(entry => score > entry.score);
  return position === -1 ? leaderboard.length + 1 : position + 1;
};

export const clearLeaderboard = (): void => {
  try {
    localStorage.removeItem(LEADERBOARD_KEY);
  } catch (error) {
    console.error('Error clearing leaderboard:', error);
  }
};

export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (error) {
    return 'Unknown';
  }
};


