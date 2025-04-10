
import { supabase } from '@/integrations/supabase/client';
import { GamePhase } from './types';

/**
 * Starts the game countdown process
 * @param gameId - The ID of the game to start countdown for
 * @returns A boolean indicating success or failure
 */
export const startCountdown = async (gameId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('games')
    .update({ game_phase: 'playing' })
    .eq('id', gameId);

  if (error) {
    console.error("Error starting countdown:", error);
    return false;
  }
  return true;
};

/**
 * Starts the game immediately (without countdown)
 * @param gameId - The ID of the game to start
 * @returns A boolean indicating success or failure
 */
export const startGame = async (gameId: string): Promise<boolean> => {
  // Update game phase to playing directly
  const { error } = await supabase
    .from('games')
    .update({ 
      game_phase: 'playing',
      current_round: 1 
    })
    .eq('id', gameId);

  if (error) {
    console.error("Error starting game:", error);
    return false;
  }
  
  return true;
};

/**
 * Updates the game phase
 * @param gameId - The ID of the game to update
 * @param phase - The new game phase
 * @returns A boolean indicating success or failure
 */
export const updateGamePhase = async (gameId: string, phase: GamePhase): Promise<boolean> => {
  console.log(`[GAME STATE] Updating game ${gameId} phase to ${phase}`);
  
  const { error } = await supabase
    .from('games')
    .update({ game_phase: phase })
    .eq('id', gameId);

  if (error) {
    console.error(`[GAME STATE] Error updating game phase to ${phase}:`, error);
    return false;
  }
  
  console.log(`[GAME STATE] Successfully updated game phase to ${phase}`);
  return true;
};

/**
 * Ends the game by setting the winner, loser, and changing the game phase to 'over'
 * @param gameId - The ID of the game to end
 * @param winnerId - The ID of the winning player
 * @param loserId - The ID of the losing player
 * @returns A boolean indicating success or failure
 */
export const endGame = async (gameId: string, winnerId: string, loserId: string): Promise<boolean> => {
  console.log(`[GAME STATE] Ending game: ${gameId}, Winner: ${winnerId}, Loser: ${loserId}`);
  
  try {
    // First update the winner and loser IDs
    const { error: winLoseError } = await supabase
      .from('games')
      .update({ 
        winner_id: winnerId,
        loser_id: loserId
      })
      .eq('id', gameId);

    if (winLoseError) {
      console.error("[GAME STATE] Error setting winner and loser:", winLoseError);
      return false;
    }
    
    // Then set the game phase to 'over' in a separate operation
    const { error: phaseError } = await supabase
      .from('games')
      .update({ game_phase: 'over' })
      .eq('id', gameId);
      
    if (phaseError) {
      console.error("[GAME STATE] Error setting game phase to over:", phaseError);
      return false;
    }
    
    console.log(`[GAME STATE] Successfully ended game ${gameId}`);
    return true;
  } catch (error) {
    console.error("[GAME STATE] Error in endGame function:", error);
    return false;
  }
};
