
import React from 'react';
import { TREE_WIDTH, GROUND_HEIGHT, RIVER_WIDTH, ROCK_WIDTH } from '../constants';

interface TreeProps {
  x: number;
  height: number;
  width?: number;
  type?: 'tree' | 'rock' | 'river';
}

export const Tree: React.FC<TreeProps> = ({ x, height, width = TREE_WIDTH, type = 'tree' }) => {
  if (type === 'river') {
    return (
      <div
        className="absolute border-2 border-black"
        style={{
          left: `${x}px`,
          bottom: `${GROUND_HEIGHT}px`,
          width: `${Math.max(width, RIVER_WIDTH)}px`,
          height: '22px',
          backgroundImage: 'repeating-linear-gradient(90deg, #1f4e79 0px, #1f4e79 8px, #2f77b5 8px, #2f77b5 16px)',
        }}
      >
        <div className="absolute -top-1 left-0 right-0 h-1 bg-[#8fc8ef] opacity-80" />
      </div>
    );
  }

  if (type === 'rock') {
    const rockWidth = Math.max(width, ROCK_WIDTH);
    return (
      <div
        className="absolute border-2 border-black"
        style={{
          left: `${x}px`,
          bottom: `${GROUND_HEIGHT}px`,
          width: `${rockWidth}px`,
          height: `${height}px`,
          backgroundImage: 'linear-gradient(135deg, #9ea2a8 0%, #6f747a 60%, #4f545a 100%)',
          clipPath: 'polygon(12% 100%, 0% 70%, 15% 20%, 45% 0%, 82% 18%, 100% 68%, 88% 100%)',
        }}
      />
    );
  }

  const trunkHeight = 20;
  const leavesHeight = height - trunkHeight;
  const trunkWidth = width / 2;

  return (
    <div
      className="absolute"
      style={{
        left: `${x}px`,
        bottom: `${GROUND_HEIGHT}px`,
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      <div
        className="absolute bottom-[20px] bg-[#348C31] border-2 border-black"
        style={{
          width: `${width}px`,
          height: `${leavesHeight}px`,
          left: '0px',
        }}
      >
        <div className="absolute bg-[#57A639] w-full h-1/3 top-0 left-0"></div>
        <div className="absolute bg-[#2A6E28] w-1/2 h-full top-0 right-0"></div>
      </div>
      <div
        className="absolute bottom-0 bg-[#8B4513] border-2 border-black"
        style={{
          width: `${trunkWidth}px`,
          height: `${trunkHeight}px`,
          left: `${(width - trunkWidth) / 2}px`,
        }}
      ></div>
    </div>
  );
};
