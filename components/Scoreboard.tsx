
import React from 'react';

interface ScoreboardProps {
  score: number;
  highScore: number;
}

const formatScore = (score: number) => score.toString().padStart(4, '0');

export const Scoreboard: React.FC<ScoreboardProps> = ({ score, highScore }) => {
  return (
    <div className="absolute top-4 left-0 right-0 flex justify-between px-8 text-white text-2xl z-10" style={{ textShadow: '2px 2px 0 #000' }}>
      <span>SCORE: {formatScore(score)}</span>
      <span>HIGH SCORE: {formatScore(highScore)}</span>
    </div>
  );
};
