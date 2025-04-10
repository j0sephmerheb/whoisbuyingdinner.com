
import { useState } from 'react';
import * as gameService from '@/services/game';
import { GameData } from '@/services/game';

/**
 * Hook for managing game start functionality
 * The countdown has been removed as requested
 * @param game - The current game data
 * @returns Functions and state for managing game start
 */
export const useGameCountdown = (game: GameData | null) => {
  // We're keeping these states for compatibility, but we won't use the countdown
  const [countdownValue, setCountdownValue] = useState(0);
  const [isCountingDown, setIsCountingDown] = useState(false);

  /**
   * Starts the game immediately without a countdown
   * @returns A boolean indicating success or failure
   */
  const startCountdown = async () => {
    if (!game) return false;
    
    // First check if all players have selected avatars
    const allSelected = await gameService.checkAvatarSelection(game.id);
    if (!allSelected) {
      return false;
    }
    
    // Start the game immediately without countdown
    return await gameService.startGame(game.id);
  };

  return {
    countdownValue,
    isCountingDown,
    setIsCountingDown,
    setCountdownValue,
    startCountdown
  };
};
