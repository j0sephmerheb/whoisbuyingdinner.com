
import { toast } from 'sonner';
import * as gameService from '@/services/gameService';
import { GameData, PlayerData, CharacterType } from '@/services/gameService';

export const usePlayerActions = (
  game: GameData | null,
  currentPlayer: PlayerData | null,
  opponent: PlayerData | null
) => {
  // Select avatar
  const selectAvatar = async (avatarType: CharacterType) => {
    if (!currentPlayer) return false;
    
    const result = await gameService.selectAvatar(currentPlayer.id, avatarType);
    if (!result) {
      toast.error('Failed to select avatar');
    } else {
      toast.success(`You selected ${avatarType}!`);
    }
    return result;
  };

  // Roll dice - now only rolls for the current player
  const rollDice = async () => {
    if (!currentPlayer || !game) return;
    
    // Only change to rolling phase if currently in playing phase
    if (game.game_phase === 'playing') {
      await gameService.updateGamePhase(game.id, 'rolling');
    }
    
    // Roll dice for the current player only
    if (currentPlayer.dice_value === null) {
      const value = await gameService.rollDice(currentPlayer.id);
      console.log(`Player ${currentPlayer.name} rolled: ${value}`);
      
      // Check if both players have rolled dice
      if (opponent && opponent.dice_value !== null) {
        // Move to result phase after a short delay
        setTimeout(async () => {
          await gameService.updateGamePhase(game.id, 'result');
          
          // After showing result, process the round outcome
          setTimeout(() => {
            processRoundOutcome();
          }, 2000);
        }, 500);
      }
    }
  };

  // Process the outcome of a round
  const processRoundOutcome = async () => {
    if (!currentPlayer || !opponent || !game) return;
    
    const userRoll = currentPlayer.dice_value || 0;
    const opponentRoll = opponent.dice_value || 0;
    
    // Determine who won the round
    if (userRoll > opponentRoll) {
      // Current player wins
      const updatedCharacters = [...opponent.character_data];
      // Find first alive character and eliminate it
      const aliveIndex = updatedCharacters.findIndex(c => c.alive);
      if (aliveIndex !== -1) {
        updatedCharacters[aliveIndex].alive = false;
      }
      
      await gameService.updatePlayerAfterRound(
        opponent.id,
        opponent.score,
        updatedCharacters
      );
      
      toast.success("You won this round!");
    } else if (userRoll < opponentRoll) {
      // Opponent wins
      const updatedCharacters = [...currentPlayer.character_data];
      // Find first alive character and eliminate it
      const aliveIndex = updatedCharacters.findIndex(c => c.alive);
      if (aliveIndex !== -1) {
        updatedCharacters[aliveIndex].alive = false;
      }
      
      await gameService.updatePlayerAfterRound(
        currentPlayer.id,
        currentPlayer.score,
        updatedCharacters
      );
      
      toast.error("You lost this round!");
    } else {
      // Tie
      toast.info("It's a tie!");
    }
    
    // Reset dice values for both players
    await Promise.all([
      gameService.resetDiceValue(currentPlayer.id),
      gameService.resetDiceValue(opponent.id)
    ]);
    
    // Check if game is over
    const playerAliveCount = currentPlayer.character_data.filter(c => c.alive).length;
    const opponentAliveCount = opponent.character_data.filter(c => c.alive).length;
    
    if (playerAliveCount === 0 || opponentAliveCount === 0) {
      const winnerId = playerAliveCount > 0 ? currentPlayer.id : opponent.id;
      const loserId = playerAliveCount > 0 ? opponent.id : currentPlayer.id;
      
      await gameService.endGame(game.id, winnerId, loserId);
    } else {
      // Move to next round
      await gameService.updateGamePhase(game.id, 'playing');
    }
  };

  return {
    selectAvatar,
    rollDice
  };
};
