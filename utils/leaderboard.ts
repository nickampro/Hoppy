import { LeaderboardEntry } from '../types';

const LEADERBOARD_KEY = 'hoppy-leaderboard';
const MAX_ENTRIES = 3;

export const getLeaderboard = (): LeaderboardEntry[] => {
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

export const addLeaderboardEntry = (name: string, score: number): LeaderboardEntry[] => {
  console.log('🔍 addLeaderboardEntry called with:', { name, score });
  const currentLeaderboard = getLeaderboard();
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

export const isTopScore = (score: number): boolean => {
  console.log('🎯 isTopScore called with score:', score);
  const leaderboard = getLeaderboard();
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

export const getLeaderboardPosition = (score: number): number => {
  const leaderboard = getLeaderboard();
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


