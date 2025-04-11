import React from 'react';
import { Card } from '@/components/ui/card';
import { PlayerData, CharacterType } from '@/services/game';

interface GameBoardProps {
  currentPlayer: PlayerData;
  opponent: PlayerData | null;
}

const GameBoard: React.FC<GameBoardProps> = ({ currentPlayer, opponent }) => {
  // Get the emoji based on character type
  const emojiMap: Record<CharacterType, string> = {
    cowboy: '🤠',
    ninja: '🥷',
    fireman: '👨‍🚒',
    santa: '🎅',
    princess: '👸',
    fairy: '🧚‍♀️',
    mermaid: '🧜‍♀️',
    witch: '🧙‍♀️'
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
      case 'princess': return 'bg-pink-100';
      case 'fairy': return 'bg-yellow-100';
      case 'mermaid': return 'bg-cyan-100';
      case 'witch': return 'bg-violet-100';
      default: return 'bg-gray-100';
    }
  };
  
  const userTeamColor = getTeamColor(currentPlayer.character_type);
  const opponentTeamColor = opponent ? getTeamColor(opponent.character_type) : 'bg-gray-100';

  return (
    <div className="w-full py-2">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className={`p-4 ${userTeamColor} shadow-lg border-none`}>
          <h3 className="text-xl font-bold mb-3 text-center">
            {currentPlayer.name}
          </h3>
          <div className="flex justify-center gap-2">
            {currentPlayer.character_data.map((character, index) => (
              <div 
                key={`user-${index}`} 
                className={`w-16 h-16 flex items-center justify-center rounded-full select-none ${
                  character.alive 
                    ? 'bg-transparent sm:bg-white shadow-none sm:shadow-md text-2xl sm:text-3xl' 
                    : 'bg-transparent sm:bg-gray-300 opacity-50 text-2xl sm:text-3xl'
                }`}
              >
                {character.alive ? (
                  <span>{userEmoji}</span>
                ) : (
                  <span className="text-red-500">💀</span>
                )}
              </div>
            ))}
          </div>
        </Card>
        
        <Card className={`p-4 ${opponentTeamColor} shadow-lg border-none`}>
          <h3 className="text-xl font-bold mb-3 text-center">
            {opponent?.name || 'Opponent'}
          </h3>
          <div className="flex justify-center gap-2">
            {opponent?.character_data.map((character, index) => (
              <div 
                key={`system-${index}`} 
                className={`w-16 h-16 flex items-center justify-center rounded-full select-none ${
                  character.alive 
                    ? 'bg-transparent sm:bg-white shadow-none sm:shadow-md text-2xl sm:text-3xl' 
                    : 'bg-transparent sm:bg-gray-300 opacity-50 text-2xl sm:text-3xl'
                }`}
              >
                {character.alive ? (
                  <span>{opponentEmoji}</span>
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
