
import React from 'react';
import { RABBIT_WIDTH, RABBIT_HEIGHT } from '../constants';

interface RabbitProps {
  y: number;
  x: number;
  isGameOver?: boolean;
  isGhost?: boolean;
  facing?: 'left' | 'right';
  scale?: number;
}

export const Rabbit: React.FC<RabbitProps> = ({
  y,
  x,
  isGameOver,
  isGhost = false,
  facing = 'right',
  scale = 1,
}) => {
  const transform = `${isGameOver ? 'rotate(-65deg) ' : ''}${facing === 'left' ? 'scaleX(-1) ' : ''}scale(${scale})`.trim();

  return (
    <div
      className="absolute pixel-perfect"
      style={{
        left: `${x}px`,
        bottom: `${y}px`,
        width: `${RABBIT_WIDTH}px`,
        height: `${RABBIT_HEIGHT}px`,
        opacity: isGhost ? 0.4 : 1,
        filter: isGhost ? 'saturate(0.25) brightness(1.2)' : 'none',
        transform,
        transformOrigin: 'center bottom',
        transition: 'transform 0.3s ease-in-out',
        pointerEvents: 'none',
      }}
    >
      <div className="absolute w-[36px] h-[26px] bg-[#fff9ef] border-2 border-black rounded-[12px]" style={{ bottom: '7px', left: '10px' }}></div>
      <div className="absolute w-[22px] h-[20px] bg-[#fff9ef] border-2 border-black rounded-[10px]" style={{ bottom: '19px', right: '4px' }}></div>
      <div className="absolute w-[9px] h-[20px] bg-[#fff9ef] border-2 border-black rounded-t-[6px]" style={{ top: '0px', right: '11px' }}></div>
      <div className="absolute w-[9px] h-[16px] bg-[#fff9ef] border-2 border-black rounded-t-[6px]" style={{ top: '4px', right: '1px' }}></div>
      <div className="absolute w-[4px] h-[11px] bg-[#ffb6cf] rounded-t-[2px]" style={{ top: '2px', right: '13px' }}></div>
      <div className="absolute w-[4px] h-[8px] bg-[#ffb6cf] rounded-t-[2px]" style={{ top: '7px', right: '3px' }}></div>
      <div className="absolute w-[5px] h-[5px] bg-black rounded-full" style={{ top: '18px', right: '7px' }}></div>
      <div className="absolute w-[6px] h-[6px] bg-[#ff8aa8] rounded-full" style={{ top: '25px', right: '6px' }}></div>
      <div className="absolute w-[10px] h-[8px] bg-[#fff9ef] border-2 border-black rounded-[4px]" style={{ bottom: '0px', left: '14px' }}></div>
      <div className="absolute w-[10px] h-[8px] bg-[#fff9ef] border-2 border-black rounded-[4px]" style={{ bottom: '0px', left: '28px' }}></div>
      <div className="absolute w-[10px] h-[10px] bg-white border-2 border-black rounded-full" style={{ bottom: '15px', left: '0px' }}></div>
    </div>
  );
};
