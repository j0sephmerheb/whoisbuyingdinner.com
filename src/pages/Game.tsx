
import React from 'react';
import { useGame } from '@/context/GameContext';
import TeamSelection from '@/components/TeamSelection';
import DiceRoller from '@/components/DiceRoller';
import GameBoard from '@/components/GameBoard';
import GameOver from '@/components/GameOver';
import { Button } from '@/components/ui/button';

const Game = () => {
  const { gameState, resetGame } = useGame();
  const { gamePhase, currentRound, userTeam, userScore, systemScore } = gameState;
  
  return (
    <div className="min-h-screen flex flex-col items-center bg-gameBackground p-4">
      <header className="w-full max-w-5xl flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gameAccent">Chicken-Cowboy Dice Duel</h1>
        
        {gamePhase !== 'selection' && (
          <Button variant="outline" onClick={resetGame}>
            Reset Game
          </Button>
        )}
      </header>
      
      <main className="w-full max-w-5xl bg-white/90 rounded-2xl shadow-xl p-6 flex-1">
        {gamePhase === 'selection' ? (
          <TeamSelection />
        ) : (
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-between w-full mb-4">
              <div className="bg-gameAccent/10 px-4 py-2 rounded-lg">
                <span className="font-semibold">Round: {currentRound}</span>
              </div>
              
              <div className="bg-gameAccent/10 px-4 py-2 rounded-lg">
                <span className="font-semibold">
                  Your Team: {userTeam === 'chicken' ? '🐔 Chickens' : '🤠 Cowboys'}
                </span>
              </div>
              
              <div className="bg-gameAccent/10 px-4 py-2 rounded-lg">
                <span className="font-semibold">Score: {userScore} - {systemScore}</span>
              </div>
            </div>
            
            <GameBoard />
            <DiceRoller />
          </div>
        )}
      </main>
      
      <footer className="w-full max-w-5xl mt-6 text-center text-sm text-gray-600">
        Chicken-Cowboy Dice Duel © 2025 - Roll to determine farm dominance
      </footer>
      
      {gamePhase === 'over' && <GameOver />}
    </div>
  );
};

export default Game;
