import React from 'react';
import { Button } from '@/components/ui/button';
import { GamePhase, PlayerData } from '@/services/game';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react';

interface DiceRollerProps {
  gamePhase: GamePhase;
  currentPlayer: PlayerData;
  opponent: PlayerData | null;
  onRoll: () => void;
  isCurrentPlayer: boolean;
}

const DiceRoller: React.FC<DiceRollerProps> = ({ 
  gamePhase, 
  currentPlayer, 
  opponent, 
  onRoll,
  isCurrentPlayer
}) => {
  const isRolling = gamePhase === 'rolling';
  const canRoll = gamePhase === 'playing' || gamePhase === 'rolling';
  const showResults = gamePhase === 'result';

  const userDiceValue = currentPlayer.dice_value;
  const opponentDiceValue = opponent?.dice_value;

  const getDiceFace = (value: number | null) => {
    if (value === null) return '?';
    return value;
  };

  const getDiceIcon = (value: number | null, size = 72) => {
    if (value === null) return null;
    switch(value) {
      case 1: return <Dice1 size={size} />;
      case 2: return <Dice2 size={size} />;
      case 3: return <Dice3 size={size} />;
      case 4: return <Dice4 size={size} />;
      case 5: return <Dice5 size={size} />;
      case 6: return <Dice6 size={size} />;
      default: return null;
    }
  };

  // Each player can only roll their own dice
  const canPlayerRoll = isCurrentPlayer && canRoll && userDiceValue === null;
  
  return (
    <div className="flex flex-col items-center justify-center gap-6 my-6 relative">
      <h2 className="text-2xl font-bold text-gray-800">
        {isRolling ? (
          <span className="text-amber-600 font-medium">
            {userDiceValue === null && opponentDiceValue === null ? 'Time to roll!' : 
              userDiceValue !== null && opponentDiceValue === null ? 'Waiting for opponent...' :
              userDiceValue === null && opponentDiceValue !== null ? 'Your turn to roll!' : 
              ''}
          </span>
        ) : canRoll ? (
          <span className="font-medium">Time to roll!</span>
        ) : (
          <span className="font-medium">Waiting...</span>
        )}
      </h2>
      
      <div className="flex flex-row md:flex-row gap-10 items-start">
        <div className="flex flex-col items-center gap-2">
          <span className="text-lg font-semibold">Your Roll</span>
          <div 
            className={`w-40 h-40 flex items-center justify-center text-5xl select-none font-bold bg-white border-4 
              ${userDiceValue && opponentDiceValue && userDiceValue > opponentDiceValue 
                ? 'border-green-500' 
                : userDiceValue && opponentDiceValue && userDiceValue < opponentDiceValue 
                  ? 'border-red-500' 
                  : 'border-gameAccent'} 
              rounded-xl shadow-md
            `}
          >
            {getDiceIcon(userDiceValue, 72) || getDiceFace(userDiceValue)}
          </div>
          {canPlayerRoll && (
            <Button 
              onClick={onRoll} 
              disabled={!canRoll || userDiceValue !== null}
              className={`bg-gameAccent hover:bg-gameAccent/80 px-4 py-2 text-md h-auto mt-2 ${userDiceValue !== null ? 'opacity-50' : ''}`}
            >
              Roll Your Dice
            </Button>
          )}
          {!canPlayerRoll && userDiceValue !== null && (
            <span className="text-sm text-green-600 mt-2">You've rolled!</span>
          )}
          {!canPlayerRoll && userDiceValue === null && isCurrentPlayer && (
            <span className="text-sm text-amber-600 mt-2">Waiting to roll...</span>
          )}
        </div>
 
        <div className="flex flex-col items-center gap-2">
          <span className="text-lg font-semibold">Opponent Roll</span>
          <div 
            className={`w-40 h-40 flex items-center justify-center text-5xl select-none font-bold bg-white border-4
              ${userDiceValue && opponentDiceValue && opponentDiceValue > userDiceValue 
                ? 'border-green-500' 
                : userDiceValue && opponentDiceValue && opponentDiceValue < userDiceValue 
                  ? 'border-red-500' 
                  : 'border-gameAccent'} 
              rounded-xl shadow-md
            `}
          >
            {getDiceIcon(opponentDiceValue, 72) || getDiceFace(opponentDiceValue)}
          </div>
          {!isCurrentPlayer && canRoll && opponentDiceValue === null && (
            <Button 
              onClick={onRoll} 
              disabled={!canRoll || opponentDiceValue !== null}
              className={`bg-gameAccent hover:bg-gameAccent/80 px-4 py-2 text-md h-auto mt-2 ${opponentDiceValue !== null ? 'opacity-50' : ''}`}
            >
              Roll Your Dice
            </Button>
          )}
          {opponentDiceValue !== null && (
            <span className="text-sm text-green-600 mt-2">Opponent has rolled!</span>
          )}
          {opponentDiceValue === null && !isCurrentPlayer && (
            <span className="text-sm text-amber-600 mt-2">Waiting to roll...</span>
          )}
        </div>
      </div>
      
      {showResults && userDiceValue && opponentDiceValue && (
        <div className="bg-white/90 p-3 rounded-lg shadow mt-2 text-center">
          {userDiceValue > opponentDiceValue ? (
            <span className="font-semibold text-green-600">You win this round!</span>
          ) : userDiceValue < opponentDiceValue ? (
            <span className="font-semibold text-red-600">You lost this round!</span>
          ) : (
            <span className="font-semibold text-yellow-600">It's a tie!</span>
          )}
        </div>
      )}
    </div>
  );
};

export default DiceRoller;
