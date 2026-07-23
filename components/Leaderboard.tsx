import React from 'react';
import { LeaderboardEntry } from '../types';
import { formatDate } from '../utils/leaderboard';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentScore?: number;
  highlightNewEntry?: boolean;
  maxEntries?: number;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ 
  entries, 
  currentScore, 
  highlightNewEntry = false,
  maxEntries = 10
}) => {
  const formatScore = (score: number) => score.toString().padStart(4, '0');

  const getMedalEmoji = (position: number): string => {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🏅';
    }
  };

  const isNewEntry = (entry: LeaderboardEntry): boolean => {
    return highlightNewEntry && currentScore !== undefined && entry.score === currentScore;
  };

  if (entries.length === 0) {
    return (
      <div className="bg-gray-800 bg-opacity-90 rounded-lg p-4 border-2 border-gray-600">
        <h3 className="text-lg sm:text-xl font-bold text-center mb-4 text-yellow-400">
          🏆 LEADERBOARD 🏆
        </h3>
        <div className="text-center text-gray-400">
          <p className="text-sm">No scores yet!</p>
          <p className="text-xs mt-1">Be the first to set a record! 🐰</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 bg-opacity-90 rounded-lg p-4 border-2 border-gray-600">
      <h3 className="text-lg sm:text-xl font-bold text-center mb-4 text-yellow-400">
        🏆 TOP {maxEntries} SCORES 🏆
      </h3>
      
      <div className="space-y-2">
        {entries.map((entry, index) => {
          const position = index + 1;
          const isHighlighted = isNewEntry(entry);
          
          return (
            <div
              key={`${entry.name}-${entry.score}-${entry.date}`}
              className={`
                flex items-center justify-between p-2 rounded
                ${isHighlighted 
                  ? 'bg-yellow-400 text-black font-bold animate-pulse' 
                  : 'bg-gray-700 text-white'
                }
                transition-all duration-300
              `}
            >
              {/* Rank and Medal */}
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                <span className="text-lg">{getMedalEmoji(position)}</span>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm sm:text-base truncate">
                    {entry.name}
                  </div>
                  <div className="text-xs opacity-75 hidden sm:block">
                    {formatDate(entry.date)}
                  </div>
                </div>
              </div>

              {/* Score */}
              <div className="text-right">
                <div className="font-bold text-sm sm:text-lg">
                  {formatScore(entry.score)}
                </div>
                <div className="text-xs opacity-75">
                  #{position}
                </div>
              </div>

              {/* New Entry Indicator */}
              {isHighlighted && (
                <div className="ml-2">
                  <span className="text-lg animate-bounce">✨</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Fill empty slots to indicate target board size */}
      {entries.length < maxEntries && (
        <div className="mt-2 space-y-2">
          {Array.from({ length: maxEntries - entries.length }, (_, index) => {
            const position = entries.length + index + 1;
            return (
              <div
                key={`empty-${position}`}
                className="flex items-center justify-between p-2 rounded bg-gray-600 bg-opacity-50 text-gray-400"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getMedalEmoji(position)}</span>
                  <div className="text-sm">
                    --- Open Slot ---
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm">----</div>
                  <div className="text-xs">#{position}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};