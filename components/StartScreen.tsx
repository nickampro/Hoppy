
import React, { useState, useEffect } from 'react';
import { Leaderboard } from './Leaderboard';
import { HowToPlay } from './HowToPlay';
import { getLeaderboard } from '../utils/leaderboard';
import { LeaderboardEntry } from '../types';

interface StartScreenProps {
  onStart: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    setLeaderboard(getLeaderboard());
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
    <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center text-white text-center z-20 p-4 overflow-y-auto">
      <div className="w-full max-w-md space-y-4">
        {/* Title */}
        <div className="mb-4">
          <h1 className="text-2xl sm:text-4xl mb-2" style={{ textShadow: '4px 4px 0 #000' }}>
            Hoppy Avoidance! 🥕
          </h1>
          <p className="text-sm sm:text-lg px-4 text-gray-300">
            Jump, dodge, survive!
          </p>
        </div>

        {/* Leaderboard */}
        <Leaderboard entries={leaderboard} />

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
            <span className="sm:hidden">Tap anywhere</span>
            {" "}to jump
          </p>
        </div>
      </div>
    </div>
  );
};
