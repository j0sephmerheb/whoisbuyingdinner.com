
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface WaitingLobbyProps {
  gameId: string;
  players: any[];
  currentPlayer: any;
}

const WaitingLobby: React.FC<WaitingLobbyProps> = ({ gameId, players, currentPlayer }) => {
  const [copied, setCopied] = useState(false);
  const fullUrl = window.location.origin + '/join/' + gameId;
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopied(true);
      toast.success('Game link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  return (
    <div className="flex flex-col items-center gap-6 p-8 text-center">
      <h2 className="text-3xl font-bold text-gameAccent">Waiting for Your Opponent</h2>
      
      <Card className="w-full max-w-md bg-white/90">
        <CardContent className="p-6">
          <p className="mb-4">Share this link with your friend:</p>
          <div className="bg-gray-100 p-3 rounded-md font-mono text-center break-all relative">
            <div className="flex items-center justify-between">
              <span className="mr-2 text-sm overflow-hidden overflow-ellipsis">{fullUrl}</span>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={copyToClipboard}
                className="flex-shrink-0"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </Button>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Players in lobby ({players.length}/2):</h3>
            <ul className="space-y-2">
              {players.map(player => (
                <li key={player.id} className="px-4 py-2 bg-gray-50 rounded-md flex items-center gap-2">
                  {player.is_host && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Host</span>}
                  <span>{player.name}</span>
                  {player.id === currentPlayer.id && <span className="text-xs text-gray-500">(You)</span>}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
            {players.length < 2 ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                <span>Waiting for another player to join...</span>
              </>
            ) : (
              <span className="text-green-600">Both players have joined! Ready to select avatars.</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WaitingLobby;
