
import { useState, useRef, useEffect } from 'react';
import * as gameService from '@/services/gameService';
import { GameData } from '@/services/gameService';

export const useGameCountdown = (game: GameData | null) => {
  const [countdownValue, setCountdownValue] = useState(5);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownStartedRef = useRef<boolean>(false);

  // Clear interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      countdownStartedRef.current = false;
    };
  }, []);

  // Start countdown
  const startCountdown = async () => {
    if (!game || countdownStartedRef.current) return false;
    
    // First check if all players have selected avatars
    const allSelected = await gameService.checkAvatarSelection(game.id);
    if (!allSelected) {
      return false;
    }
    
    // Set flag to prevent multiple countdowns
    countdownStartedRef.current = true;
    
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Tell server to start the game (server will broadcast to other clients)
    await gameService.startGame(game.id);
    
    // Start local countdown immediately instead of waiting for server response
    console.log("Starting local countdown");
    setIsCountingDown(true);
    let count = 5;
    setCountdownValue(count);
    
    intervalRef.current = setInterval(() => {
      count--;
      setCountdownValue(count);
      
      if (count <= 0) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setIsCountingDown(false);
        countdownStartedRef.current = false;
      }
    }, 1000);
    
    return true;
  };

  return {
    countdownValue,
    isCountingDown,
    setIsCountingDown,
    setCountdownValue,
    startCountdown
  };
};
