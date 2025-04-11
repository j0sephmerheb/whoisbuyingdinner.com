
import { useState } from 'react';
import { toast } from 'sonner';
import * as gameService from '@/services/game';
import { PlayerData, CharacterType } from '@/services/game';

/**
 * Hook that provides avatar selection functionality
 * @param currentPlayer - The current player data
 * @returns Function for selecting an avatar and state
 */
export const useAvatarSelection = (currentPlayer: PlayerData | null) => {
  const [isSelecting, setIsSelecting] = useState(false);

  /**
   * Selects an avatar for the current player
   * @param avatarType - The type of avatar to select
   * @returns Boolean indicating success or failure
   */
  const selectAvatar = async (avatarType: CharacterType) => {
    if (!currentPlayer) return false;
    
    setIsSelecting(true);
    console.log(`Selecting avatar ${avatarType} for player ${currentPlayer.id}`);
    
    try {
      const result = await gameService.selectAvatar(currentPlayer.id, avatarType);
      if (!result) {
        toast.error('Failed to select avatar');
      } else {
        // Show the actually selected avatar in the toast
        toast.success(`You selected ${avatarType}!`);
      }
      return result;
    } finally {
      setIsSelecting(false);
    }
  };

  return {
    selectAvatar,
    isSelecting
  };
};
