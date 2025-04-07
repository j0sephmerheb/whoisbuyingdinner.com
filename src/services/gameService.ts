
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

// Types for our database schema
export type GamePhase = 'waiting' | 'selection' | 'countdown' | 'playing' | 'rolling' | 'result' | 'over';
// Match to Supabase database enum type
export type DBCharacterType = 'cowboy' | 'ninja' | 'fireman' | 'santa';
export type CharacterType = DBCharacterType;

export interface GameData {
  id: string;
  created_at: string;
  current_round: number;
  game_phase: GamePhase;
  winner_id?: string;
  loser_id?: string;
  is_locked: boolean;
}

export interface PlayerData {
  id: string;
  created_at: string;
  name: string;
  game_id: string;
  character_type: CharacterType;
  is_host: boolean;
  score: number;
  dice_value: number | null;
  character_data: Array<{ alive: boolean, id: number }>;
}

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
  const { data: playerData, error: playerError } = await supabase
    .from('players')
    .insert([{
      name: playerName,
      game_id: gameData.id,
      character_type: 'cowboy', // Default, will be changed during selection
      is_host: true,
      character_data: Array(5).fill(null).map((_, id) => ({ alive: true, id }))
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
  const { data: playerData, error: playerError } = await supabase
    .from('players')
    .insert([{
      name: playerName,
      game_id: gameId,
      character_type: 'cowboy', // Default, will be changed during selection
      is_host: false,
      character_data: Array(5).fill(null).map((_, id) => ({ alive: true, id }))
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
    .update({ is_locked: true })
    .eq('id', gameId);

  return playerData.id;
};

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

// Start countdown
export const startCountdown = async (gameId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('games')
    .update({ game_phase: 'countdown' })
    .eq('id', gameId);

  if (error) {
    console.error("Error starting countdown:", error);
    return false;
  }
  return true;
};

// Start the game
export const startGame = async (gameId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('games')
    .update({ game_phase: 'playing' })
    .eq('id', gameId);

  if (error) {
    console.error("Error starting game:", error);
    return false;
  }
  return true;
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
  
  // After the game is over and results are shown, delete the game and players (after a timeout)
  setTimeout(async () => {
    // Delete players first (due to foreign key constraints)
    await supabase.from('players').delete().eq('game_id', gameId);
    // Then delete the game
    await supabase.from('games').delete().eq('id', gameId);
  }, 60000); // Delete after 1 minute to allow users to see results
  
  return true;
};

// Subscribe to game changes
export const subscribeToGame = (gameId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`game:${gameId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'games',
      filter: `id=eq.${gameId}`
    }, callback)
    .subscribe();
};

// Subscribe to player changes
export const subscribeToPlayers = (gameId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`players:${gameId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'players',
      filter: `game_id=eq.${gameId}`
    }, callback)
    .subscribe();
};
