import React from 'react';
import { useStore } from '../context/StoreContext';

export const FlyingCartParticles: React.FC = () => {
  const { flyingParticles } = useStore();

  if (flyingParticles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {flyingParticles.map((p) => {
        // Compute delta to header cart button (typically near top-right: clientX approx window.innerWidth - 60, clientY approx 30)
        const targetX = window.innerWidth - 65 - p.x;
        const targetY = 30 - p.y;

        return (
          <div
            key={p.id}
            className="fly-particle rounded-full overflow-hidden border-2 border-purple-300 w-12 h-12 bg-purple-900"
            style={
              {
                left: `${p.x - 24}px`,
                top: `${p.y - 24}px`,
                '--tx': `${targetX}px`,
                '--ty': `${targetY}px`
              } as React.CSSProperties
            }
          >
            <img
              src={p.image}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200';
              }}
            />
          </div>
        );
      })}
    </div>
  );
};
