import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMultiplayerGame } from '@/hooks/useMultiplayerGame';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import TeamSelection from '@/components/TeamSelection';
import DiceRoller from '@/components/DiceRoller';
import GameBoard from '@/components/GameBoard';
import GameOver from '@/components/GameOver';
import { Loader2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

const WaitingLobby = ({ 
  gameId, 
  players, 
  currentPlayer
}: { 
  gameId: string, 
  players: any[], 
  currentPlayer: any
}) => {
  const [copied, setCopied] = React.useState(false);
  const fullUrl = window.location.origin + '/join/' + gameId;
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopied(true);
      toast.success('Game link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  return (
    <div className="flex flex-col items-center gap-6 p-8 text-center">
      <h2 className="text-3xl font-bold text-gameAccent">Waiting for Your Opponent</h2>
      
      <Card className="w-full max-w-md bg-white/90">
        <CardContent className="p-6">
          <p className="mb-4">Share this link with your friend:</p>
          <div className="bg-gray-100 p-3 rounded-md font-mono text-center break-all relative">
            <div className="flex items-center justify-between">
              <span className="mr-2 text-sm overflow-hidden overflow-ellipsis">{fullUrl}</span>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={copyToClipboard}
                className="flex-shrink-0"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </Button>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Players in lobby ({players.length}/2):</h3>
            <ul className="space-y-2">
              {players.map(player => (
                <li key={player.id} className="px-4 py-2 bg-gray-50 rounded-md flex items-center gap-2">
                  {player.is_host && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Host</span>}
                  <span>{player.name}</span>
                  {player.id === currentPlayer.id && <span className="text-xs text-gray-500">(You)</span>}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
            {players.length < 2 ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                <span>Waiting for another player to join...</span>
              </>
            ) : (
              <span className="text-green-600">Both players have joined! Ready to select avatars.</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const Countdown = ({ value }: { value: number }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-white text-center">
        <h2 className="text-4xl mb-4">Game starting in</h2>
        <div className="text-8xl font-bold text-gameAccent animate-pulse">
          {value}
        </div>
      </div>
    </div>
  );
};

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
    rollDice
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gameBackground">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-gameAccent" />
          <p className="text-gameAccent">Loading game...</p>
        </div>
      </div>
    );
  }
  
  if (error || !game || !currentPlayer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gameBackground">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p>{error || "Game not found or you don't have access"}</p>
            <Button 
              onClick={() => navigate('/')}
              className="mt-4"
            >
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const isHost = currentPlayer.is_host;
  const { game_phase } = game;
  const bothPlayersJoined = players.length === 2;
  const bothPlayersSelectedAvatar = players.every(p => p.character_type !== null);
  
  return (
    <div className="min-h-screen flex flex-col items-center bg-gameBackground p-4">
      <header className="w-full max-w-5xl flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gameAccent">Who's Buying Dinner?</h1>
      </header>
      
      <main className="w-full max-w-5xl bg-white/90 rounded-2xl shadow-xl p-6 flex-1">
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
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-between w-full mb-4">
              <div className="bg-gameAccent/10 px-4 py-2 rounded-lg">
                <span className="font-semibold">Round: {game.current_round}</span>
              </div>
              
              <div className="bg-gameAccent/10 px-4 py-2 rounded-lg">
                <span className="font-semibold">
                  {currentPlayer.name} vs {opponent?.name || 'Opponent'}
                </span>
              </div>
            </div>
            
            <GameBoard currentPlayer={currentPlayer} opponent={opponent} />
            <DiceRoller 
              gamePhase={game_phase} 
              currentPlayer={currentPlayer}
              opponent={opponent}
              onRoll={rollDice}
              isCurrentPlayer={true}
            />
          </div>
        )}
      </main>
      
      <footer className="w-full max-w-5xl mt-6 text-center text-sm text-gray-600">
        Who's Buying Dinner? © 2025 - Roll the dice, loser pays the price!
      </footer>
      
      {game_phase === 'over' && (
        <GameOver 
          winner={game.winner_id === currentPlayer.id ? currentPlayer.character_type : opponent?.character_type} 
          userTeam={currentPlayer.character_type}
          winnerName={game.winner_id === currentPlayer.id ? currentPlayer.name : (opponent?.name || 'Opponent')}
          loserName={game.loser_id === currentPlayer.id ? currentPlayer.name : (opponent?.name || 'Opponent')}
          onPlayAgain={() => navigate('/')}
        />
      )}
    </div>
  );
};

export default Game;
