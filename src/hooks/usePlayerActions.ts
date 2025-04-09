
import { useState } from 'react';
import { toast } from 'sonner';
import * as gameService from '@/services/game';
import { GameData, PlayerData, CharacterType, GamePhase } from '@/services/game';

export const usePlayerActions = (
  game: GameData | null,
  currentPlayer: PlayerData | null,
  opponent: PlayerData | null
) => {
  const [isRolling, setIsRolling] = useState(false);
  
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
    
    // Check if the game is in the correct phase
    if (game.game_phase !== 'playing' && game.game_phase !== 'rolling') {
      return;
    }
    
    // Check if this player has already rolled
    if (currentPlayer.dice_value !== null) {
      return;
    }
    
    setIsRolling(true);
    
    try {
      // Only change to rolling phase if currently in playing phase
      if (game.game_phase === 'playing') {
        await gameService.updateGamePhase(game.id, 'rolling');
      }
      
      // Roll dice for the current player only
      const value = await gameService.rollDice(currentPlayer.id);
      console.log(`[DEBUG] Player ${currentPlayer.id} (${currentPlayer.name}) rolled: ${value}`);
      
      // Check if both players have rolled dice
      if (opponent && opponent.dice_value !== null) {
        console.log(`[DEBUG] Both players have rolled - current: ${value}, opponent: ${opponent.dice_value}`);
        
        // Move to result phase after a short delay
        setTimeout(async () => {
          await gameService.updateGamePhase(game.id, 'result');
          
          // After showing result, process the round outcome
          setTimeout(() => {
            processRoundOutcome();
          }, 1500);
        }, 800);
      }
    } catch (error) {
      console.error('[DEBUG] Error rolling dice:', error);
      toast.error('Failed to roll dice. Try again.');
    } finally {
      setIsRolling(false);
    }
  };

  // Process the outcome of a round - COMPLETELY REWRITTEN WITH EXTRA LOGGING
  const processRoundOutcome = async () => {
    if (!currentPlayer || !opponent || !game) {
      console.error("[CRITICAL] Missing data to process outcome", { currentPlayer, opponent, game });
      return;
    }
    
    // Get the latest dice values
    const playerRoll = currentPlayer.dice_value;
    const opponentRoll = opponent.dice_value;
    
    console.log(`[ROUND OUTCOME] Processing outcome for game ${game.id}, round ${game.current_round}`);
    console.log(`[ROUND OUTCOME] Player ${currentPlayer.name} rolled: ${playerRoll}`);
    console.log(`[ROUND OUTCOME] Opponent ${opponent.name} rolled: ${opponentRoll}`);
    
    if (playerRoll === null || opponentRoll === null) {
      console.error("[CRITICAL] One of the players has not rolled yet");
      toast.error("Cannot process outcome - missing dice value");
      return;
    }
    
    // Determine round winner based purely on dice values
    let losingPlayerId: string | null = null;
    
    if (playerRoll > opponentRoll) {
      // Current player wins, opponent loses a character
      console.log(`[ROUND OUTCOME] ${currentPlayer.name} WINS with ${playerRoll} vs ${opponentRoll}`);
      losingPlayerId = opponent.id;
      toast.success("You won this round!");
    } 
    else if (playerRoll < opponentRoll) {
      // Opponent wins, current player loses a character
      console.log(`[ROUND OUTCOME] ${opponent.name} WINS with ${opponentRoll} vs ${playerRoll}`);
      losingPlayerId = currentPlayer.id;
      toast.error("You lost this round!");
    }
    else {
      // It's a tie - no characters are eliminated
      console.log(`[ROUND OUTCOME] TIE - both rolled ${playerRoll}`);
      toast.info("It's a tie! No characters lost.");
    }
    
    // Update the character data for the losing player if there is one
    if (losingPlayerId) {
      const losingPlayer = losingPlayerId === currentPlayer.id ? currentPlayer : opponent;
      console.log(`[ROUND OUTCOME] Updating character data for losing player: ${losingPlayer.name}`);
      
      const updatedCharacters = [...losingPlayer.character_data];
      const aliveIndex = updatedCharacters.findIndex(c => c.alive);
      
      if (aliveIndex !== -1) {
        console.log(`[ROUND OUTCOME] Setting character ${aliveIndex} to dead for player ${losingPlayer.name}`);
        updatedCharacters[aliveIndex].alive = false;
        
        try {
          await gameService.updatePlayerAfterRound(
            losingPlayerId,
            losingPlayer.score,
            updatedCharacters
          );
          console.log(`[ROUND OUTCOME] Successfully updated character data for ${losingPlayer.name}`);
        } catch (error) {
          console.error("[CRITICAL] Failed to update player after round:", error);
          toast.error("Error updating game state");
          return;
        }
      }
    }
    
    // Reset dice values for both players
    console.log("[ROUND OUTCOME] Resetting dice values for both players");
    try {
      await Promise.all([
        gameService.resetDiceValue(currentPlayer.id),
        gameService.resetDiceValue(opponent.id)
      ]);
      console.log("[ROUND OUTCOME] Dice values reset successfully");
    } catch (error) {
      console.error("[CRITICAL] Failed to reset dice values:", error);
      toast.error("Error resetting dice values");
      return;
    }
    
    // Check if game is over
    const playerAliveCount = currentPlayer.character_data.filter(c => c.alive).length;
    const opponentAliveCount = opponent.character_data.filter(c => c.alive).length;
    
    console.log(`[ROUND OUTCOME] Characters alive - ${currentPlayer.name}: ${playerAliveCount}, ${opponent.name}: ${opponentAliveCount}`);
    
    if (playerAliveCount === 0 || opponentAliveCount === 0) {
      // Determine the winner based on characters still alive
      const winnerId = playerAliveCount > 0 ? currentPlayer.id : opponent.id;
      const loserId = playerAliveCount > 0 ? opponent.id : currentPlayer.id;
      
      console.log(`[ROUND OUTCOME] Game over - Winner: ${winnerId}, Loser: ${loserId}`);
      try {
        await gameService.endGame(game.id, winnerId, loserId);
        console.log("[ROUND OUTCOME] Game ended successfully");
      } catch (error) {
        console.error("[CRITICAL] Failed to end game:", error);
        toast.error("Error ending game");
      }
    } else {
      // Increment round counter and move to next round
      const nextRound = game.current_round + 1;
      console.log(`[ROUND OUTCOME] Moving to round ${nextRound}`);
      
      try {
        // Update round number in database
        await supabase
          .from('games')
          .update({ current_round: nextRound })
          .eq('id', game.id);
        
        // Update game phase to playing
        await gameService.updateGamePhase(game.id, 'playing');
        console.log("[ROUND OUTCOME] Game phase updated to 'playing'");
      } catch (error) {
        console.error("[CRITICAL] Failed to update game for next round:", error);
        toast.error("Error moving to next round");
      }
    }
  };

  return {
    selectAvatar,
    rollDice,
    isRolling
  };
};
