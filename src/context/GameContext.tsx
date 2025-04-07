
import React, { createContext, useContext } from 'react';
import { useGameActions } from '@/hooks/useGameActions';
import { GameState, Team } from '@/types/gameTypes';

interface GameContextType {
  gameState: GameState;
  setUserTeam: (team: Team) => void;
  rollDice: () => void;
  resetGame: () => void;
  useSpecialPower: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const gameActions = useGameActions();

  return (
    <GameContext.Provider value={gameActions}>
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
