
import { useAvatarSelection } from './useAvatarSelection';
import { useDiceRoller } from './useDiceRoller';
import { GameData, PlayerData } from '@/services/game';

/**
 * Hook that provides player action functionality in the game
 * This is now a simplified composite hook that delegates to more specialized hooks
 * @param game - The current game data
 * @param currentPlayer - The current player data
 * @param opponent - The opponent player data
 * @returns Functions for player actions and state
 */
export const usePlayerActions = (
  game: GameData | null,
  currentPlayer: PlayerData | null,
  opponent: PlayerData | null
) => {
  // Use the specialized hooks
  const { selectAvatar } = useAvatarSelection(currentPlayer);
  const { rollDice, isRolling } = useDiceRoller(game, currentPlayer, opponent);

  return {
    selectAvatar,
    rollDice,
    isRolling
  };
};
