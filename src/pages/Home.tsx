
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useMultiplayerGame } from '@/hooks/useMultiplayerGame';
import { useParams, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

const Home = () => {
  const [playerName, setPlayerName] = useState('');
  const [creating, setCreating] = useState(false);
  const { gameId } = useParams();
  const location = useLocation();
  
  // Extract gameId from URL path when coming from a shared link
  useEffect(() => {
    // Check if we're on a /join/[gameId] path
    const pathParts = location.pathname.split('/');
    if (pathParts[1] === 'join' && pathParts[2]) {
      console.log('Join URL detected:', pathParts[2]);
    }
  }, [location]);
  
  const { createGame, joinGame } = useMultiplayerGame();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!playerName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    
    setCreating(true);
    
    try {
      // Check if we're on a /join/[gameId] path
      const pathParts = location.pathname.split('/');
      const joinGameId = pathParts[1] === 'join' ? pathParts[2] : gameId;
      
      if (joinGameId) {
        console.log('Joining game with ID:', joinGameId);
        // Join existing game with URL
        await joinGame(joinGameId, playerName);
      } else {
        console.log('Creating new game');
        // Create new game
        await createGame(playerName);
      }
    } catch (error) {
      console.error('Error processing game:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setCreating(false);
    }
  };
  
  // Determine if we're in join mode based on URL
  const isJoinMode = gameId || location.pathname.includes('/join/');
  const joinGameId = gameId || (location.pathname.includes('/join/') ? location.pathname.split('/')[2] : null);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gameBackground p-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold text-center text-gameAccent mb-4 w-full">
          Who's Buying Dinner?
        </h1>
        
        <Card>
          <CardHeader>
            <CardTitle>{isJoinMode ? 'Join Game' : 'Create New Game'}</CardTitle>
            <CardDescription>
              {isJoinMode 
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
              
              {isJoinMode && (
                <div className="bg-gameAccent/10 p-3 rounded-md">
                  <p className="text-sm">
                    You're joining a game created by someone else.
                  </p>
                  {joinGameId && (
                    <p className="text-xs mt-1 font-mono">Game ID: {joinGameId}</p>
                  )}
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
                  : isJoinMode 
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
