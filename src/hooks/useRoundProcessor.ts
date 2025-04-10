
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import * as gameService from '@/services/game';
import { GameData, PlayerData } from '@/services/game';

// Define a type for the character data to fix the TypeScript errors
type CharacterData = {
  id: number;
  alive: boolean;
};

/**
 * Hook that provides functionality for processing game round outcomes
 * @param game - The current game data
 * @param currentPlayer - The current player data
 * @param opponent - The opponent player data
 * @returns Function for processing round outcomes
 */
export const useRoundProcessor = (
  game: GameData | null,
  currentPlayer: PlayerData | null,
  opponent: PlayerData | null
) => {
  /**
   * Processes the outcome of a round based on dice rolls
   * Updates player scores, character data, and checks for game over condition
   * @param roundData - Optional data containing dice roll values
   */
  const processRoundOutcome = async (roundData?: { 
    currentPlayerRoll: number;
    opponentRoll: number;
    currentPlayerId: string;
    opponentId: string;
  }) => {
    if (!game || !currentPlayer || !opponent) {
      console.error("Missing required data for processRoundOutcome", { game, currentPlayer, opponent });
      return;
    }
    
    // Use stored dice values if provided, otherwise use current values
    const currentPlayerRoll = roundData?.currentPlayerRoll ?? currentPlayer.dice_value;
    const opponentRoll = roundData?.opponentRoll ?? opponent.dice_value;
    
    if (currentPlayerRoll === null || opponentRoll === null) {
      toast.error("Error: One of the players hasn't rolled yet");
      return;
    }
    
    console.log(`Processing round outcome: Player rolled ${currentPlayerRoll}, Opponent rolled ${opponentRoll}`);
    
    // Determine winner of this round
    let winningPlayerId: string | null = null;
    let losingPlayerId: string | null = null;
    
    if (currentPlayerRoll > opponentRoll) {
      winningPlayerId = currentPlayer.id;
      losingPlayerId = opponent.id;
    } else if (opponentRoll > currentPlayerRoll) {
      winningPlayerId = opponent.id;
      losingPlayerId = currentPlayer.id;
    }
    
    // Update the character data for the losing player if there is one
    if (losingPlayerId) {
      const losingPlayer = losingPlayerId === currentPlayer.id ? currentPlayer : opponent;
      const winningPlayer = winningPlayerId === currentPlayer.id ? currentPlayer : opponent;
      
      // Create a deep copy of the loser's character data to avoid mutations
      const updatedCharacters = JSON.parse(JSON.stringify(losingPlayer.character_data));
      
      // Find the FIRST alive character and mark it as defeated
      const aliveIndex = updatedCharacters.findIndex((c: { alive: boolean }) => c.alive);
      
      if (aliveIndex !== -1) {
        // Only update one character at a time
        updatedCharacters[aliveIndex].alive = false;
        
        try {
          // Update both players - increment score for winner and update character data for loser
          await Promise.all([
            gameService.updatePlayerAfterRound(
              losingPlayerId,
              losingPlayer.score,
              updatedCharacters
            ),
            gameService.updatePlayerAfterRound(
              winningPlayerId,
              winningPlayer.score + 1, // Increment score for winner
              winningPlayer.character_data
            )
          ]);
        } catch (error) {
          toast.error("Error updating game state");
          return;
        }
      }
    }
    
    // Reset dice values for both players
    try {
      await Promise.all([
        gameService.resetDiceValue(currentPlayer.id),
        gameService.resetDiceValue(opponent.id)
      ]);
    } catch (error) {
      toast.error("Error resetting dice values");
      return;
    }
    
    // Check if game is over after updating characters - get fresh data from the database
    try {
      const { data: freshCurrentPlayer } = await supabase
        .from('players')
        .select('*')
        .eq('id', currentPlayer.id)
        .maybeSingle();
        
      const { data: freshOpponent } = await supabase
        .from('players')
        .select('*')
        .eq('id', opponent.id)
        .maybeSingle();
        
      if (!freshCurrentPlayer || !freshOpponent) {
        console.error("Could not get fresh player data");
        return;
      }
      
      // Properly type the character data for TypeScript
      const currentPlayerCharacters = (freshCurrentPlayer.character_data as CharacterData[]) || [];
      const opponentCharacters = (freshOpponent.character_data as CharacterData[]) || [];
      
      const playerAliveCount = currentPlayerCharacters.filter(c => c.alive).length;
      const opponentAliveCount = opponentCharacters.filter(c => c.alive).length;
      
      console.log(`Player alive characters: ${playerAliveCount}, Opponent alive characters: ${opponentAliveCount}`);
      
      if (playerAliveCount === 0 || opponentAliveCount === 0) {
        // Determine the winner and loser based on who has remaining characters
        const winnerId = playerAliveCount > 0 ? currentPlayer.id : opponent.id;
        const loserId = playerAliveCount > 0 ? opponent.id : currentPlayer.id;
        
        console.log(`Game over! Winner: ${winnerId}, Loser: ${loserId}`);
        
        // Set winner/loser first then changes phase to over
        const success = await gameService.endGame(game.id, winnerId, loserId);
        
        if (success) {
          toast.success(`Game over! ${winnerId === currentPlayer.id ? 'You won!' : 'You lost!'}`);
        } else {
          console.error("Failed to end game properly");
        }
      } else {
        // Increment round counter and move to next round
        const nextRound = game.current_round + 1;
        
        // Update round number and game phase in a single transaction
        const { error } = await supabase
          .from('games')
          .update({ 
            current_round: nextRound,
            game_phase: 'playing'
          })
          .eq('id', game.id);
        
        if (error) {
          throw error;
        }
        
        console.log(`Moving to round ${nextRound}`);
      }
    } catch (error) {
      console.error("Error processing round result:", error);
      toast.error("Error processing round result");
    }
  };

  return {
    processRoundOutcome
  };
};
