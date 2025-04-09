
import React from 'react';

interface CountdownProps {
  value: number;
}

const GameCountdown: React.FC<CountdownProps> = ({ value }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-white text-center">
        <h2 className="text-4xl mb-4">Game starting in</h2>
        <div className="text-8xl font-bold text-gameAccent animate-pulse">
          {value}
        </div>
      </div>
    </div>
  );
};

export default GameCountdown;
