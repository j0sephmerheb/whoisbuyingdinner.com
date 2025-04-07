
import React from 'react';
import { Card } from '@/components/ui/card';
import { PlayerData } from '@/services/gameService';

interface GameBoardProps {
  currentPlayer: PlayerData;
  opponent: PlayerData | null;
}

const GameBoard: React.FC<GameBoardProps> = ({ currentPlayer, opponent }) => {
  const userTeamIsChicken = currentPlayer.character_type === 'chicken';
  
  // Define emoji based on team
  const userEmoji = userTeamIsChicken ? '🐔' : '🤠';
  const opponentEmoji = userTeamIsChicken ? '🤠' : '🐔';
  
  const userTeamColor = userTeamIsChicken ? 'bg-chicken' : 'bg-cowboy';
  const opponentTeamColor = userTeamIsChicken ? 'bg-cowboy' : 'bg-chicken';

  return (
    <div className="w-full py-2">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className={`p-4 ${userTeamColor} shadow-lg border-none`}>
          <h3 className="text-xl font-bold mb-3">
            {currentPlayer.name} ({userTeamIsChicken ? 'Chickens' : 'Cowboys'})
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
            {opponent?.name || 'Opponent'} ({userTeamIsChicken ? 'Cowboys' : 'Chickens'})
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
