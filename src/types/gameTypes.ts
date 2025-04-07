
import { CharacterType } from '@/services/gameService';

export type Team = CharacterType;
export type Character = { alive: boolean, id: number };
export type GamePhase = 'selection' | 'countdown' | 'playing' | 'rolling' | 'result' | 'over';

export interface GameState {
  userTeam: Team | null;
  currentRound: number;
  userCharacters: Character[];
  systemCharacters: Character[];
  userDiceValue: number | null;
  systemDiceValue: number | null;
  gamePhase: GamePhase;
  winner: Team | 'tie' | null;
  userScore: number;
  systemScore: number;
  specialPowerAvailable: boolean;
  specialPowerUsed: boolean;
  consecutiveWins: number;
}
