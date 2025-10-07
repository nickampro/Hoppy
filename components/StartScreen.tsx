
import React from 'react';

interface StartScreenProps {
  onStart: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center text-white text-center z-20">
      <h1 className="text-6xl mb-4" style={{ textShadow: '4px 4px 0 #000' }}>Hoppy Avoidance! 🥕</h1>
      <p className="text-2xl mb-8">Press UP ARROW to Jump!</p>
      <button
        onClick={onStart}
        className="px-8 py-4 bg-green-500 border-4 border-black text-white text-3xl hover:bg-green-600 transition-colors shadow-lg"
      >
        Start Game
      </button>
    </div>
  );
};
