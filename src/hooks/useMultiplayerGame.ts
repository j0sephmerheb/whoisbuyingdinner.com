
import { useState } from 'react';
import { useGameManagement } from './useGameManagement';
import { usePlayerActions } from './usePlayerActions';
import { useGameCountdown } from './useGameCountdown';
import { useGameDataLoader } from './useGameDataLoader';
import { useGameSubscriptions } from './useGameSubscriptions';
import * as gameService from '@/services/gameService';

export const useMultiplayerGame = (
  gameId?: string,
  playerId?: string
) => {
  // State
  const [game, setGame] = useState<gameService.GameData | null>(null);
  const [players, setPlayers] = useState<gameService.PlayerData[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<gameService.PlayerData | null>(null);
  const [opponent, setOpponent] = useState<gameService.PlayerData | null>(null);

  // Game management (create/join game)
  const { loading, error, createGame, joinGame, setError } = useGameManagement();

  // Countdown functionality
  const { countdownValue, isCountingDown, setCountdownValue, setIsCountingDown, startCountdown } = useGameCountdown(game);

  // Player actions (select avatar, roll dice)
  const { selectAvatar, rollDice } = usePlayerActions(game, currentPlayer, opponent);

  // Load game data
  useGameDataLoader(
    gameId, 
    playerId,
    setLoading => loading,
    setError, 
    setGame, 
    setPlayers, 
    setCurrentPlayer, 
    setOpponent
  );

  // Set up real-time subscriptions
  useGameSubscriptions(
    gameId,
    playerId,
    setGame,
    setPlayers,
    setCurrentPlayer,
    setOpponent,
    setCountdownValue,
    setIsCountingDown
  );

  return {
    loading,
    error,
    game,
    players,
    currentPlayer,
    opponent,
    countdownValue,
    isCountingDown,
    createGame,
    joinGame,
    selectAvatar,
    startCountdown,
    rollDice
  };
};
