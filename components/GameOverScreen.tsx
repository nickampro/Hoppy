
import React from 'react';

interface GameOverScreenProps {
  score: number;
  highScore: number;
  onRestart: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, highScore, onRestart }) => {
  return (
    <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col justify-center items-center text-white text-center z-20 p-4">
      <h2 className="text-3xl sm:text-5xl mb-4" style={{ textShadow: '3px 3px 0 #000' }}>Game Over</h2>
      <p className="text-xl sm:text-3xl mb-2">Your Score: {score}</p>
      <p className="text-lg sm:text-xl mb-6 sm:mb-8">High Score: {highScore}</p>
      <div className="space-y-3">
        <button
          onClick={onRestart}
          className="block px-6 py-3 sm:px-8 sm:py-4 bg-blue-500 border-4 border-black text-white text-xl sm:text-3xl hover:bg-blue-600 active:bg-blue-700 transition-colors shadow-lg touch-manipulation"
        >
          Restart
        </button>
        <p className="text-sm text-gray-300">
          <span className="hidden sm:inline">Press UP ARROW or SPACE to restart</span>
          <span className="sm:hidden">Tap anywhere to restart</span>
        </p>
      </div>
    </div>
  );
};
