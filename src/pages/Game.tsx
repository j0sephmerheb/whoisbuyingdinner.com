
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMultiplayerGame } from '@/hooks/useMultiplayerGame';
import GameLayout from '@/components/GameLayout';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import WaitingLobby from '@/components/WaitingLobby';
import TeamSelection from '@/components/TeamSelection';
import PlayArea from '@/components/PlayArea';
import GameOver from '@/components/GameOver';
import GameCountdown from '@/components/GameCountdown';
import { toast } from 'sonner';

const Game = () => {
  const { gameId, playerId } = useParams<{ gameId: string, playerId: string }>();
  const navigate = useNavigate();
  
  // Ensuring these are valid to avoid conditional hook issues
  const safeGameId = gameId || '';
  const safePlayerId = playerId || '';
  
  const { 
    loading, 
    error,
    game,
    players, 
    currentPlayer,
    opponent,
    selectAvatar,
    startCountdown,
    rollDice,
    countdownValue,
    isCountingDown
  } = useMultiplayerGame(safeGameId, safePlayerId);
  
  // Log game state for debugging
  useEffect(() => {
    if (game) {
      console.log('Game component update:', { 
        gameId: safeGameId, 
        playerId: safePlayerId,
        gamePhase: game.game_phase,
        winnerId: game.winner_id,
        loserId: game.loser_id
      });
    }
  }, [game, safeGameId, safePlayerId]);
  
  // Early returns - these don't affect hook order since they happen after all hooks
  if (!safeGameId || !safePlayerId) {
    navigate('/');
    return null;
  }
  
  if (loading) {
    return <LoadingState />;
  }
  
  if (error || !game || !currentPlayer) {
    return <ErrorState error={error} />;
  }
  
  const isHost = currentPlayer.is_host;
  const { game_phase } = game;
  const bothPlayersJoined = players.length === 2;
  const bothPlayersSelectedAvatar = players.every(p => p.character_type !== null);
  
  // Simplify handling of loser's name
  const loserName = game.loser_id ? 
    (game.loser_id === currentPlayer.id ? currentPlayer.name : (opponent?.name || 'Opponent')) : 
    'Unknown';
  
  const handlePlayAgain = () => {
    toast.success("Starting a new game!");
    navigate('/');
  };
  
  return (
    <GameLayout gamePhase={game_phase}>
      {game_phase === 'waiting' && (
        <WaitingLobby 
          gameId={game.id} 
          players={players} 
          currentPlayer={currentPlayer}
        />
      )}
      
      {game_phase === 'selection' && (
        <TeamSelection 
          onSelect={selectAvatar}
          selectedAvatar={currentPlayer.character_type}
          opponentAvatar={opponent?.character_type}
          onStartCountdown={startCountdown}
          isHost={isHost}
          bothPlayersJoined={bothPlayersJoined}
          bothPlayersSelectedAvatar={bothPlayersSelectedAvatar}
        />
      )}
      
      {(game_phase === 'playing' || game_phase === 'rolling' || game_phase === 'result') && (
        <PlayArea 
          game={game}
          currentPlayer={currentPlayer}
          opponent={opponent}
          rollDice={rollDice}
        />
      )}
      
      {isCountingDown && countdownValue > 0 && (
        <GameCountdown value={countdownValue} />
      )}
      
      {game_phase === 'over' && (
        <GameOver 
          loserName={loserName}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </GameLayout>
  );
};

export default Game;
