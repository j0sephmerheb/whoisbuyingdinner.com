
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface GameOverProps {
  loserName: string;
  onPlayAgain: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ loserName, onPlayAgain }) => {
  const navigate = useNavigate();
  
  // Log when GameOver is rendered to help with debugging
  React.useEffect(() => {
    console.log('GameOver component rendered with loser:', loserName);
  }, [loserName]);
  
  return (
    <div className="flex items-center justify-center min-h-[50vh] w-full">
      <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl text-center">
        <h2 className="text-3xl font-bold mb-6">Game Over!</h2>
        
        <p className="text-2xl mb-8 text-gameAccent">
          <span className="font-bold">{loserName}</span> is buying dinner!
        </p>
        
        <Button 
          onClick={onPlayAgain}
          className="bg-gameAccent hover:bg-gameAccent/80 w-full py-6 text-xl h-auto"
        >
          New Game
        </Button>
      </div>
    </div>
  );
};

export default GameOver;
