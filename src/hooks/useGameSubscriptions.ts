import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import * as gameService from '@/services/game';
import { GameData, PlayerData } from '@/services/game';

export const useGameSubscriptions = (
  gameId: string | undefined,
  playerId: string | undefined,
  setGame: React.Dispatch<React.SetStateAction<GameData | null>>,
  setPlayers: React.Dispatch<React.SetStateAction<PlayerData[]>>,
  setCurrentPlayer: React.Dispatch<React.SetStateAction<PlayerData | null>>,
  setOpponent: React.Dispatch<React.SetStateAction<PlayerData | null>>,
  setCountdownValue: React.Dispatch<React.SetStateAction<number>>,
  setIsCountingDown: React.Dispatch<React.SetStateAction<boolean>>
) => {
  // Use refs to avoid creating new interval functions on each render
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownStartedRef = useRef<boolean>(false);
  const gamePhaseRef = useRef<string | null>(null);
  const gameIdRef = useRef<string | null>(null);

  // Clean up any existing interval when component unmounts
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // Reset countdown flag on unmount
      countdownStartedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!gameId) return;
    
    // Store the current gameId in ref to detect changes
    gameIdRef.current = gameId;
    
    console.log("Setting up game subscriptions for game:", gameId);
    
    // Set up real-time listeners
    const gameChannel = gameService.subscribeToGame(gameId, (payload) => {
      console.log("Game update received:", payload);
      if (payload.new) {
        // Only update if still the same game
        if (gameIdRef.current === gameId) {
          setGame(payload.new);
          
          // Store the current game phase to compare later
          const oldPhase = gamePhaseRef.current;
          const newPhase = payload.new.game_phase;
          gamePhaseRef.current = newPhase;
          
          // Handle game phase changes - Only trigger countdown if phase just changed to 'playing'
          // and we haven't already started a countdown
          if (newPhase === 'playing' && 
              (oldPhase === 'waiting' || oldPhase === 'selection') && 
              !countdownStartedRef.current) {
            
            // Set the flag to prevent multiple countdowns
            countdownStartedRef.current = true;
            console.log("Starting countdown via subscription");
            
            // Clear any existing interval first
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            
            let count = 5;
            setCountdownValue(count);
            setIsCountingDown(true);
            
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
          }
        }
      }
    });
    
    const playersChannel = gameService.subscribeToPlayers(gameId, (payload) => {
      console.log("Player update received:", payload);
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        setPlayers(prev => {
          const newPlayers = [...prev];
          const index = newPlayers.findIndex(p => p.id === payload.new.id);
          
          // Convert character_data from Json to typed array if needed
          const newPlayerData = {
            ...payload.new,
            character_data: Array.isArray(payload.new.character_data) 
              ? payload.new.character_data 
              : Array(5).fill(null).map((_, id) => ({ alive: true, id }))
          } as PlayerData;
          
          if (index !== -1) {
            newPlayers[index] = newPlayerData;
          } else {
            newPlayers.push(newPlayerData);
          }
          
          // Update current player and opponent references
          if (payload.new.id === playerId) {
            setCurrentPlayer(newPlayerData);
          } else {
            setOpponent(newPlayerData);
          }
          
          return newPlayers;
        });
        
        // Check if both players joined, and if so, ensure game phase is 'selection'
        setPlayers(currentPlayers => {
          if (currentPlayers.length === 2) {
            setGame(currentGame => {
              if (currentGame && currentGame.game_phase === 'waiting') {
                console.log("Both players joined via subscription, updating game phase to selection");
                
                // Fix: Use Promise with proper error handling
                Promise.resolve(
                  supabase
                    .from('games')
                    .update({ game_phase: 'selection' })
                    .eq('id', gameId)
                ).then(() => {
                  console.log("Game phase updated to selection");
                }).catch(error => {
                  console.error("Error updating game phase:", error);
                });
                  
                return { ...currentGame, game_phase: 'selection' };
              }
              return currentGame;
            });
          }
          return currentPlayers;
        });
      }
    });
    
    return () => {
      // Reset countdown flag on cleanup
      countdownStartedRef.current = false;
      gamePhaseRef.current = null;
      
      // Clear interval on cleanup
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      // Unsubscribe from channels
      gameChannel.unsubscribe();
      playersChannel.unsubscribe();
    };
  }, [gameId, playerId, setGame, setPlayers, setCurrentPlayer, setOpponent, setCountdownValue, setIsCountingDown]);
};
