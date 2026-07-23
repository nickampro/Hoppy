
import React from 'react';

interface ScoreboardProps {
  score: number;
  highScore: number;
  level?: number;
  streak?: number;
  multiplier?: number;
  tierName?: string;
  ageLabel?: string;
  lives?: number;
  nextLevelScore?: number;
  seasonLevel?: number;
}

const formatScore = (score: number) => score.toString().padStart(4, '0');

export const Scoreboard: React.FC<ScoreboardProps> = ({
  score,
  highScore,
  level = 1,
  streak = 0,
  multiplier = 1,
  tierName = 'Rookie',
  ageLabel = 'Baby',
  lives = 1,
  nextLevelScore = 15,
  seasonLevel = 1,
}) => {
  return (
    <div className="absolute top-2 left-2 right-14 sm:right-16 px-1 sm:px-2 text-white text-[11px] sm:text-base z-10" style={{ textShadow: '2px 2px 0 #000' }}>
      <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 bg-black bg-opacity-35 border border-black px-2 py-1">
        <span className="tracking-wide">SCORE {formatScore(score)}</span>
        <span className="tracking-wide">HI {formatScore(highScore)}</span>
      </div>
      <div className="mt-1 flex flex-wrap justify-between gap-x-3 gap-y-1 text-[10px] sm:text-xs text-yellow-100">
        <span>RUN LVL {level} {tierName}</span>
        <span>STREAK {streak} x{multiplier}</span>
      </div>
      <div className="mt-1 flex flex-wrap justify-between gap-x-3 gap-y-1 text-[10px] sm:text-xs text-[#ffe9b5]">
        <span>AGE {ageLabel} | NEXT {nextLevelScore}</span>
        <span>SEASON LVL {seasonLevel}</span>
      </div>
      <div className="mt-1 flex flex-wrap justify-between gap-x-3 gap-y-1 text-[10px] sm:text-xs text-[#d8f5cc]">
        <span>LIVES {lives}</span>
      </div>
    </div>
  );
};
