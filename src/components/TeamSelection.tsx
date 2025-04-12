import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CharacterType } from '@/services/game';
import { Card } from '@/components/ui/card';

interface AvatarSelectionProps {
  onSelect: (avatar: CharacterType) => void;
  selectedAvatar?: CharacterType;
  opponentAvatar?: CharacterType;
  onStartCountdown: () => void;
  isHost: boolean;
  bothPlayersJoined: boolean;
  bothPlayersSelectedAvatar: boolean;
}

const AvatarSelection: React.FC<AvatarSelectionProps> = ({ 
  onSelect, 
  selectedAvatar, 
  opponentAvatar, 
  onStartCountdown,
  isHost,
  bothPlayersJoined,
  bothPlayersSelectedAvatar
}) => {
  const avatarOptions: CharacterType[] = [
    'cowboy', 'ninja', 'fireman', 'santa',
    'princess', 'fairy', 'mermaid', 'witch'
  ];
  
  const avatarEmoji: Record<CharacterType, string> = {
    cowboy: '🤠',
    ninja: '🥷',
    fireman: '👨‍🚒',
    santa: '🎅',
    princess: '👸',
    fairy: '🧚‍♀️',
    mermaid: '🧜‍♀️',
    witch: '🧙‍♀️'
  };

  // Helper function to check if an avatar is selected
  const isAvatarSelected = (avatar: CharacterType): boolean => {
    if (!selectedAvatar) return false;
    return selectedAvatar === avatar;
  };

  const handleSelectAvatar = (avatar: CharacterType) => {
    console.log('Selecting avatar:', avatar);
    onSelect(avatar);
  };

  return (
    <div className="flex flex-col items-center gap-4 sm:gap-8 p-4 sm:p-8">
      <h1 className="text-2xl sm:text-4xl font-bold text-gameAccent mb-2">Choose Your Avatar</h1>
      
      {/* Use grid-cols-2 for mobile and grid-cols-4 for larger screens */}
      <div className="grid grid-cols-4 sm:grid-cols-4 gap-3 sm:gap-6 w-full max-w-2xl">
        {avatarOptions.map(avatar => (
          <Card
            key={avatar}
            className={`p-2 sm:p-4 cursor-pointer transition-all ${
              isAvatarSelected(avatar) 
                ? 'bg-gameAccent/30 border-2 border-gameAccent' 
                : 'hover:bg-gray-100 border border-gray-200'
            }`}
            onClick={() => handleSelectAvatar(avatar)}
          >
            <div className="flex flex-col items-center gap-2 sm:gap-4">
              <div className="h-16 w-16 sm:h-24 sm:w-24 flex items-center justify-center bg-white rounded-full text-4xl">
                <span className="text-3xl sm:text-5xl">{avatarEmoji[avatar]}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      <div className="mt-4 sm:mt-8 w-full max-w-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-center p-4 bg-white/80 rounded-lg shadow mb-4">
          <h3 className="text-lg sm:text-xl font-semibold">Game Status:</h3>
          <div className="mt-2 sm:mt-0">
            {bothPlayersJoined ? (
              <span className="text-green-600 font-medium">Both players joined ✓</span>
            ) : (
              <span className="text-amber-600 font-medium">Waiting for opponent...</span>
            )}
          </div>
        </div>
        
        <div className="flex flex-row sm:flex-row justify-between gap-4 text-center">
          <div className="flex-1 p-4 bg-white/80 rounded-lg shadow">
            <h3 className="text-md sm:text-lg font-semibold mb-2">Your Selection:</h3>
            {selectedAvatar ? (
              <div className="d-block ma-auto">
                <span className="text-2xl sm:text-3xl select-none">{avatarEmoji[selectedAvatar]}</span>
              </div>
            ) : (
              <span className="text-gray-500">Please select an avatar</span>
            )}
          </div>
          
          <div className="flex-1 p-4 bg-white/80 rounded-lg shadow">
            <h3 className="text-md sm:text-lg font-semibold mb-2">Opponent's Selection:</h3>
            {opponentAvatar ? (
              <div className="d-block ma-auto">
                <span className="text-2xl sm:text-3xl select-none">{avatarEmoji[opponentAvatar]}</span>
              </div>
            ) : (
              <span className="text-gray-500">Waiting for opponent...</span>
            )}
          </div>
        </div>
      </div>
      
      {isHost && bothPlayersJoined && bothPlayersSelectedAvatar && (
        <Button 
          onClick={onStartCountdown}
          className="mt-4 sm:mt-6 bg-gameAccent hover:bg-gameAccent/80 text-white font-bold py-2 px-6 sm:px-8 text-md sm:text-lg"
        >
          Start Game
        </Button>
      )}
      
      {!isHost && bothPlayersSelectedAvatar && (
        <div className="mt-4 sm:mt-6 p-4 bg-white/80 rounded-lg shadow text-center">
          <p className="text-gray-600">Waiting for host to start the game...</p>
        </div>
      )}
      
      <div className="mt-4 p-4 bg-white/80 rounded-lg shadow w-full max-w-2xl">
        <h3 className="text-lg sm:text-xl font-semibold mb-2">Game Rules</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>You'll have 5 characters on your team</li>
          <li>Each round, roll your dice against your opponent</li>
          <li>Highest roll gets to attack and eliminate one opponent</li>
          <li>Last player with characters standing wins!</li>
          <li>Loser buys dinner!</li>
        </ul>
      </div>
    </div>
  );
};

export default AvatarSelection;
