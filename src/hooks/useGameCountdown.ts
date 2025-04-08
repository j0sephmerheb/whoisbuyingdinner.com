
import { useState } from 'react';
import * as gameService from '@/services/game';
import { GameData } from '@/services/game';

export const useGameCountdown = (game: GameData | null) => {
  const [countdownValue, setCountdownValue] = useState(0);
  const [isCountingDown, setIsCountingDown] = useState(false);

  // Start countdown - we'll just start the game without countdown now
  const startCountdown = async () => {
    if (!game) return false;
    
    // First check if all players have selected avatars
    const allSelected = await gameService.checkAvatarSelection(game.id);
    if (!allSelected) {
      return false;
    }
    
    // Tell server to start the game without countdown
    await gameService.startGame(game.id);
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
