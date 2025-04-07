
import { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import * as gameService from '@/services/gameService';

export const useGameManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create a new game
  const createGame = async (playerName: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await gameService.createGame(playerName);
      
      if (result) {
        navigate(`/game/${result.gameId}/${result.playerId}`);
        return result;
      } else {
        setError('Failed to create game');
        toast.error('Failed to create game');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create game');
      toast.error('Error creating game');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Join an existing game
  const joinGame = async (gameId: string, playerName: string) => {
    setLoading(true);
    setError(null);
    try {
      const playerId = await gameService.joinGame(gameId, playerName);
      
      if (playerId) {
        navigate(`/game/${gameId}/${playerId}`);
        return playerId;
      } else {
        setError('Failed to join game');
        toast.error('Failed to join game');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to join game');
      toast.error('Error joining game');
      return null;
    } finally {
      setLoading(false);
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
