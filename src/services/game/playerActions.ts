
import { supabase } from '@/integrations/supabase/client';
import { CharacterType } from './types';

// Select avatar
export const selectAvatar = async (playerId: string, avatarType: CharacterType): Promise<boolean> => {
  const { error } = await supabase
    .from('players')
    .update({ character_type: avatarType })
    .eq('id', playerId);

  if (error) {
    console.error("Error selecting avatar:", error);
    return false;
  }
  return true;
};

// Check if all players have selected avatars
export const checkAvatarSelection = async (gameId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('players')
    .select('character_type')
    .eq('game_id', gameId);

  if (error || !data) {
    console.error("Error checking avatar selection:", error);
    return false;
  }

  // Check if all players have selected their avatars (not the default)
  const allSelected = data.every(player => player.character_type !== null);
  return allSelected;
};

// Roll dice
export const rollDice = async (playerId: string): Promise<number> => {
  const diceValue = Math.floor(Math.random() * 6) + 1;
  
  const { error } = await supabase
    .from('players')
    .update({ dice_value: diceValue })
    .eq('id', playerId);

  if (error) {
    console.error("Error rolling dice:", error);
    return 0;
  }
  
  return diceValue;
};

// Reset dice value
export const resetDiceValue = async (playerId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('players')
    .update({ dice_value: null })
    .eq('id', playerId);

  if (error) {
    console.error("Error resetting dice value:", error);
    return false;
  }
  return true;
};

// Update player score and character data
export const updatePlayerAfterRound = async (
  playerId: string, 
  newScore: number, 
  characterData: Array<{ alive: boolean, id: number }>
): Promise<boolean> => {
  const { error } = await supabase
    .from('players')
    .update({ 
      score: newScore,
      character_data: characterData
    })
    .eq('id', playerId);

  if (error) {
    console.error("Error updating player after round:", error);
    return false;
  }
  return true;
};
