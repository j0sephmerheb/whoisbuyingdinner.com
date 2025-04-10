
import { supabase } from '@/integrations/supabase/client';
import { GamePhase } from './types';

// Start countdown
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

// Start the game
export const startGame = async (gameId: string): Promise<boolean> => {
  // Update game phase to playing directly
  const { error } = await supabase
    .from('games')
    .update({ game_phase: 'playing' })
    .eq('id', gameId);

  if (error) {
    console.error("Error starting game:", error);
    return false;
  }
  
  // Also update current round to 1 to ensure we start from the beginning
  await supabase
    .from('games')
    .update({ current_round: 1 })
    .eq('id', gameId);
    
  return true;
};

// Update game phase
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

// End the game
export const endGame = async (gameId: string, winnerId: string, loserId: string): Promise<boolean> => {
  console.log(`[GAME STATE] Ending game: ${gameId}, Winner: ${winnerId}, Loser: ${loserId}`);
  
  try {
    const { error } = await supabase
      .from('games')
      .update({ 
        game_phase: 'over',
        winner_id: winnerId,
        loser_id: loserId
      })
      .eq('id', gameId);

    if (error) {
      console.error("[GAME STATE] Error ending game:", error);
      return false;
    }
    
    // Double-check that the game phase is updated
    const { data } = await supabase
      .from('games')
      .select('game_phase')
      .eq('id', gameId)
      .single();
      
    console.log(`[GAME STATE] Game phase after update: ${data?.game_phase}`);
    console.log(`[GAME STATE] Successfully ended game ${gameId}`);
    return true;
  } catch (error) {
    console.error("[GAME STATE] Error in endGame function:", error);
    return false;
  }
};
