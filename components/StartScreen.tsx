
import React, { useState, useEffect } from 'react';
import { Leaderboard } from './Leaderboard';
import { HowToPlay } from './HowToPlay';
import { getLeaderboard } from '../utils/leaderboard';
import { LeaderboardEntry } from '../types';
import { PlayerProgress } from '../utils/progression';

interface StartScreenProps {
  onStart: () => void;
  progress: PlayerProgress;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart, progress }) => {
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const loadLeaderboard = async () => {
      const leaderboard = await getLeaderboard();
      setLeaderboard(leaderboard);
    };
    
    loadLeaderboard();
  }, []);

  const handleStart = () => {
    if (showHowToPlay) {
      setShowHowToPlay(false);
    }
    onStart();
  };

  const handleShowHowToPlay = () => {
    setShowHowToPlay(true);
  };

  if (showHowToPlay) {
    return <HowToPlay onClose={() => setShowHowToPlay(false)} />;
  }

  return (
    <div 
      className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center text-white text-center z-20 p-4 overflow-y-auto"
      onClick={(e) => e.stopPropagation()} // Prevent click bubbling to parent
    >
      <div className="w-full max-w-lg lg:max-w-xl space-y-6"
           onClick={(e) => e.stopPropagation()} // Extra protection for the content area
      >
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl mb-4 leading-tight" style={{ textShadow: '4px 4px 0 #000' }}>
            Hoppy! 🥕
          </h1>
        </div>

        {/* Progress */}
        <div className="bg-black bg-opacity-50 border border-yellow-400 rounded-lg p-3 text-left">
          <p className="text-sm sm:text-base font-bold text-yellow-300">Season Progress</p>
          <p className="text-xs sm:text-sm text-gray-200 mt-1">Level {progress.level} | Best {progress.bestScore} | Games {progress.totalGames}</p>
          <p className="text-xs sm:text-sm text-gray-300">Achievements unlocked: {progress.achievements.length}</p>
        </div>

        {/* Leaderboard */}
        <Leaderboard entries={leaderboard.slice(0, 5)} maxEntries={5} />

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleStart}
            className="w-full px-6 py-3 bg-green-500 border-4 border-green-700 text-white text-lg sm:text-xl font-bold hover:bg-green-600 active:bg-green-700 transition-colors shadow-lg touch-manipulation rounded"
          >
            🚀 Start Game
          </button>
          
          <button
            onClick={handleShowHowToPlay}
            className="w-full px-6 py-2 bg-blue-500 border-4 border-blue-700 text-white text-sm sm:text-lg font-bold hover:bg-blue-600 active:bg-blue-700 transition-colors shadow-lg touch-manipulation rounded"
          >
            📖 How to Play
          </button>
        </div>

        {/* Quick Controls Info */}
        <div className="text-xs sm:text-sm text-gray-400 mt-4">
          <p>
            <span className="hidden sm:inline">Press SPACE or UP ARROW</span>
            <span className="sm:hidden">Press SPACE or UP ARROW</span>
            {" "}to jump
          </p>
        </div>
      </div>
    </div>
  );
};
