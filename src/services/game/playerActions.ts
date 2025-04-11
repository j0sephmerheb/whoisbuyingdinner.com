
import { supabase } from '@/integrations/supabase/client';
import { CharacterType, DBCharacterType } from './types';

// Convert UI character type to database-compatible type
const convertToDBCharacterType = (avatarType: CharacterType): DBCharacterType => {
  // If the type is already a valid DB type, return it
  if (['cowboy', 'ninja', 'fireman', 'santa'].includes(avatarType as string)) {
    return avatarType as DBCharacterType;
  }
  
  // Map female character types to compatible DB types
  // This is a temporary solution until the database schema is updated
  const mapping: Record<string, DBCharacterType> = {
    'princess': 'santa',
    'fairy': 'ninja',
    'mermaid': 'fireman',
    'witch': 'cowboy'
  };
  
  return mapping[avatarType as string] || 'cowboy';
};

// Select avatar
export const selectAvatar = async (playerId: string, avatarType: CharacterType): Promise<boolean> => {
  console.log(`[API] Selecting avatar ${avatarType} for player ${playerId}`);
  
  // Convert to DB-compatible type before saving
  const dbCharacterType = convertToDBCharacterType(avatarType);
  
  const { error } = await supabase
    .from('players')
    .update({ character_type: dbCharacterType })
    .eq('id', playerId);

  if (error) {
    console.error("Error selecting avatar:", error);
    return false;
  }
  console.log(`[API] Avatar ${dbCharacterType} successfully selected for player ${playerId}`);
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
  // Generate a random dice value between 1 and 6
  const diceValue = Math.floor(Math.random() * 6) + 1;
  
  console.log(`[API] Player ${playerId} rolling dice, value: ${diceValue}`);
  
  // Update the player's dice value in the database
  const { error } = await supabase
    .from('players')
    .update({ dice_value: diceValue })
    .eq('id', playerId);

  if (error) {
    console.error("[API] Error rolling dice:", error);
    return 0;
  }
  
  return diceValue;
};

// Reset dice value
export const resetDiceValue = async (playerId: string): Promise<boolean> => {
  console.log(`[API] Resetting dice for player ${playerId}`);
  
  const { error } = await supabase
    .from('players')
    .update({ dice_value: null })
    .eq('id', playerId);

  if (error) {
    console.error("[API] Error resetting dice value:", error);
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
  console.log(`[API] Updating player ${playerId}, new score: ${newScore}, character data:`, characterData);
  
  const { error } = await supabase
    .from('players')
    .update({ 
      score: newScore,
      character_data: characterData
    })
    .eq('id', playerId);

  if (error) {
    console.error("[API] Error updating player after round:", error);
    return false;
  }
  return true;
};
