
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

const Game = () => {
  const { gameId, playerId } = useParams<{ gameId: string, playerId: string }>();
  const navigate = useNavigate();
  
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
  } = useMultiplayerGame(gameId, playerId);
  
  useEffect(() => {
    if (!gameId || !playerId) {
      navigate('/');
      return;
    }
    
    if (game && game.game_phase === 'over') {
      const redirectTimer = setTimeout(() => {
        navigate('/');
      }, 10000);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [gameId, playerId, navigate, game]);
  
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
  
  return (
    <GameLayout>
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
          winner={game.winner_id === currentPlayer.id ? currentPlayer.character_type : opponent?.character_type} 
          userTeam={currentPlayer.character_type}
          winnerName={game.winner_id === currentPlayer.id ? currentPlayer.name : (opponent?.name || 'Opponent')}
          loserName={game.loser_id === currentPlayer.id ? currentPlayer.name : (opponent?.name || 'Opponent')}
          onPlayAgain={() => navigate('/')}
        />
      )}
    </GameLayout>
  );
};

export default Game;
