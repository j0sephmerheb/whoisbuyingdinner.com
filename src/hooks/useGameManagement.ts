
import { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import * as gameService from '@/services/gameService';

export const useGameManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return {
    loading,
    error,
    createGame,
    joinGame,
    setError
  };
};
