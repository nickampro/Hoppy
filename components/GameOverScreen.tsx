
import React from 'react';

interface GameOverScreenProps {
  score: number;
  highScore: number;
  onRestart: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, highScore, onRestart }) => {
  return (
    <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col justify-center items-center text-white text-center z-20">
      <h2 className="text-5xl mb-4" style={{ textShadow: '3px 3px 0 #000' }}>Game Over</h2>
      <p className="text-3xl mb-2">Your Score: {score}</p>
      <p className="text-xl mb-8">High Score: {highScore}</p>
      <button
        onClick={onRestart}
        className="px-8 py-4 bg-blue-500 border-4 border-black text-white text-3xl hover:bg-blue-600 transition-colors shadow-lg"
      >
        Restart
      </button>
    </div>
  );
};
