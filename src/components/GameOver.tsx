import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface GameOverProps {
  loserName: string;
}

/**
 * Component displayed when the game is over
 * @param loserName - The name of the player who lost
 */
const GameOver: React.FC<GameOverProps> = ({ loserName }) => {
  const navigate = useNavigate();
  
  // Log when GameOver is rendered to help with debugging
  React.useEffect(() => {
    console.log('GameOver component rendered with loser:', loserName);
  }, [loserName]);
  
  /**
   * Handler for returning to home
   * Clears all stored state and navigates to home
   */
  const handleReturn = () => {
    // Clear any stored state
    sessionStorage.clear();
    localStorage.clear();
    // Navigate to home
    navigate('/', { replace: true });
  };
  
  return (
    <div className="flex items-center justify-center min-h-[50vh] w-full">
      <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl text-center">
        <h2 className="text-3xl font-bold mb-6">Game Over!</h2>
        
        <p className="text-2xl mb-8 text-gameAccent">
          <span className="font-bold">{loserName || 'Someone'}</span> is buying dinner!
        </p>
        
        <div className="space-y-4">
          <Button 
            onClick={handleReturn}
            className="bg-gameAccent hover:bg-gameAccent/80 w-full py-6 text-xl h-auto"
          >
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameOver;
