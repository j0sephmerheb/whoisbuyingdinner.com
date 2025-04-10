
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import * as gameService from '@/services/game';
import { GameData, PlayerData } from '@/services/game';

/**
 * Hook for managing real-time game subscriptions
 * @param gameId - The ID of the current game
 * @param playerId - The ID of the current player
 * @param setGame - Function to update game state
 * @param setPlayers - Function to update players state
 * @param setCurrentPlayer - Function to update current player state
 * @param setOpponent - Function to update opponent state
 * @param setCountdownValue - Function to update countdown value state
 * @param setIsCountingDown - Function to update countdown state
 */
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
  // Store references to the current game ID and phase
  const gameIdRef = useRef<string | null>(null);
  const gamePhaseRef = useRef<string | null>(null);

  useEffect(() => {
    if (!gameId) return;
    
    // Store the current gameId in ref to detect changes
    gameIdRef.current = gameId;
    
    console.log("Setting up game subscriptions for game:", gameId);
    
    // Set up real-time listeners for game updates
    const gameChannel = gameService.subscribeToGame(gameId, (payload) => {
      console.log("Game update received:", payload);
      if (payload.new) {
        // Only update if still the same game
        if (gameIdRef.current === gameId) {
          setGame(payload.new);
          
          // Store the current game phase
          gamePhaseRef.current = payload.new.game_phase;
        }
      }
    });
    
    // Set up real-time listeners for player updates
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
      // Reset game phase reference on cleanup
      gamePhaseRef.current = null;
      
      // Unsubscribe from channels
      gameChannel.unsubscribe();
      playersChannel.unsubscribe();
    };
  }, [gameId, playerId, setGame, setPlayers, setCurrentPlayer, setOpponent, setCountdownValue, setIsCountingDown]);
};
