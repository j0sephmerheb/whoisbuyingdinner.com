
import React from 'react';
import { Button } from '@/components/ui/button';
import { useGame } from '@/context/GameContext';

const GameOver = () => {
  const { gameState, resetGame } = useGame();
  const { winner, userTeam } = gameState;
  
  const userWon = winner === userTeam;
  const isTie = winner === 'tie';
  
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl text-center">
        <h2 className="text-3xl font-bold mb-2">
          {userWon ? '🎉 Victory! 🎉' : isTie ? '🤝 Draw! 🤝' : '😞 Defeat! 😞'}
        </h2>
        
        <div className="text-6xl my-6">
          {userWon 
            ? userTeam === 'chicken' ? '🐔' : '🤠'
            : isTie 
              ? '🐔🤠' 
              : userTeam === 'chicken' ? '🤠' : '🐔'}
        </div>
        
        <p className="text-lg mb-6">
          {userWon 
            ? `Your ${userTeam === 'chicken' ? 'chickens' : 'cowboys'} are victorious!` 
            : isTie 
              ? 'Both teams fought with equal skill!'
              : `The ${userTeam === 'chicken' ? 'cowboys' : 'chickens'} have defeated you!`}
        </p>
        
        <Button 
          onClick={resetGame} 
          className="bg-gameAccent hover:bg-gameAccent/80 w-full py-6 text-xl h-auto"
        >
          Play Again
        </Button>
      </div>
    </div>
  );
};

export default GameOver;
