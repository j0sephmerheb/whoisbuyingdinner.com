
import { toast } from 'sonner';
import { Character, GameState, Team } from '@/types/gameTypes';

export const createDefaultGameState = (): GameState => {
  return {
    userTeam: null,
    currentRound: 1,
    userCharacters: Array(5).fill(null).map((_, id) => ({ alive: true, id })),
    systemCharacters: Array(5).fill(null).map((_, id) => ({ alive: true, id })),
    userDiceValue: null,
    systemDiceValue: null,
    gamePhase: 'selection',
    winner: null,
    userScore: 0,
    systemScore: 0,
    specialPowerAvailable: false,
    specialPowerUsed: false,
    consecutiveWins: 0,
  };
};

export const resolveRoundOutcome = (
  userRoll: number,
  systemRoll: number,
  gameState: GameState
): Partial<GameState> => {
  const userTeamIsChicken = gameState.userTeam === 'chicken';
  const userWinsRoll = userRoll > systemRoll;
  const isTie = userRoll === systemRoll;
  
  // Clone the character arrays to avoid direct mutations
  const newUserCharacters = [...gameState.userCharacters];
  const newSystemCharacters = [...gameState.systemCharacters];
  let newUserScore = gameState.userScore;
  let newSystemScore = gameState.systemScore;
  let newConsecutiveWins = gameState.consecutiveWins;
  
  if (!isTie) {
    if (userWinsRoll) {
      // User wins the roll - damage system character
      const firstAliveSystemCharIndex = newSystemCharacters.findIndex(c => c.alive);
      if (firstAliveSystemCharIndex !== -1) {
        newSystemCharacters[firstAliveSystemCharIndex].alive = false;
        newUserScore += 1;
        newConsecutiveWins += 1; // Increment consecutive wins
        
        // Show appropriate toast based on user's team
        if (userTeamIsChicken) {
          toast("Your chicken scored a hit! A cowboy is down!");
        } else {
          toast("Your cowboy scored a hit! A chicken is down!");
        }
      }
    } else {
      // System wins the roll - damage user character
      const firstAliveUserCharIndex = newUserCharacters.findIndex(c => c.alive);
      if (firstAliveUserCharIndex !== -1) {
        newUserCharacters[firstAliveUserCharIndex].alive = false;
        newSystemScore += 1;
        newConsecutiveWins = 0; // Reset consecutive wins
        
        // Show appropriate toast based on user's team
        if (userTeamIsChicken) {
          toast("Enemy cowboy scored a hit! A chicken is down!");
        } else {
          toast("Enemy chicken scored a hit! A cowboy is down!");
        }
      }
    }
  } else {
    toast("It's a tie! No damage dealt.");
    // Reset consecutive wins on tie
    newConsecutiveWins = 0;
  }
  
  // Count alive characters
  const userAliveCount = newUserCharacters.filter(c => c.alive).length;
  const systemAliveCount = newSystemCharacters.filter(c => c.alive).length;
  
  // Check if game is over
  let winner: Team | 'tie' | null = null;
  let newGamePhase = 'playing';
  
  if (userAliveCount === 0 || systemAliveCount === 0) {
    newGamePhase = 'over';
    
    if (userAliveCount > systemAliveCount) {
      winner = gameState.userTeam!;
      toast(`${gameState.userTeam === 'chicken' ? 'Chickens' : 'Cowboys'} win! You are victorious!`, {
        duration: 5000,
      });
    } else if (systemAliveCount > userAliveCount) {
      winner = gameState.userTeam === 'chicken' ? 'cowboy' : 'chicken';
      toast(`${gameState.userTeam === 'chicken' ? 'Cowboys' : 'Chickens'} win! Better luck next time!`, {
        duration: 5000,
      });
    } else {
      winner = 'tie';
      toast("It's a tie! Both teams fought valiantly!", {
        duration: 5000,
      });
    }
  }
  
  return {
    userCharacters: newUserCharacters,
    systemCharacters: newSystemCharacters,
    currentRound: gameState.currentRound + 1,
    gamePhase: newGamePhase as any, // Type assertion to match the expected type
    winner,
    userScore: newUserScore,
    systemScore: newSystemScore,
    consecutiveWins: newConsecutiveWins,
  };
};
