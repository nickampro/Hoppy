import React, { useState, useEffect } from 'react';

interface HowToPlayProps {
  onClose: () => void;
}

export const HowToPlay: React.FC<HowToPlayProps> = ({ onClose }) => {
  const [demoStep, setDemoStep] = useState(0);
  const [rabbitY, setRabbitY] = useState(50);
  
  // Simple demo animation
  useEffect(() => {
    const interval = setInterval(() => {
      setDemoStep((prev) => (prev + 1) % 4);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  // Rabbit bounce animation
  useEffect(() => {
    const interval = setInterval(() => {
      setRabbitY((prev) => {
        // Simple bounce animation
        if (demoStep === 1 || demoStep === 3) {
          return Math.max(20, prev - 5); // Jump up
        } else {
          return Math.min(50, prev + 3); // Fall down
        }
      });
    }, 100);

    return () => clearInterval(interval);
  }, [demoStep]);

  const getDemoText = (): string => {
    switch (demoStep) {
      case 0: return "Watch the rabbit...";
      case 1: return "Tap to jump!";
      case 2: return "Avoid the trees!";
      case 3: return "Keep jumping!";
      default: return "Watch the rabbit...";
    }
  };

  return (
    <div className="absolute inset-0 bg-black bg-opacity-90 flex flex-col justify-center items-center text-white z-25 p-4">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border-2 border-blue-500">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-blue-400">
            🎮 How to Play
          </h2>
          <p className="text-sm text-gray-300">
            Help Hoppy survive as long as possible!
          </p>
        </div>

        {/* Demo Area */}
        <div className="bg-blue-200 rounded-lg h-32 mb-4 relative overflow-hidden">
          {/* Simple sky background */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-300 to-blue-200"></div>
          
          {/* Ground */}
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-green-400"></div>
          
          {/* Animated rabbit */}
          <div 
            className="absolute text-2xl transition-all duration-300 ease-out"
            style={{ 
              left: '20px', 
              bottom: `${rabbitY}px`,
              transform: demoStep === 1 || demoStep === 3 ? 'rotate(-10deg)' : 'rotate(0deg)'
            }}
          >
            🐰
          </div>
          
          {/* Trees */}
          <div className="absolute bottom-4 right-16 text-3xl">🌲</div>
          <div className="absolute bottom-4 right-8 text-2xl">🌳</div>
          
          {/* Demo instruction */}
          <div className="absolute top-2 left-2 right-2 text-center">
            <p className="text-xs font-bold text-blue-800 bg-white bg-opacity-75 rounded px-2 py-1">
              {getDemoText()}
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🕹️</span>
            <div>
              <p className="font-bold text-sm">Controls:</p>
              <p className="text-xs text-gray-300">
                <span className="hidden sm:inline">Press SPACE or UP ARROW</span>
                <span className="sm:hidden">Tap anywhere</span>
                {" "}to make Hoppy jump
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🌲</span>
            <div>
              <p className="font-bold text-sm">Objective:</p>
              <p className="text-xs text-gray-300">
                Avoid the trees and survive as long as possible
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="text-2xl">📊</span>
            <div>
              <p className="font-bold text-sm">Scoring:</p>
              <p className="text-xs text-gray-300">
                Each tree you pass increases your score
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🏆</span>
            <div>
              <p className="font-bold text-sm">Leaderboard:</p>
              <p className="text-xs text-gray-300">
                Get a top 3 worldwide score to enter your name!
              </p>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded border-2 border-blue-700 transition-colors touch-manipulation"
        >
          🚀 Start Playing!
        </button>
      </div>
    </div>
  );
};