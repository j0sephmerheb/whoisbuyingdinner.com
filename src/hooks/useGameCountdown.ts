
import { useState } from 'react';
import * as gameService from '@/services/gameService';
import { GameData } from '@/services/gameService';

export const useGameCountdown = (game: GameData | null) => {
  const [countdownValue, setCountdownValue] = useState(5);
  const [isCountingDown, setIsCountingDown] = useState(false);

  // Start countdown
  const startCountdown = async () => {
    if (!game) return false;
    
    // First check if all players have selected avatars
    const allSelected = await gameService.checkAvatarSelection(game.id);
    if (!allSelected) {
      return false;
    }
    
    // Start local countdown
    setIsCountingDown(true);
    let count = 5;
    setCountdownValue(count);
    
    const interval = setInterval(() => {
      count--;
      setCountdownValue(count);
      
      if (count <= 0) {
        clearInterval(interval);
        setIsCountingDown(false);
        
        // Actually start the game by updating the game phase to 'playing'
        gameService.startGame(game.id);
      }
    }, 1000);
    
    return true;
  };

  return {
    countdownValue,
    isCountingDown,
    setIsCountingDown,
    setCountdownValue,
    startCountdown
  };
};
