
import { supabase } from '@/integrations/supabase/client';
import { Team } from '@/types/gameTypes';

// Types for our database schema
export type GamePhase = 'waiting' | 'selection' | 'playing' | 'rolling' | 'result' | 'over';
export type CharacterType = 'chicken' | 'cowboy';

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
      character_type: 'chicken', // Default, will be changed during selection
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

  // Create the player
  const { data: playerData, error: playerError } = await supabase
    .from('players')
    .insert([{
      name: playerName,
      game_id: gameId,
      character_type: 'chicken', // Default, will be changed during selection
      is_host: false,
      character_data: Array(5).fill(null).map((_, id) => ({ alive: true, id }))
    }])
    .select()
    .single();

  if (playerError || !playerData) {
    console.error("Error joining game:", playerError);
    return null;
  }

  return playerData.id;
};

// Select team
export const selectTeam = async (playerId: string, team: Team): Promise<boolean> => {
  const { error } = await supabase
    .from('players')
    .update({ character_type: team })
    .eq('id', playerId);

  if (error) {
    console.error("Error selecting team:", error);
    return false;
  }
  return true;
};

// Start the game (transition from waiting to selection)
export const startGame = async (gameId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('games')
    .update({ game_phase: 'selection' })
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
