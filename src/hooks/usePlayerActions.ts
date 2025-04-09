import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
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
    
    if (game.game_phase !== 'playing' && game.game_phase !== 'rolling') {
      console.log(`[DEBUG] Cannot roll - wrong game phase: ${game.game_phase}`);
      return;
    }
    
    if (currentPlayer.dice_value !== null) {
      console.log(`[DEBUG] Player ${currentPlayer.id} has already rolled: ${currentPlayer.dice_value}`);
      return;
    }
    
    setIsRolling(true);
    
    try {
      // Update game phase to rolling if needed
      if (game.game_phase === 'playing') {
        console.log(`[DEBUG] Updating game phase to rolling`);
        await gameService.updateGamePhase(game.id, 'rolling');
      }
      
      // Roll dice for current player
      console.log(`[DEBUG] Rolling dice for player ${currentPlayer.id}`);
      const value = await gameService.rollDice(currentPlayer.id);
      console.log(`[DEBUG] Player ${currentPlayer.id} (${currentPlayer.name}) rolled: ${value}`);
      
      // Function to check opponent's roll and process result
      const checkOpponentAndProcessResult = async () => {
        // Get fresh opponent data
        const { data: freshOpponent } = await supabase
          .from('players')
          .select('*')
          .eq('id', opponent?.id)
          .single();
          
        if (freshOpponent?.dice_value !== null) {
          console.log(`[DEBUG] Both players have rolled - current: ${value}, opponent: ${freshOpponent.dice_value}`);
          
          // Store the dice values for processing
          const roundData = {
            currentPlayerRoll: value,
            opponentRoll: freshOpponent.dice_value,
            currentPlayerId: currentPlayer.id,
            opponentId: freshOpponent.id
          };
          
          // Update game phase to result
          await gameService.updateGamePhase(game.id, 'result');
          console.log("[DEBUG] Game phase updated to 'result'");
          
          // Process round outcome after a delay, passing the stored dice values
          setTimeout(() => {
            console.log(`[DEBUG] Starting round outcome processing with stored values:`, roundData);
            processRoundOutcome(roundData);
          }, 2000);
        }
      };
      
      // Check immediately if opponent has already rolled
      if (opponent?.dice_value !== null) {
        await checkOpponentAndProcessResult();
      } else {
        // Set up subscription to watch for opponent's roll
        const opponentSubscription = supabase
          .channel('opponent-roll')
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'players',
              filter: `id=eq.${opponent?.id}`,
            },
            async (payload) => {
              if (payload.new.dice_value !== null) {
                console.log(`[DEBUG] Received opponent roll update:`, payload.new.dice_value);
                await checkOpponentAndProcessResult();
                opponentSubscription.unsubscribe();
              }
            }
          )
          .subscribe();
          
        // Also set a timeout as fallback
        setTimeout(async () => {
          await checkOpponentAndProcessResult();
          opponentSubscription.unsubscribe();
        }, 5000);
      }
    } catch (error) {
      console.error('[DEBUG] Error rolling dice:', error);
      toast.error('Failed to roll dice. Try again.');
    } finally {
      setIsRolling(false);
    }
  };

  // Process the outcome of a round - Modified to accept stored dice values
  const processRoundOutcome = async (roundData?: { 
    currentPlayerRoll: number; 
    opponentRoll: number;
    currentPlayerId: string;
    opponentId: string;
  }) => {
    if (!currentPlayer || !opponent || !game) {
      console.error("[CRITICAL] Missing data to process outcome", { currentPlayer, opponent, game });
      return;
    }
    
    // Use stored dice values if provided, otherwise use current values
    const playerRoll = roundData?.currentPlayerRoll ?? currentPlayer.dice_value;
    const opponentRoll = roundData?.opponentRoll ?? opponent.dice_value;
    
    console.log(`[ROUND OUTCOME] Processing outcome for game ${game.id}, round ${game.current_round}`);
    console.log(`[ROUND OUTCOME] Current game phase: ${game.game_phase}`);
    console.log(`[ROUND OUTCOME] Player ${currentPlayer.name} rolled: ${playerRoll}`);
    console.log(`[ROUND OUTCOME] Opponent ${opponent.name} rolled: ${opponentRoll}`);
    console.log(`[ROUND OUTCOME] Full player data:`, {
      currentPlayer: {
        id: currentPlayer.id,
        name: currentPlayer.name,
        dice_value: currentPlayer.dice_value,
        score: currentPlayer.score,
        character_data: currentPlayer.character_data
      },
      opponent: {
        id: opponent.id,
        name: opponent.name,
        dice_value: opponent.dice_value,
        score: opponent.score,
        character_data: opponent.character_data
      }
    });
    
    if (playerRoll === null || opponentRoll === null) {
      console.error("[CRITICAL] One of the players has not rolled yet", {
        playerRoll,
        opponentRoll,
        currentPlayerId: currentPlayer.id,
        opponentId: opponent.id
      });
      toast.error("Cannot process outcome - missing dice value");
      return;
    }
    
    // Determine round winner based purely on dice values
    let losingPlayerId: string | null = null;
    let winningPlayerId: string | null = null;
    
    if (playerRoll > opponentRoll) {
      // Current player wins, opponent loses a character
      console.log(`[ROUND OUTCOME] ${currentPlayer.name} WINS with ${playerRoll} vs ${opponentRoll}`);
      losingPlayerId = opponent.id;
      winningPlayerId = currentPlayer.id;
      toast.success("You won this round!");
    } 
    else if (playerRoll < opponentRoll) {
      // Opponent wins, current player loses a character
      console.log(`[ROUND OUTCOME] ${opponent.name} WINS with ${opponentRoll} vs ${playerRoll}`);
      losingPlayerId = currentPlayer.id;
      winningPlayerId = opponent.id;
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
      const winningPlayer = winningPlayerId === currentPlayer.id ? currentPlayer : opponent;
      
      console.log(`[ROUND OUTCOME] Updating character data for losing player: ${losingPlayer.name}`);
      
      const updatedCharacters = [...losingPlayer.character_data];
      const aliveIndex = updatedCharacters.findIndex(c => c.alive);
      
      if (aliveIndex !== -1) {
        console.log(`[ROUND OUTCOME] Setting character ${aliveIndex} to dead for player ${losingPlayer.name}`);
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
          console.log(`[ROUND OUTCOME] Successfully updated character data and scores`);
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
        
        console.log("[ROUND OUTCOME] Game phase updated to 'playing' and round incremented");
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
