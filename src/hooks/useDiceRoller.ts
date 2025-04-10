
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import * as gameService from '@/services/game';
import { GameData, PlayerData } from '@/services/game';
import { useRoundProcessor } from './useRoundProcessor';

/**
 * Hook that provides dice rolling functionality in the game
 * @param game - The current game data
 * @param currentPlayer - The current player data
 * @param opponent - The opponent player data
 * @returns Function for rolling dice and state
 */
export const useDiceRoller = (
  game: GameData | null,
  currentPlayer: PlayerData | null,
  opponent: PlayerData | null
) => {
  const [isRolling, setIsRolling] = useState(false);
  const { processRoundOutcome } = useRoundProcessor(game, currentPlayer, opponent);

  /**
   * Handles the dice rolling action for the current player
   * Processes the round outcome when both players have rolled
   */
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
      
      /**
       * Checks if the opponent has rolled and processes the round result
       */
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

  return {
    rollDice,
    isRolling
  };
};
