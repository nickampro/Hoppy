
import React from 'react';

interface ScoreboardProps {
  score: number;
  highScore: number;
  level?: number;
  streak?: number;
  multiplier?: number;
  tierName?: string;
}

const formatScore = (score: number) => score.toString().padStart(4, '0');

export const Scoreboard: React.FC<ScoreboardProps> = ({
  score,
  highScore,
  level = 1,
  streak = 0,
  multiplier = 1,
  tierName = 'Rookie'
}) => {
  return (
    <div className="absolute top-3 sm:top-4 left-2 right-2 px-2 sm:px-4 text-white text-sm sm:text-xl z-10" style={{ textShadow: '2px 2px 0 #000' }}>
      <div className="flex justify-between">
        <span className="tracking-wide">SCORE: {formatScore(score)}</span>
        <span className="hidden sm:inline pr-20 tracking-wide">HIGH SCORE: {formatScore(highScore)}</span>
        <span className="sm:hidden pr-20 tracking-wide">HI: {formatScore(highScore)}</span>
      </div>
      <div className="mt-1 flex justify-between text-xs sm:text-sm text-yellow-100">
        <span>LEVEL {level} | {tierName}</span>
        <span>STREAK {streak} | x{multiplier}</span>
      </div>
    </div>
  );
};
