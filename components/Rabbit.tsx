
import React from 'react';
import { RABBIT_WIDTH, RABBIT_HEIGHT } from '../constants';

interface RabbitProps {
  y: number;
  x: number;
}

export const Rabbit: React.FC<RabbitProps> = ({ y, x }) => {
  return (
    <div
      className="absolute pixel-perfect"
      style={{
        left: `${x}px`,
        bottom: `${y}px`,
        width: `${RABBIT_WIDTH}px`,
        height: `${RABBIT_HEIGHT}px`,
        transform: `translateY(50%)`
      }}
    >
      <div className="absolute w-[44px] h-[28px] bg-white border-2 border-black" style={{ bottom: '4px', left: '0px' }}></div>
      <div className="absolute w-[24px] h-[24px] bg-white border-2 border-black" style={{ bottom: '16px', right: '0px' }}></div>
      <div className="absolute w-[8px] h-[20px] bg-white border-2 border-black" style={{ top: '0px', right: '12px' }}></div>
      <div className="absolute w-[8px] h-[16px] bg-white border-2 border-black" style={{ top: '4px', right: '2px' }}></div>
      <div className="absolute w-[4px] h-[10px] bg-pink-300" style={{ top: '2px', right: '14px' }}></div>
      <div className="absolute w-[4px] h-[8px] bg-pink-300" style={{ top: '6px', right: '4px' }}></div>
      <div className="absolute w-[16px] h-[16px] bg-white border-2 border-black rounded-full" style={{ bottom: '20px', left: '-8px' }}></div>
      <div className="absolute w-[4px] h-[4px] bg-black" style={{ top: '18px', right: '6px' }}></div>
      <div className="absolute w-[6px] h-[6px] bg-pink-400" style={{ top: '26px', right: '5px' }}></div>
      <div className="absolute w-[12px] h-[8px] bg-white border-2 border-black" style={{ bottom: '0px', left: '8px' }}></div>
      <div className="absolute w-[12px] h-[8px] bg-white border-2 border-black" style={{ bottom: '0px', left: '28px' }}></div>
    </div>
  );
};
