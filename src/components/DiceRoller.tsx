
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useGame } from '@/context/GameContext';
import ThrowingAnimation from './ThrowingAnimation';

const DiceRoller = () => {
  const { gameState, rollDice } = useGame();
  const { userDiceValue, systemDiceValue, gamePhase, userTeam } = gameState;
  const [showAnimation, setShowAnimation] = useState(false);
  const [winner, setWinner] = useState<'user' | 'system' | null>(null);

  const isRolling = gamePhase === 'rolling';
  const canRoll = gamePhase === 'playing';
  const showResults = gamePhase === 'result';

  // Determine the winner and show animation if needed
  React.useEffect(() => {
    if (showResults && userDiceValue !== null && systemDiceValue !== null) {
      if (userDiceValue > systemDiceValue) {
        setWinner('user');
        setShowAnimation(true);
      } else if (systemDiceValue > userDiceValue) {
        setWinner('system');
        setShowAnimation(true);
      }
    }
  }, [gamePhase, userDiceValue, systemDiceValue, showResults]);

  const getDiceFace = (value: number | null) => {
    if (value === null) return '?';
    return value;
  };

  // Determine which team is throwing (chicken or cowboy)
  const getAttacker = (): 'chicken' | 'cowboy' => {
    if (winner === 'user') {
      return userTeam as 'chicken' | 'cowboy';
    } else {
      return userTeam === 'chicken' ? 'cowboy' : 'chicken';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 my-6 relative">
      <h2 className="text-2xl font-bold text-gray-800">Roll The Dice</h2>
      
      <div className="flex flex-col md:flex-row gap-8 items-center">
        <div className="flex flex-col items-center gap-2">
          <span className="text-lg font-semibold">Your Roll</span>
          <div 
            className={`w-20 h-20 flex items-center justify-center text-3xl font-bold bg-white border-4 
              ${userDiceValue && systemDiceValue && userDiceValue > systemDiceValue 
                ? 'border-green-500' 
                : userDiceValue && systemDiceValue && userDiceValue < systemDiceValue 
                  ? 'border-red-500' 
                  : 'border-gameAccent'} 
              rounded-xl shadow-md
              ${isRolling ? 'animate-dice-roll' : ''}
            `}
          >
            {getDiceFace(userDiceValue)}
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center p-2">
          <Button 
            onClick={rollDice} 
            disabled={!canRoll || isRolling}
            className={`bg-gameAccent hover:bg-gameAccent/80 px-8 py-6 text-xl h-auto ${isRolling || !canRoll ? 'opacity-50' : ''}`}
          >
            {isRolling ? 'Rolling...' : showResults ? 'Wait...' : 'Roll Dice'}
          </Button>
        </div>
        
        <div className="flex flex-col items-center gap-2">
          <span className="text-lg font-semibold">Computer Roll</span>
          <div 
            className={`w-20 h-20 flex items-center justify-center text-3xl font-bold bg-white border-4
              ${userDiceValue && systemDiceValue && systemDiceValue > userDiceValue 
                ? 'border-green-500' 
                : userDiceValue && systemDiceValue && systemDiceValue < userDiceValue 
                  ? 'border-red-500' 
                  : 'border-gameAccent'} 
              rounded-xl shadow-md
              ${isRolling ? 'animate-dice-roll' : ''}
            `}
          >
            {getDiceFace(systemDiceValue)}
          </div>
        </div>
      </div>
      
      {showResults && userDiceValue && systemDiceValue && (
        <div className="bg-white/90 p-3 rounded-lg shadow mt-2 text-center">
          {userDiceValue > systemDiceValue ? (
            <span className="font-semibold text-green-600">You win this round!</span>
          ) : userDiceValue < systemDiceValue ? (
            <span className="font-semibold text-red-600">Computer wins this round!</span>
          ) : (
            <span className="font-semibold text-yellow-600">It's a tie!</span>
          )}
        </div>
      )}
      
      {/* Animation Component */}
      {showAnimation && winner && (
        <ThrowingAnimation 
          attacker={getAttacker()} 
          show={showAnimation}
          onComplete={() => setShowAnimation(false)}
        />
      )}
    </div>
  );
};

export default DiceRoller;
