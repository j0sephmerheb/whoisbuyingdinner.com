
import React from 'react';
import { Button } from '@/components/ui/button';
import { CharacterType } from '@/services/gameService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  const avatarOptions: CharacterType[] = ['cowboy', 'ninja', 'fireman', 'santa'];
  
  const avatarEmoji: Record<CharacterType, string> = {
    cowboy: '🤠',
    ninja: '🥷',
    fireman: '👨‍🚒',
    santa: '🎅'
  };
  
  const avatarNames: Record<CharacterType, string> = {
    cowboy: 'Cowboy',
    ninja: 'Ninja',
    fireman: 'Fireman',
    santa: 'Santa'
  };
  
  return (
    <div className="flex flex-col items-center gap-8 p-8">
      <h1 className="text-4xl font-bold text-gameAccent mb-2">Choose Your Avatar</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-2xl">
        {avatarOptions.map(avatar => (
          <Card
            key={avatar}
            className={`p-4 cursor-pointer transition-all ${
              selectedAvatar === avatar 
                ? 'bg-gameAccent/30 border-2 border-gameAccent' 
                : 'hover:bg-gray-100 border border-gray-200'
            }`}
            onClick={() => onSelect(avatar)}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="h-24 w-24 flex items-center justify-center bg-white rounded-full shadow-inner text-4xl">
                <span className="text-5xl">{avatarEmoji[avatar]}</span>
              </div>
              <h2 className="text-xl font-bold">{avatarNames[avatar]}</h2>
            </div>
          </Card>
        ))}
      </div>
      
      <div className="mt-8 w-full max-w-2xl">
        <div className="flex justify-between items-center p-4 bg-white/80 rounded-lg shadow mb-4">
          <h3 className="text-xl font-semibold">Game Status:</h3>
          <div>
            {bothPlayersJoined ? (
              <span className="text-green-600 font-medium">Both players joined ✓</span>
            ) : (
              <span className="text-amber-600 font-medium">Waiting for opponent...</span>
            )}
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex-1 p-4 bg-white/80 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Your Selection:</h3>
            {selectedAvatar ? (
              <div className="flex items-center gap-3">
                <span className="text-3xl">{avatarEmoji[selectedAvatar]}</span>
                <span>{avatarNames[selectedAvatar]}</span>
              </div>
            ) : (
              <span className="text-gray-500">Please select an avatar</span>
            )}
          </div>
          
          <div className="flex-1 p-4 bg-white/80 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Opponent's Selection:</h3>
            {opponentAvatar ? (
              <div className="flex items-center gap-3">
                <span className="text-3xl">{avatarEmoji[opponentAvatar]}</span>
                <span>{avatarNames[opponentAvatar]}</span>
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
          className="mt-6 bg-gameAccent hover:bg-gameAccent/80 text-white font-bold py-2 px-8 text-lg"
        >
          Start Game
        </Button>
      )}
      
      {!isHost && bothPlayersSelectedAvatar && (
        <div className="mt-6 p-4 bg-white/80 rounded-lg shadow text-center">
          <p className="text-gray-600">Waiting for host to start the game...</p>
        </div>
      )}
      
      <div className="mt-4 p-4 bg-white/80 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-2">Game Rules</h3>
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
