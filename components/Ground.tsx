
import React from 'react';
import { GROUND_HEIGHT } from '../constants';

export const Ground: React.FC = () => {
  return (
    <div
      className="absolute bottom-0 left-0 w-full bg-[#6B4F35] border-t-8 border-[#3A2D1E]"
      style={{
        height: `${GROUND_HEIGHT}px`,
        backgroundImage: 'repeating-linear-gradient(45deg, #7C5E40 25%, transparent 25%, transparent 75%, #7C5E40 75%, #7C5E40), repeating-linear-gradient(45deg, #7C5E40 25%, #6B4F35 25%, #6B4F35 75%, #7C5E40 75%, #7C5E40)',
        backgroundPosition: '0 0, 8px 8px',
        backgroundSize: '16px 16px',
      }}
    />
  );
};
