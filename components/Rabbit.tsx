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
  const facingLeft = facing === 'left';
  const directionTilt = facingLeft
    ? 'perspective(220px) rotateY(16deg) rotateZ(-3deg)'
    : 'perspective(220px) rotateY(12deg) rotateZ(0deg)';
  const facingFlip = facingLeft ? '' : 'scaleX(-1)';

  const transform = `${isGameOver ? 'rotate(-65deg) ' : ''}${directionTilt} ${facingFlip} scale(${scale})`.trim();

  return (
    <div
      className="absolute pixel-perfect"
      style={{
        left: `${x}px`,
        bottom: `${y}px`,
        width: `${RABBIT_WIDTH}px`,
        height: `${RABBIT_HEIGHT}px`,
        opacity: isGhost ? 0.35 : 1,
        filter: isGhost ? 'saturate(0.2) brightness(1.18)' : 'none',
        transform,
        transformOrigin: 'center bottom',
        transition: 'transform 0.28s ease-out',
        pointerEvents: 'none',
      }}
    >
      <svg viewBox="0 0 60 50" width="60" height="50" aria-hidden="true">
        <ellipse cx="30" cy="46" rx="16" ry="2.2" fill="rgba(0,0,0,0.25)" />

        <ellipse cx="29" cy="29" rx="18" ry="12" fill="#fff7f0" stroke="#111" strokeWidth="2" />
        <ellipse cx="18" cy="21" rx="10.5" ry="9" fill="#fff7f0" stroke="#111" strokeWidth="2" />

        <rect x="10" y="4" width="6" height="16" rx="3" fill="#fff7f0" stroke="#111" strokeWidth="2" />
        <rect x="16" y="2" width="6" height="19" rx="3" fill="#fff7f0" stroke="#111" strokeWidth="2" />
        <rect x="11.5" y="6" width="2.8" height="10" rx="1.4" fill="#ffb5cb" />
        <rect x="17.5" y="5" width="2.8" height="12" rx="1.4" fill="#ffb5cb" />

        <ellipse cx="18" cy="24" rx="3.2" ry="3.2" fill="#111" />
        <circle cx="19" cy="23" r="1" fill="#fff" />

        <ellipse cx="10.5" cy="28.5" rx="2.8" ry="2.4" fill="#ff91b2" stroke="#111" strokeWidth="1" />
        <path d="M8.8 31.8 Q11 33.2 13.2 31.8" stroke="#111" strokeWidth="1.2" fill="none" />

        <ellipse cx="42" cy="22" rx="6.2" ry="6.2" fill="#fff" stroke="#111" strokeWidth="2" />

        <rect x="24" y="36" width="8" height="6" rx="2" fill="#fff7f0" stroke="#111" strokeWidth="2" />
        <rect x="34" y="36" width="8" height="6" rx="2" fill="#fff7f0" stroke="#111" strokeWidth="2" />
      </svg>
    </div>
  );
};
