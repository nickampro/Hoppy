
import React from 'react';

interface StartScreenProps {
  onStart: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center text-white text-center z-20 p-4">
      <h1 className="text-3xl sm:text-6xl mb-4" style={{ textShadow: '4px 4px 0 #000' }}>Hoppy Avoidance! 🥕</h1>
      <p className="text-lg sm:text-2xl mb-4 px-4">
        <span className="hidden sm:inline">Press UP ARROW or SPACE to Jump!</span>
        <span className="sm:hidden">Tap anywhere to Jump!</span>
      </p>
      <button
        onClick={onStart}
        className="px-6 py-3 sm:px-8 sm:py-4 bg-green-500 border-4 border-black text-white text-xl sm:text-3xl hover:bg-green-600 active:bg-green-700 transition-colors shadow-lg touch-manipulation"
      >
        Start Game
      </button>
    </div>
  );
};
