
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useMultiplayerGame } from '@/hooks/useMultiplayerGame';
import { useParams } from 'react-router-dom';

const Home = () => {
  const [playerName, setPlayerName] = useState('');
  const [creating, setCreating] = useState(false);
  const { gameId } = useParams();
  
  const { createGame, joinGame } = useMultiplayerGame();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!playerName.trim()) {
      return;
    }
    
    setCreating(true);
    
    try {
      if (gameId) {
        // Join existing game with URL
        await joinGame(gameId, playerName);
      } else {
        // Create new game
        await createGame(playerName);
      }
    } finally {
      setCreating(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gameBackground p-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold text-center text-gameAccent mb-8">
          Who's Buying Dinner?
        </h1>
        
        <Card>
          <CardHeader>
            <CardTitle>{gameId ? 'Join Game' : 'Create New Game'}</CardTitle>
            <CardDescription>
              {gameId 
                ? 'Enter your name to join this game' 
                : 'Start a new game and invite a friend to play'}
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="playerName" className="block text-sm font-medium mb-1">
                  Your Name
                </label>
                <Input
                  id="playerName"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  required
                />
              </div>
              
              {gameId && (
                <div className="bg-gameAccent/10 p-3 rounded-md">
                  <p className="text-sm">
                    You're joining a game created by someone else.
                  </p>
                </div>
              )}
            </CardContent>
            
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full bg-gameAccent hover:bg-gameAccent/80"
                disabled={creating}
              >
                {creating 
                  ? 'Processing...' 
                  : gameId 
                    ? 'Join Game' 
                    : 'Create Game'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Home;
