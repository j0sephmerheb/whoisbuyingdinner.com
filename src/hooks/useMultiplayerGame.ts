
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import * as gameService from '@/services/gameService';
import { useNavigate } from 'react-router-dom';
import { Json } from '@/integrations/supabase/types';

export const useMultiplayerGame = (
  gameId?: string,
  playerId?: string
) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [game, setGame] = useState<gameService.GameData | null>(null);
  const [players, setPlayers] = useState<gameService.PlayerData[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<gameService.PlayerData | null>(null);
  const [opponent, setOpponent] = useState<gameService.PlayerData | null>(null);
  const [countdownValue, setCountdownValue] = useState(5);

  // Create a new game
  const createGame = async (playerName: string) => {
    setLoading(true);
    const result = await gameService.createGame(playerName);
    setLoading(false);
    
    if (result) {
      navigate(`/game/${result.gameId}/${result.playerId}`);
      return result;
    } else {
      setError('Failed to create game');
      return null;
    }
  };

  // Join an existing game
  const joinGame = async (gameId: string, playerName: string) => {
    setLoading(true);
    const playerId = await gameService.joinGame(gameId, playerName);
    setLoading(false);
    
    if (playerId) {
      navigate(`/game/${gameId}/${playerId}`);
      return playerId;
    } else {
      setError('Failed to join game');
      return null;
    }
  };

  // Select avatar
  const selectAvatar = async (avatarType: gameService.CharacterType) => {
    if (!currentPlayer) return false;
    
    const result = await gameService.selectAvatar(currentPlayer.id, avatarType);
    if (!result) {
      toast.error('Failed to select avatar');
    } else {
      toast.success(`You selected ${avatarType}!`);
    }
    return result;
  };

  // Start countdown
  const startCountdown = async () => {
    if (!game) return false;
    
    // First check if all players have selected avatars
    const allSelected = await gameService.checkAvatarSelection(game.id);
    if (!allSelected) {
      toast.error('All players must select an avatar first');
      return false;
    }
    
    const result = await gameService.startCountdown(game.id);
    if (!result) {
      toast.error('Failed to start countdown');
    }
    return result;
  };

  // Roll dice
  const rollDice = async () => {
    if (!currentPlayer || !game || game.game_phase !== 'playing') return;
    
    // Update game phase to rolling
    await gameService.updateGamePhase(game.id, 'rolling');
    
    // Simulate dice roll with delay
    setTimeout(async () => {
      const value = await gameService.rollDice(currentPlayer.id);
      
      // After both players have rolled, determine the winner
      setTimeout(() => {
        if (players.every(p => p.dice_value !== null)) {
          gameService.updateGamePhase(game.id, 'result');
          
          // After showing result, process the round outcome
          setTimeout(() => {
            processRoundOutcome();
          }, 2000);
        }
      }, 500);
    }, 1500);
  };

  // Process the outcome of a round
  const processRoundOutcome = async () => {
    if (!currentPlayer || !opponent || !game) return;
    
    const userRoll = currentPlayer.dice_value || 0;
    const opponentRoll = opponent.dice_value || 0;
    
    // Determine who won the round
    if (userRoll > opponentRoll) {
      // Player wins
      const updatedCharacters = [...opponent.character_data];
      // Find first alive character and eliminate it
      const aliveIndex = updatedCharacters.findIndex(c => c.alive);
      if (aliveIndex !== -1) {
        updatedCharacters[aliveIndex].alive = false;
      }
      
      await gameService.updatePlayerAfterRound(
        opponent.id,
        opponent.score,
        updatedCharacters
      );
      
      toast.success("You won this round!");
    } else if (userRoll < opponentRoll) {
      // Opponent wins
      const updatedCharacters = [...currentPlayer.character_data];
      // Find first alive character and eliminate it
      const aliveIndex = updatedCharacters.findIndex(c => c.alive);
      if (aliveIndex !== -1) {
        updatedCharacters[aliveIndex].alive = false;
      }
      
      await gameService.updatePlayerAfterRound(
        currentPlayer.id,
        currentPlayer.score,
        updatedCharacters
      );
      
      toast.error("You lost this round!");
    } else {
      // Tie
      toast.info("It's a tie!");
    }
    
    // Reset dice values
    await Promise.all([
      supabase.from('players').update({ dice_value: null }).eq('id', currentPlayer.id),
      supabase.from('players').update({ dice_value: null }).eq('id', opponent.id)
    ]);
    
    // Check if game is over
    const playerAliveCount = currentPlayer.character_data.filter(c => c.alive).length;
    const opponentAliveCount = opponent.character_data.filter(c => c.alive).length;
    
    if (playerAliveCount === 0 || opponentAliveCount === 0) {
      const winnerId = playerAliveCount > 0 ? currentPlayer.id : opponent.id;
      const loserId = playerAliveCount > 0 ? opponent.id : currentPlayer.id;
      
      await gameService.endGame(game.id, winnerId, loserId);
    } else {
      // Move to next round
      await gameService.updateGamePhase(game.id, 'playing');
    }
  };

  // Load game data
  useEffect(() => {
    if (!gameId || !playerId) return;
    
    const loadGameData = async () => {
      setLoading(true);
      
      try {
        // Get game data
        const { data: gameData, error: gameError } = await supabase
          .from('games')
          .select()
          .eq('id', gameId)
          .single();
        
        if (gameError) throw new Error(gameError.message);
        setGame(gameData);
        
        // Get players data
        const { data: playersData, error: playersError } = await supabase
          .from('players')
          .select()
          .eq('game_id', gameId);
        
        if (playersError) throw new Error(playersError.message);
        
        // Convert the Json character_data to the correct type
        const typedPlayersData = playersData.map(player => ({
          ...player,
          character_data: Array.isArray(player.character_data) 
            ? player.character_data 
            : Array(5).fill(null).map((_, id) => ({ alive: true, id }))
        })) as gameService.PlayerData[];
        
        setPlayers(typedPlayersData);
        
        // Set current player and opponent
        const current = typedPlayersData.find(p => p.id === playerId);
        if (current) setCurrentPlayer(current);
        
        const other = typedPlayersData.find(p => p.id !== playerId);
        if (other) setOpponent(other);
        
      } catch (err: any) {
        setError(err.message);
        toast.error('Error loading game data');
      } finally {
        setLoading(false);
      }
    };
    
    loadGameData();
    
    // Set up real-time listeners
    const gameChannel = gameService.subscribeToGame(gameId, (payload) => {
      if (payload.new) {
        setGame(payload.new);
        
        // Start countdown timer if game phase is countdown
        if (payload.new.game_phase === 'countdown' && payload.old.game_phase !== 'countdown') {
          let count = 5;
          setCountdownValue(count);
          
          const interval = setInterval(() => {
            count--;
            setCountdownValue(count);
            
            if (count <= 0) {
              clearInterval(interval);
              // Start the game after countdown
              gameService.startGame(gameId);
            }
          }, 1000);
        }
      }
    });
    
    const playersChannel = gameService.subscribeToPlayers(gameId, (payload) => {
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
          } as gameService.PlayerData;
          
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
      }
    });
    
    return () => {
      gameChannel.unsubscribe();
      playersChannel.unsubscribe();
    };
  }, [gameId, playerId]);

  return {
    loading,
    error,
    game,
    players,
    currentPlayer,
    opponent,
    countdownValue,
    createGame,
    joinGame,
    selectAvatar,
    startCountdown,
    rollDice
  };
};
