
import React from 'react';

interface GameHeaderProps {
  currentRound: number;
  playerName: string;
  opponentName: string;
}

const GameHeader: React.FC<GameHeaderProps> = ({ currentRound, playerName, opponentName }) => {
  return (
    <div className="flex items-center justify-between w-full mb-4">
      <div className="bg-gameAccent/10 px-4 py-2 rounded-lg">
        <span className="font-semibold">Round: {currentRound}</span>
      </div>
      
      <div className="bg-gameAccent/10 px-4 py-2 rounded-lg">
        <span className="font-semibold">
          {playerName} vs {opponentName || 'Opponent'}
        </span>
      </div>
    </div>
  );
};

export default GameHeader;
