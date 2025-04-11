
// Types for our database schema
export type GamePhase = 'waiting' | 'selection' | 'playing' | 'rolling' | 'result' | 'over';

// Extended character types for both UI and DB
export type CharacterType = 'cowboy' | 'ninja' | 'fireman' | 'santa' | 'princess' | 'fairy' | 'mermaid' | 'witch';
// For backward compatibility
export type DBCharacterType = CharacterType;

export interface GameData {
  id: string;
  created_at: string;
  current_round: number;
  game_phase: GamePhase;
  winner_id?: string;
  loser_id?: string;
  is_locked: boolean;
  players?: PlayerData[];
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
