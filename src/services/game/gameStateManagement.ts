

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
  const { error } = await supabase
    .from('games')
    .update({ game_phase: phase })
    .eq('id', gameId);

  if (error) {
    console.error("Error updating game phase:", error);
    return false;
  }
  return true;
};

// End the game
export const endGame = async (gameId: string, winnerId: string, loserId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('games')
    .update({ 
      game_phase: 'over',
      winner_id: winnerId,
      loser_id: loserId
    })
    .eq('id', gameId);

  if (error) {
    console.error("Error ending game:", error);
    return false;
  }
  
  // We no longer delete games - they just remain in the 'over' state
  return true;
};

