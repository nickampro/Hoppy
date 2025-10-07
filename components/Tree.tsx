
import React from 'react';
import { TREE_WIDTH, GROUND_HEIGHT } from '../constants';

interface TreeProps {
  x: number;
  height: number;
}

export const Tree: React.FC<TreeProps> = ({ x, height }) => {
  const trunkHeight = 20;
  const leavesHeight = height - trunkHeight;
  const trunkWidth = TREE_WIDTH / 2;

  return (
    <div
      className="absolute"
      style={{
        left: `${x}px`,
        bottom: `${GROUND_HEIGHT}px`,
        width: `${TREE_WIDTH}px`,
        height: `${height}px`,
      }}
    >
      <div
        className="absolute bottom-[20px] bg-[#348C31] border-2 border-black"
        style={{
          width: `${TREE_WIDTH}px`,
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
          left: `${(TREE_WIDTH - trunkWidth) / 2}px`,
        }}
      ></div>
    </div>
  );
};
