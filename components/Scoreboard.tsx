
import React from 'react';

interface ScoreboardProps {
  score: number;
  highScore: number;
}

const formatScore = (score: number) => score.toString().padStart(4, '0');

export const Scoreboard: React.FC<ScoreboardProps> = ({ score, highScore }) => {
  return (
    <div className="absolute top-2 sm:top-4 left-0 right-0 flex justify-between px-2 sm:px-8 text-white text-sm sm:text-2xl z-10" style={{ textShadow: '2px 2px 0 #000' }}>
      <span>SCORE: {formatScore(score)}</span>
      <span className="hidden sm:inline">HIGH SCORE: {formatScore(highScore)}</span>
      <span className="sm:hidden">HI: {formatScore(highScore)}</span>
    </div>
  );
};
