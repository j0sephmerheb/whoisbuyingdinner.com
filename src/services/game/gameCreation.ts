
import { supabase } from '@/integrations/supabase/client';
import { CharacterType } from './types';

// Create a new game
export const createGame = async (playerName: string): Promise<{ gameId: string, playerId: string } | null> => {
  // First create the game
  const { data: gameData, error: gameError } = await supabase
    .from('games')
    .insert([{ game_phase: 'waiting' }])
    .select()
    .single();

  if (gameError || !gameData) {
    console.error("Error creating game:", gameError);
    return null;
  }

  // Then create the host player
  const initialCharacterData = Array(5).fill(null).map((_, id) => ({ alive: true, id }));
  
  const { data: playerData, error: playerError } = await supabase
    .from('players')
    .insert([{
      name: playerName,
      game_id: gameData.id,
      character_type: 'cowboy', // Default, will be changed during selection
      is_host: true,
      character_data: initialCharacterData
    }])
    .select()
    .single();

  if (playerError || !playerData) {
    console.error("Error creating player:", playerError);
    // Cleanup the created game if player creation fails
    await supabase.from('games').delete().eq('id', gameData.id);
    return null;
  }

  return {
    gameId: gameData.id,
    playerId: playerData.id
  };
};

// Join an existing game
export const joinGame = async (gameId: string, playerName: string): Promise<string | null> => {
  // Check if game exists and is in waiting phase
  const { data: gameData, error: gameError } = await supabase
    .from('games')
    .select()
    .eq('id', gameId)
    .eq('game_phase', 'waiting')
    .single();

  if (gameError || !gameData) {
    console.error("Error finding game or game not in waiting phase:", gameError);
    return null;
  }

  // Check if game already has 2 players
  const { count, error: countError } = await supabase
    .from('players')
    .select('*', { count: 'exact', head: true })
    .eq('game_id', gameId);

  if (countError) {
    console.error("Error counting players:", countError);
    return null;
  }

  if (count && count >= 2) {
    console.error("Game already has maximum players");
    return null;
  }

  // Create the player
  const initialCharacterData = Array(5).fill(null).map((_, id) => ({ alive: true, id }));
  
  const { data: playerData, error: playerError } = await supabase
    .from('players')
    .insert([{
      name: playerName,
      game_id: gameId,
      character_type: 'cowboy', // Default, will be changed during selection
      is_host: false,
      character_data: initialCharacterData
    }])
    .select()
    .single();

  if (playerError || !playerData) {
    console.error("Error joining game:", playerError);
    return null;
  }

  // Lock the game since we now have 2 players
  await supabase
    .from('games')
    .update({ 
      is_locked: true,
      game_phase: 'selection' // Update game phase to selection when second player joins
    })
    .eq('id', gameId);

  return playerData.id;
};
