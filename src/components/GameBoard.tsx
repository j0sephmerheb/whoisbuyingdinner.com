
import React from 'react';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/card';

const GameBoard = () => {
  const { gameState } = useGame();
  const { userTeam, userCharacters, systemCharacters } = gameState;
  
  const userTeamIsChicken = userTeam === 'chicken';
  
  // Determine which team is rendered as userTeam and which as systemTeam
  const userTeamCharacters = userCharacters;
  const systemTeamCharacters = systemCharacters;
  
  // Define emoji and team-specific styling
  const userEmoji = userTeamIsChicken ? '🐔' : '🤠';
  const systemEmoji = userTeamIsChicken ? '🤠' : '🐔';
  
  const userTeamColor = userTeamIsChicken ? 'bg-chicken' : 'bg-cowboy';
  const systemTeamColor = userTeamIsChicken ? 'bg-cowboy' : 'bg-chicken';

  return (
    <div className="w-full py-2">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className={`p-4 ${userTeamColor} shadow-lg border-none`}>
          <h3 className="text-xl font-bold mb-3">{userTeamIsChicken ? 'Your Chickens' : 'Your Cowboys'}</h3>
          <div className="flex justify-center gap-2">
            {userTeamCharacters.map((character, index) => (
              <div 
                key={`user-${index}`} 
                className={`w-16 h-16 flex items-center justify-center text-3xl rounded-full ${character.alive 
                  ? 'bg-white shadow-md' 
                  : 'bg-gray-300 opacity-50'}`}
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
        
        <Card className={`p-4 ${systemTeamColor} shadow-lg border-none`}>
          <h3 className="text-xl font-bold mb-3">{userTeamIsChicken ? 'Enemy Cowboys' : 'Enemy Chickens'}</h3>
          <div className="flex justify-center gap-2">
            {systemTeamCharacters.map((character, index) => (
              <div 
                key={`system-${index}`} 
                className={`w-16 h-16 flex items-center justify-center text-3xl rounded-full ${character.alive 
                  ? 'bg-white shadow-md' 
                  : 'bg-gray-300 opacity-50'}`}
              >
                {character.alive ? (
                  <span className="animate-float">{systemEmoji}</span>
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
