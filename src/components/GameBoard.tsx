import React from 'react';
import { Card } from '@/components/ui/card';
import { PlayerData } from '@/services/game';

interface GameBoardProps {
  currentPlayer: PlayerData;
  opponent: PlayerData | null;
}

const GameBoard: React.FC<GameBoardProps> = ({ currentPlayer, opponent }) => {
  // Get the emoji based on character type
  const emojiMap: Record<string, string> = {
    cowboy: '🤠',
    ninja: '🥷',
    fireman: '👨‍🚒',
    santa: '🎅'
  };
  
  const userEmoji = emojiMap[currentPlayer.character_type] || '🤠';
  const opponentEmoji = opponent ? emojiMap[opponent.character_type] || '🤠' : '❓';
  
  // Get team colors based on character type
  const getTeamColor = (characterType: string): string => {
    switch(characterType) {
      case 'cowboy': return 'bg-blue-100';
      case 'ninja': return 'bg-purple-100';
      case 'fireman': return 'bg-red-100';
      case 'santa': return 'bg-green-100';
      default: return 'bg-gray-100';
    }
  };
  
  const userTeamColor = getTeamColor(currentPlayer.character_type);
  const opponentTeamColor = opponent ? getTeamColor(opponent.character_type) : 'bg-gray-100';

  return (
    <div className="w-full py-2">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className={`p-4 ${userTeamColor} shadow-lg border-none`}>
          <h3 className="text-xl font-bold mb-3">
            {currentPlayer.name}
          </h3>
          <div className="flex justify-center gap-2">
            {currentPlayer.character_data.map((character, index) => (
              <div 
                key={`user-${index}`} 
                className={`w-16 h-16 flex items-center justify-center text-3xl rounded-full ${
                  character.alive 
                    ? 'bg-white shadow-md' 
                    : 'bg-gray-300 opacity-50'
                }`}
              >
                {character.alive ? (
                  <span className="animate-float">{userEmoji}</span>
                ) : (
                  <span className="text-red-500">💀</span>
                )}
              </div>
            ))}
          </div>
        </Card>
        
        <Card className={`p-4 ${opponentTeamColor} shadow-lg border-none`}>
          <h3 className="text-xl font-bold mb-3">
            {opponent?.name || 'Opponent'}
          </h3>
          <div className="flex justify-center gap-2">
            {opponent?.character_data.map((character, index) => (
              <div 
                key={`system-${index}`} 
                className={`w-16 h-16 flex items-center justify-center text-3xl rounded-full ${
                  character.alive 
                    ? 'bg-white shadow-md' 
                    : 'bg-gray-300 opacity-50'
                }`}
              >
                {character.alive ? (
                  <span className="animate-float">{opponentEmoji}</span>
                ) : (
                  <span className="text-red-500">💀</span>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default GameBoard;
