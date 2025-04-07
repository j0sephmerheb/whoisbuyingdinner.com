
import { useState, useEffect } from 'react';
import { GameState, Team } from '@/types/gameTypes';
import { createDefaultGameState, resolveRoundOutcome } from '@/utils/gameUtils';
import { toast } from 'sonner';
import { CharacterType } from '@/services/gameService';

export const useGameActions = () => {
  const [gameState, setGameState] = useState<GameState>(createDefaultGameState());

  // Track consecutive wins to enable special power
  useEffect(() => {
    // Only activate special power after 2 consecutive wins and if not already used
    if (gameState.consecutiveWins >= 2 && !gameState.specialPowerUsed && !gameState.specialPowerAvailable) {
      setGameState(prev => ({
        ...prev,
        specialPowerAvailable: true
      }));
      toast("Special power available! Win the next roll with a +2 bonus!");
    }
  }, [gameState.consecutiveWins]);

  const setUserTeam = (team: CharacterType) => {
    setGameState(prev => ({
      ...prev,
      userTeam: team,
      gamePhase: 'playing'
    }));
    toast(`You selected avatar: ${team}!`);
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
      gamePhase: 'rolling',
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
          specialPowerUsed: false,
          consecutiveWins: 0 // Reset consecutive wins after using special power
        }));
      }
      
      setGameState(prev => {
        // Calculate new game state
        return {
          ...prev,
          userDiceValue: userRoll,
          systemDiceValue: systemRoll,
          gamePhase: 'result',
        };
      });
      
      // Show battle resolution after dice values are shown
      setTimeout(() => {
        const roundResult = resolveRoundOutcome(userRoll, systemRoll, gameState);
        setGameState(prev => ({
          ...prev,
          ...roundResult
        }));
      }, 1200);
    }, 800);
  };

  const resetGame = () => {
    // Create a new set of characters with all alive
    const freshUserCharacters = Array(5).fill(null).map((_, id) => ({ alive: true, id }));
    const freshSystemCharacters = Array(5).fill(null).map((_, id) => ({ alive: true, id }));
    
    // Create completely fresh game state with new character arrays
    setGameState({
      ...createDefaultGameState(),
      userCharacters: freshUserCharacters,
      systemCharacters: freshSystemCharacters,
      gamePhase: 'selection'
    });
    
    toast("New game started!");
  };

  return {
    gameState,
    setUserTeam,
    rollDice,
    resetGame,
    useSpecialPower
  };
};
