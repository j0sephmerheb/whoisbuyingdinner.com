
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { CharacterType } from '@/services/game';
import { toast } from 'sonner';

interface GameOverProps {
  winner: CharacterType | undefined;
  userTeam: CharacterType;
  winnerName: string;
  loserName: string;
  onPlayAgain: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ winner, userTeam, winnerName, loserName, onPlayAgain }) => {
  const navigate = useNavigate();
  
  const userWon = winner === userTeam;
  const isTie = !winner;
  
  const emojiMap: Record<CharacterType, string> = {
    cowboy: '🤠',
    ninja: '🥷',
    fireman: '👨‍🚒',
    santa: '🎅'
  };
  
  // Log when GameOver is rendered to help with debugging
  React.useEffect(() => {
    console.log('GameOver component rendered', { winner, userTeam, winnerName, loserName });
  }, [winner, userTeam, winnerName, loserName]);
  
  return (
    <div className="flex items-center justify-center min-h-full w-full">
      <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl text-center">
        <h2 className="text-3xl font-bold mb-2">
          {userWon ? '🎉 Victory! 🎉' : isTie ? '🤝 Draw! 🤝' : '😞 Defeat! 😞'}
        </h2>
        
        <div className="text-6xl my-6">
          {winner && emojiMap[winner]}
        </div>
        
        <div className="text-xl mb-6">
          {winner && (
            <p className="font-bold text-gameAccent">Congratulations {winnerName}!</p>
          )}
          <p className="text-2xl my-4">
            {isTie ? "It's a tie! Split the bill!" : `${loserName} is buying dinner tonight!`}
          </p>
        </div>
        
        <div className="flex flex-col gap-3">
          <Button 
            onClick={() => {
              toast.success("Starting a new game!");
              onPlayAgain();
            }}
            className="bg-gameAccent hover:bg-gameAccent/80 w-full py-6 text-xl h-auto"
          >
            New Game
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameOver;
