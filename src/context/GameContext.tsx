import React, { createContext, useContext, useState, useEffect } from 'react';
import { createDefaultGameState, resolveRoundOutcome } from '@/utils/gameUtils';
import { Character, GameState, Team, GamePhase } from '@/types/gameTypes';
import { toast } from 'sonner';
import { CharacterType } from '@/services/game';

interface GameContextType {
  gameState: GameState;
  setUserTeam: (team: CharacterType) => void;
  rollDice: () => void;
  useSpecialPower: () => void;
  resetGame: () => void;
  advanceGamePhase: (phase: GamePhase) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>(createDefaultGameState());

  // Set user's team
  const setUserTeam = (team: CharacterType) => {
    setGameState(prev => ({
      ...prev,
      userTeam: team,
      gamePhase: 'playing',
    }));
    
    toast.success(`You selected ${team}!`);
  };

  // Roll the dice
  const rollDice = () => {
    if (gameState.gamePhase !== 'playing') return;
    
    // Set game phase to rolling
    setGameState(prev => ({
      ...prev,
      gamePhase: 'rolling',
    }));
    
    // Simulate dice roll with delay
    setTimeout(() => {
      const userRoll = Math.floor(Math.random() * 6) + 1;
      const systemRoll = Math.floor(Math.random() * 6) + 1;
      
      // Apply special power bonus if used
      const finalUserRoll = gameState.specialPowerUsed ? userRoll + 2 : userRoll;
      
      // Update game state with roll results
      setGameState(prev => ({
        ...prev,
        userDiceValue: finalUserRoll,
        systemDiceValue: systemRoll,
        gamePhase: 'result',
        specialPowerUsed: false, // Reset special power used status
      }));
      
      // Add delay before resolving the round
      setTimeout(() => {
        setGameState(prev => {
          const roundOutcome = resolveRoundOutcome(
            prev.userDiceValue!, 
            prev.systemDiceValue!, 
            prev
          );
          
          // Update special power availability
          const specialPowerAvailable = 
            roundOutcome.consecutiveWins! >= 3 && 
            !prev.specialPowerUsed &&
            !prev.specialPowerAvailable;
          
          if (specialPowerAvailable) {
            toast("Special power available! +2 to your next roll!");
          }
          
          return {
            ...prev,
            ...roundOutcome,
            specialPowerAvailable: specialPowerAvailable || prev.specialPowerAvailable,
            userDiceValue: null,
            systemDiceValue: null,
            gamePhase: roundOutcome.gamePhase || 'playing',
          };
        });
      }, 2000);
    }, 1500);
  };
  
  // Use special power
  const useSpecialPower = () => {
    if (!gameState.specialPowerAvailable) return;
    
    setGameState(prev => ({
      ...prev,
      specialPowerAvailable: false,
      specialPowerUsed: true,
      consecutiveWins: 0, // Reset consecutive wins
    }));
    
    toast.success("Special power activated! +2 to your next roll!");
  };
  
  // Reset the game
  const resetGame = () => {
    setGameState(createDefaultGameState());
    toast("Game reset! Choose your team to play again.");
  };
  
  // Advance game phase
  const advanceGamePhase = (phase: GamePhase) => {
    setGameState(prev => ({
      ...prev,
      gamePhase: phase,
    }));
  };
  
  return (
    <GameContext.Provider value={{
      gameState,
      setUserTeam,
      rollDice,
      useSpecialPower,
      resetGame,
      advanceGamePhase,
    }}>
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
