
import React, { useState, useEffect } from 'react';
import { Leaderboard } from './Leaderboard';
import { getLeaderboard } from '../utils/leaderboard';
import { LeaderboardEntry } from '../types';
import { AchievementDefinition, PlayerProgress } from '../utils/progression';

interface GameOverScreenProps {
  score: number;
  highScore: number;
  onRestart: () => void;
  rank: number | null;
  xpGained: number;
  unlockedAchievements: AchievementDefinition[];
  progress: PlayerProgress;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  score,
  highScore,
  onRestart,
  rank,
  xpGained,
  unlockedAchievements,
  progress
}) => {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const loadLeaderboard = async () => {
      const leaderboard = await getLeaderboard();
      setLeaderboard(leaderboard);
    };
    
    loadLeaderboard();
  }, []);

  return (
    <div 
      className="absolute inset-0 bg-black bg-opacity-70 flex flex-col justify-center items-center text-white text-center z-20 p-4 overflow-y-auto"
      onClick={(e) => e.stopPropagation()} // Prevent click bubbling to parent
    >
      <div className="w-full max-w-md space-y-4"
           onClick={(e) => e.stopPropagation()} // Extra protection for the content area
      >
        {/* Game Over Header */}
        <div>
          <h2 className="text-3xl sm:text-5xl mb-4" style={{ textShadow: '3px 3px 0 #000' }}>
            Game Over
          </h2>
          <p className="text-xl sm:text-3xl mb-2">Your Score: {score}</p>
          <p className="text-lg sm:text-xl mb-4">High Score: {highScore}</p>
          {rank !== null && (
            <p className="text-sm sm:text-base text-yellow-300 mb-2">Global Rank: #{rank}</p>
          )}
          <p className="text-sm sm:text-base text-green-300">+{xpGained} XP | Level {progress.level}</p>
        </div>

        {unlockedAchievements.length > 0 && (
          <div className="bg-yellow-900 bg-opacity-50 border border-yellow-500 rounded-lg p-3 text-left">
            <p className="text-sm font-bold text-yellow-200 mb-2">New Achievements</p>
            <div className="space-y-1">
              {unlockedAchievements.map((achievement) => (
                <p key={achievement.id} className="text-xs sm:text-sm text-yellow-50">
                  🏅 {achievement.title} - {achievement.description}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Leaderboard Toggle */}
        {!showLeaderboard ? (
          <div className="space-y-3">
            <button
              onClick={() => setShowLeaderboard(true)}
              className="w-full px-4 py-2 bg-yellow-500 border-4 border-yellow-700 text-white text-sm sm:text-lg font-bold hover:bg-yellow-600 active:bg-yellow-700 transition-colors shadow-lg touch-manipulation rounded"
            >
              🏆 View Leaderboard
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <Leaderboard entries={leaderboard.slice(0, 5)} currentScore={score} highlightNewEntry={true} maxEntries={5} />
            <button
              onClick={() => setShowLeaderboard(false)}
              className="w-full px-4 py-2 bg-gray-500 border-4 border-gray-700 text-white text-sm font-bold hover:bg-gray-600 active:bg-gray-700 transition-colors shadow-lg touch-manipulation rounded"
            >
              Hide Leaderboard
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onRestart}
            className="w-full px-6 py-3 sm:px-8 sm:py-4 bg-blue-500 border-4 border-blue-700 text-white text-xl sm:text-2xl font-bold hover:bg-blue-600 active:bg-blue-700 transition-colors shadow-lg touch-manipulation rounded"
          >
            🔄 Play Again
          </button>
          
          <p className="text-sm text-gray-300">
            <span className="hidden sm:inline">Press UP ARROW or SPACE to restart</span>
            <span className="sm:hidden">Press UP ARROW or SPACE to restart</span>
          </p>
        </div>
      </div>
    </div>
  );
};
