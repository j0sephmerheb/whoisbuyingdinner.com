
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useMultiplayerGame } from '@/hooks/useMultiplayerGame';

const Home = () => {
  const [playerName, setPlayerName] = useState('');
  const [gameId, setGameId] = useState('');
  const [createMode, setCreateMode] = useState(true);
  const [joining, setJoining] = useState(false);
  
  const { createGame, joinGame } = useMultiplayerGame();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!playerName.trim()) {
      return;
    }
    
    setJoining(true);
    
    try {
      if (createMode) {
        await createGame(playerName);
      } else {
        if (gameId.trim()) {
          await joinGame(gameId, playerName);
        }
      }
    } finally {
      setJoining(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gameBackground p-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold text-center text-gameAccent mb-8">
          Chicken-Cowboy Dice Duel
        </h1>
        
        <Card>
          <CardHeader>
            <CardTitle>{createMode ? 'Create New Game' : 'Join Existing Game'}</CardTitle>
            <CardDescription>
              {createMode 
                ? 'Start a new multiplayer game and invite a friend' 
                : 'Enter a game ID to join an existing game'}
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
              
              {!createMode && (
                <div>
                  <label htmlFor="gameId" className="block text-sm font-medium mb-1">
                    Game ID
                  </label>
                  <Input
                    id="gameId"
                    value={gameId}
                    onChange={(e) => setGameId(e.target.value)}
                    placeholder="Enter game ID"
                    required
                  />
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-3">
              <Button 
                type="submit" 
                className="w-full bg-gameAccent hover:bg-gameAccent/80"
                disabled={joining}
              >
                {joining 
                  ? 'Processing...' 
                  : createMode 
                    ? 'Create Game' 
                    : 'Join Game'}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setCreateMode(!createMode)}
                disabled={joining}
              >
                {createMode 
                  ? 'Join Existing Game Instead' 
                  : 'Create New Game Instead'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Home;
