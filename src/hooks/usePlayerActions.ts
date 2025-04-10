
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
      return;
    }
    
    if (currentPlayer.dice_value !== null) {
      return;
    }
    
    setIsRolling(true);
    
    try {
      // Update game phase to rolling if needed
      if (game.game_phase === 'playing') {
        await gameService.updateGamePhase(game.id, 'rolling');
      }
      
      // Roll dice for current player
      const value = await gameService.rollDice(currentPlayer.id);
      
      // Function to check opponent's roll and process result
      const checkOpponentAndProcessResult = async () => {
        try {
          // Only proceed if the opponent is not null
          if (!opponent) {
            console.log("Opponent is null, cannot process round result");
            setIsRolling(false);
            return;
          }
          
          // Get fresh opponent data
          const { data: freshOpponent } = await supabase
            .from('players')
            .select('*')
            .eq('id', opponent.id)
            .maybeSingle();
            
          if (freshOpponent?.dice_value !== null) {
            // Store the dice values for processing
            const roundData = {
              currentPlayerRoll: value,
              opponentRoll: freshOpponent.dice_value,
              currentPlayerId: currentPlayer.id,
              opponentId: freshOpponent.id
            };
            
            console.log("Processing round with data:", roundData);
            
            // Update game phase to result
            await gameService.updateGamePhase(game.id, 'result');
            
            // Process round outcome after a delay, passing the stored dice values
            setTimeout(() => {
              processRoundOutcome(roundData);
            }, 2000);
          } else {
            console.log("Opponent hasn't rolled yet");
            setIsRolling(false);
          }
        } catch (error) {
          console.error("Error in checkOpponentAndProcessResult:", error);
          setIsRolling(false);
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
      console.error("Error in rollDice:", error);
      toast.error('Failed to roll dice. Try again.');
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
        setIsRolling(false);
        return;
      }
      
      // Make sure character_data is properly typed
      const currentPlayerCharacters = Array.isArray(freshCurrentPlayer.character_data) 
        ? freshCurrentPlayer.character_data 
        : [];
        
      const opponentCharacters = Array.isArray(freshOpponent.character_data)
        ? freshOpponent.character_data
        : [];
      
      const playerAliveCount = currentPlayerCharacters.filter(c => c.alive).length;
      const opponentAliveCount = opponentCharacters.filter(c => c.alive).length;
      
      console.log(`Player alive characters: ${playerAliveCount}, Opponent alive characters: ${opponentAliveCount}`);
      
      if (playerAliveCount === 0 || opponentAliveCount === 0) {
        // Determine the winner and loser based on who has remaining characters
        const winnerId = playerAliveCount > 0 ? currentPlayer.id : opponent.id;
        const loserId = playerAliveCount > 0 ? opponent.id : currentPlayer.id;
        
        console.log(`Game over! Winner: ${winnerId}, Loser: ${loserId}`);
        
        // Use the enhanced endGame function that sets winner/loser first then changes phase
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
    } finally {
      setIsRolling(false);
    }
  };

  return {
    selectAvatar,
    rollDice,
    isRolling
  };
};
