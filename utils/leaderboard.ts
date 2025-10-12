import { LeaderboardEntry } from '../types';
import { getGlobalLeaderboard, submitScoreToAPI } from './api';

const LEADERBOARD_KEY = 'hoppy-leaderboard';
const MAX_ENTRIES = 3;

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
  console.log('🔍 addLeaderboardEntry called with:', { name, score });
  
  // Try to submit to API first
  try {
    const apiResult = await submitScoreToAPI(name.trim() || 'Anonymous', score);
    if (apiResult.success) {
      console.log('✅ Score submitted to API successfully, rank:', apiResult.rank);
    } else {
      console.warn('⚠️ API submission failed:', apiResult.error);
    }
  } catch (error) {
    console.warn('⚠️ API submission error:', error);
  }
  
  // Get current leaderboard (this will now fetch from API and cache locally)
  const currentLeaderboard = await getLeaderboard();
  console.log('📋 Current leaderboard:', currentLeaderboard);
  
  const newEntry: LeaderboardEntry = {
    name: name.trim() || 'Anonymous',
    score,
    date: new Date().toISOString(),
  };
  console.log('✨ New entry created:', newEntry);
  
  const updatedLeaderboard = [...currentLeaderboard, newEntry]
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_ENTRIES);
  console.log('📝 Updated leaderboard:', updatedLeaderboard);
  
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updatedLeaderboard));
    console.log('💾 Successfully saved to localStorage with key:', LEADERBOARD_KEY);
    
    // Verify it was saved
    const verification = localStorage.getItem(LEADERBOARD_KEY);
    console.log('🔎 Verification - what was actually saved:', verification);
  } catch (error) {
    console.error('❌ Error saving leaderboard:', error);
  }
  
  return updatedLeaderboard;
};

export const isTopScore = async (score: number): Promise<boolean> => {
  console.log('🎯 isTopScore called with score:', score);
  const leaderboard = await getLeaderboard();
  console.log('📊 Current leaderboard length:', leaderboard.length);
  console.log('📊 MAX_ENTRIES:', MAX_ENTRIES);
  
  // If less than max entries, it's automatically a top score
  if (leaderboard.length < MAX_ENTRIES) {
    const result = score >= 0; // Allow even score 0 if leaderboard is empty
    console.log('✅ Less than max entries, result:', result);
    return result;
  }
  
  // Check if score beats the lowest top score
  const lowestTopScore = leaderboard[leaderboard.length - 1]?.score || 0;
  const result = score > lowestTopScore;
  console.log('🏆 Full leaderboard, lowest score:', lowestTopScore, 'result:', result);
  return result;
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


