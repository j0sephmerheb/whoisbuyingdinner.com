
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useMultiplayerGame } from '@/hooks/useMultiplayerGame';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import TeamSelection from '@/components/TeamSelection';
import DiceRoller from '@/components/DiceRoller';
import GameBoard from '@/components/GameBoard';
import GameOver from '@/components/GameOver';
import { Loader2 } from 'lucide-react';

// Create a waiting lobby component
const WaitingLobby = ({ 
  gameId, 
  players, 
  isHost, 
  onStart 
}: { 
  gameId: string, 
  players: any[], 
  isHost: boolean, 
  onStart: () => void 
}) => {
  return (
    <div className="flex flex-col items-center gap-6 p-8 text-center">
      <h2 className="text-3xl font-bold text-gameAccent">Waiting for Players</h2>
      
      <Card className="w-full max-w-md bg-white/90">
        <CardContent className="p-6">
          <p className="mb-4">Share this Game ID with your friend:</p>
          <div className="bg-gray-100 p-3 rounded-md font-mono text-center break-all">
            {gameId}
          </div>
          
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Players in lobby ({players.length}/2):</h3>
            <ul className="space-y-2">
              {players.map(player => (
                <li key={player.id} className="px-4 py-2 bg-gray-50 rounded-md flex items-center gap-2">
                  {player.is_host && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Host</span>}
                  <span>{player.name}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {isHost && players.length === 2 && (
            <Button 
              onClick={onStart}
              className="mt-6 w-full bg-gameAccent hover:bg-gameAccent/80"
            >
              Start Game
            </Button>
          )}
          
          {!isHost && players.length === 2 && (
            <p className="mt-6 text-sm text-gray-500">
              Waiting for host to start the game...
            </p>
          )}
          
          {players.length < 2 && (
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
              <Loader2 className="animate-spin" size={16} />
              <span>Waiting for another player to join...</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const Game = () => {
  const { gameId, playerId } = useParams<{ gameId: string, playerId: string }>();
  const { 
    loading, 
    error,
    game, 
    players, 
    currentPlayer,
    opponent,
    startGame,
    selectTeam,
    rollDice
  } = useMultiplayerGame(gameId, playerId);
  
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
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const isHost = currentPlayer.is_host;
  const { game_phase } = game;
  
  return (
    <div className="min-h-screen flex flex-col items-center bg-gameBackground p-4">
      <header className="w-full max-w-5xl flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gameAccent">Chicken-Cowboy Dice Duel</h1>
      </header>
      
      <main className="w-full max-w-5xl bg-white/90 rounded-2xl shadow-xl p-6 flex-1">
        {game_phase === 'waiting' && (
          <WaitingLobby 
            gameId={game.id} 
            players={players} 
            isHost={isHost} 
            onStart={startGame} 
          />
        )}
        
        {game_phase === 'selection' && (
          <TeamSelection onSelect={selectTeam} />
        )}
        
        {(game_phase === 'playing' || game_phase === 'rolling' || game_phase === 'result') && (
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-between w-full mb-4">
              <div className="bg-gameAccent/10 px-4 py-2 rounded-lg">
                <span className="font-semibold">Round: {game.current_round}</span>
              </div>
              
              <div className="bg-gameAccent/10 px-4 py-2 rounded-lg">
                <span className="font-semibold">
                  Your Team: {currentPlayer.character_type === 'chicken' ? '🐔 Chickens' : '🤠 Cowboys'}
                </span>
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
              userDiceValue={currentPlayer.dice_value} 
              systemDiceValue={opponent?.dice_value}
              onRoll={rollDice}
            />
          </div>
        )}
      </main>
      
      <footer className="w-full max-w-5xl mt-6 text-center text-sm text-gray-600">
        Chicken-Cowboy Dice Duel © 2025 - Roll to determine farm dominance
      </footer>
      
      {game_phase === 'over' && (
        <GameOver 
          winner={game.winner_id === playerId ? currentPlayer.character_type : opponent?.character_type} 
          userTeam={currentPlayer.character_type}
        />
      )}
    </div>
  );
};

export default Game;
