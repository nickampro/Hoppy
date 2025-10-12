import React, { useState, useEffect, useRef } from 'react';

interface NameEntryProps {
  score: number;
  position: number;
  onSubmit: (name: string) => void;
  onSkip: () => void;
}

export const NameEntry: React.FC<NameEntryProps> = ({ score, position, onSubmit, onSkip }) => {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus the input when component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📝 NameEntry form submitted!');
    console.log('📝 Current name:', name);
    console.log('📝 Is submitting:', isSubmitting);
    
    if (isSubmitting) {
      console.log('⏸️ Already submitting, returning early');
      return;
    }
    
    setIsSubmitting(true);
    console.log('📝 Set isSubmitting to true');
    
    // Call onSubmit immediately instead of using setTimeout
    const finalName = name.trim() || 'Anonymous';
    console.log('🚀 Calling onSubmit with:', finalName);
    onSubmit(finalName);
  };

  const handleSkip = () => {
    if (isSubmitting) return;
    onSkip();
  };

  const getPositionText = (pos: number): string => {
    const suffix = pos === 1 ? 'st' : pos === 2 ? 'nd' : pos === 3 ? 'rd' : 'th';
    return `${pos}${suffix}`;
  };

  return (
    <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col justify-center items-center text-white text-center z-30 p-4">
      <div className="bg-gradient-to-b from-yellow-400 to-yellow-600 text-black p-6 rounded-lg border-4 border-yellow-300 shadow-2xl max-w-sm w-full">
        {/* Celebration Header */}
        <div className="mb-4">
          <h2 className="text-2xl sm:text-3xl mb-2" style={{ textShadow: '2px 2px 0 #000' }}>
            🎉 NEW HIGH SCORE! 🎉
          </h2>
          <p className="text-lg font-bold">
            {getPositionText(position)} Place!
          </p>
          <p className="text-xl mt-2">
            Score: <span className="font-bold">{score}</span>
          </p>
        </div>

        {/* Name Entry Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="playerName" className="block text-sm font-bold mb-2">
              Enter your name:
            </label>
            <input
              ref={inputRef}
              id="playerName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 20))} // Limit to 20 chars
              placeholder="Your name"
              className="w-full px-3 py-2 text-black border-2 border-gray-300 rounded focus:border-blue-500 focus:outline-none text-center font-bold"
              maxLength={20}
              disabled={isSubmitting}
            />
            <p className="text-xs mt-1 text-gray-700">
              {name.length}/20 characters
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-bold rounded border-2 border-green-700 transition-colors touch-manipulation"
            >
              {isSubmitting ? '⏳ Saving...' : '💾 Save Score'}
            </button>
            <button
              type="button"
              onClick={handleSkip}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white font-bold rounded border-2 border-gray-700 transition-colors touch-manipulation"
            >
              Skip
            </button>
          </div>
        </form>

        {/* Instructions */}
        <p className="text-xs mt-4 text-gray-700">
          Your score will be saved to the leaderboard
        </p>
      </div>
    </div>
  );
};