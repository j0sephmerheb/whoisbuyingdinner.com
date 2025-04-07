
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

type Team = 'chicken' | 'cowboy';
type Character = { alive: boolean, id: number };
type GamePhase = 'selection' | 'playing' | 'rolling' | 'result' | 'over';

interface GameState {
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
}

interface GameContextType {
  gameState: GameState;
  setUserTeam: (team: Team) => void;
  rollDice: () => void;
  resetGame: () => void;
  useSpecialPower: () => void;
}

const defaultGameState: GameState = {
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
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>({ ...defaultGameState });

  // Track consecutive wins to enable special power
  useEffect(() => {
    // Check if user has won 2 consecutive rounds to enable special power
    if (gameState.userScore >= 2 && !gameState.specialPowerUsed && !gameState.specialPowerAvailable) {
      setGameState(prev => ({
        ...prev,
        specialPowerAvailable: true
      }));
      toast("Special power available! Win the next roll with a +2 bonus!");
    }
  }, [gameState.userScore]);

  const setUserTeam = (team: Team) => {
    setGameState(prev => ({
      ...prev,
      userTeam: team,
      gamePhase: 'playing'
    }));
    toast(`You selected Team ${team === 'chicken' ? 'Chicken' : 'Cowboy'}!`);
  };

  const useSpecialPower = () => {
    if (!gameState.specialPowerAvailable) return;
    
    setGameState(prev => ({
      ...prev,
      specialPowerAvailable: false,
      specialPowerUsed: true
    }));
    
    toast("Special power activated for your next roll!");
  };

  const rollDice = () => {
    if (gameState.gamePhase === 'over') return;
    
    setGameState(prev => ({
      ...prev,
      gamePhase: 'rolling' as GamePhase,
      userDiceValue: null,
      systemDiceValue: null,
    }));
    
    // Simulate dice rolling animation time
    setTimeout(() => {
      let userRoll = Math.floor(Math.random() * 6) + 1;
      const systemRoll = Math.floor(Math.random() * 6) + 1;
      
      // Apply special power if available and used
      if (gameState.specialPowerUsed) {
        userRoll += 2; // Add +2 bonus
        toast("Special power gave you +2 to your roll!");
        
        setGameState(prev => ({
          ...prev,
          specialPowerUsed: false
        }));
      }
      
      setGameState(prev => {
        // Calculate new game state
        const newState = {
          ...prev,
          userDiceValue: userRoll,
          systemDiceValue: systemRoll,
          gamePhase: 'result' as GamePhase,
        };
        
        return newState;
      });
      
      // Show battle resolution after dice values are shown
      setTimeout(() => {
        resolveRound(userRoll, systemRoll);
      }, 1200);
    }, 800);
  };
  
  const resolveRound = (userRoll: number, systemRoll: number) => {
    const userTeamIsChicken = gameState.userTeam === 'chicken';
    const userWinsRoll = userRoll > systemRoll;
    const isTie = userRoll === systemRoll;
    
    setGameState(prev => {
      // Clone the character arrays to avoid direct mutations
      const newUserCharacters = [...prev.userCharacters];
      const newSystemCharacters = [...prev.systemCharacters];
      let newUserScore = prev.userScore;
      let newSystemScore = prev.systemScore;
      
      if (!isTie) {
        if (userWinsRoll) {
          // User wins the roll - damage system character
          const firstAliveSystemCharIndex = newSystemCharacters.findIndex(c => c.alive);
          if (firstAliveSystemCharIndex !== -1) {
            newSystemCharacters[firstAliveSystemCharIndex].alive = false;
            newUserScore += 1;
            
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
      }
      
      // Count alive characters
      const userAliveCount = newUserCharacters.filter(c => c.alive).length;
      const systemAliveCount = newSystemCharacters.filter(c => c.alive).length;
      
      // Check if game is over
      let winner: Team | 'tie' | null = null;
      let newGamePhase: GamePhase = 'playing';
      
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
        ...prev,
        userCharacters: newUserCharacters,
        systemCharacters: newSystemCharacters,
        currentRound: prev.currentRound + 1,
        gamePhase: newGamePhase,
        winner,
        userScore: newUserScore,
        systemScore: newSystemScore,
      };
    });
  };

  const resetGame = () => {
    setGameState({ ...defaultGameState });
    toast("New game started!");
  };

  return (
    <GameContext.Provider value={{ gameState, setUserTeam, rollDice, resetGame, useSpecialPower }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
