
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Copy, Check, Facebook, Twitter, Linkedin, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface WaitingLobbyProps {
  gameId: string;
  players: any[];
  currentPlayer: any;
}

const WaitingLobby: React.FC<WaitingLobbyProps> = ({ gameId, players, currentPlayer }) => {
  const [copied, setCopied] = useState(false);
  const isMobile = useIsMobile();
  const fullUrl = window.location.origin + '/join/' + gameId;
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopied(true);
      toast.success('Game link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  const shareOnSocialMedia = (platform: string) => {
    let shareUrl = '';
    const encodedUrl = encodeURIComponent(fullUrl);
    const message = encodeURIComponent('Join my dinner game! Who will be paying tonight?');
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${message}&url=${encodedUrl}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      default:
        // Use Web Share API as fallback if available
        if (navigator.share) {
          navigator.share({
            title: 'Join my dinner game!',
            text: 'Who will be paying tonight?',
            url: fullUrl
          }).catch(err => {
            console.error('Error sharing:', err);
          });
          return;
        }
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      toast.success(`Sharing on ${platform}!`);
    }
  };
  
  return (
    <div className="flex flex-col items-center gap-4 sm:gap-6 p-4 sm:p-8 text-center">
      <h2 className="text-2xl sm:text-3xl font-bold text-gameAccent">Waiting for Your Opponent</h2>
      
      <Card className="w-full max-w-md bg-white/90">
        <CardContent className="p-4 sm:p-6">
          <p className="mb-4">Share this link with your friend:</p>
          <div className="bg-gray-100 p-2 sm:p-3 rounded-md font-mono text-center break-all relative">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm overflow-hidden overflow-ellipsis">{fullUrl}</span>
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
          
          {isMobile && (
            <div className="mt-4">
              <p className="text-sm mb-2">Share on social media:</p>
              <div className="flex justify-center space-x-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="bg-[#1877F2] text-white hover:bg-[#1877F2]/90"
                  onClick={() => shareOnSocialMedia('facebook')}
                >
                  <Facebook size={18} />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="bg-[#1DA1F2] text-white hover:bg-[#1DA1F2]/90"
                  onClick={() => shareOnSocialMedia('twitter')}
                >
                  <Twitter size={18} />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="bg-[#0A66C2] text-white hover:bg-[#0A66C2]/90"
                  onClick={() => shareOnSocialMedia('linkedin')}
                >
                  <Linkedin size={18} />
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-gray-700 text-white hover:bg-gray-700/90"
                    >
                      <Share2 size={18} />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center">
                    <div className="grid gap-4 p-4">
                      <div className="text-sm">
                        Use your device's share feature
                      </div>
                      <Button
                        className={cn("w-full", navigator.share ? "" : "opacity-50 cursor-not-allowed")}
                        disabled={!navigator.share}
                        onClick={() => shareOnSocialMedia('native')}
                      >
                        Share
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
          
          <div className="mt-4 sm:mt-6">
            <h3 className="font-semibold mb-2">Players in lobby ({players.length}/2):</h3>
            <ul className="space-y-2">
              {players.map(player => (
                <li key={player.id} className="px-3 sm:px-4 py-2 bg-gray-50 rounded-md flex items-center gap-2">
                  {player.is_host && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Host</span>}
                  <span>{player.name}</span>
                  {player.id === currentPlayer.id && <span className="text-xs text-gray-500">(You)</span>}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mt-4 sm:mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
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
