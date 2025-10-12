
import React from 'react';

interface ScoreboardProps {
  score: number;
  highScore: number;
}

const formatScore = (score: number) => score.toString().padStart(4, '0');

export const Scoreboard: React.FC<ScoreboardProps> = ({ score, highScore }) => {
  return (
    <div className="absolute top-3 sm:top-4 left-2 right-2 flex justify-between px-2 sm:px-4 text-white text-sm sm:text-xl z-10" style={{ textShadow: '2px 2px 0 #000' }}>
      <span className="tracking-wide">SCORE: {formatScore(score)}</span>
      {/* Add padding-right to avoid gear button overlap and better spacing */}
      <span className="hidden sm:inline pr-20 tracking-wide">HIGH SCORE: {formatScore(highScore)}</span>
      <span className="sm:hidden pr-20 tracking-wide">HI: {formatScore(highScore)}</span>
    </div>
  );
};
