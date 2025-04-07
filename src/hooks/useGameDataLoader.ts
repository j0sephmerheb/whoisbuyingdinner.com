
import { useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { GameData, PlayerData } from '@/services/gameService';

export const useGameDataLoader = (
  gameId: string | undefined,
  playerId: string | undefined,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  setGame: React.Dispatch<React.SetStateAction<GameData | null>>,
  setPlayers: React.Dispatch<React.SetStateAction<PlayerData[]>>,
  setCurrentPlayer: React.Dispatch<React.SetStateAction<PlayerData | null>>,
  setOpponent: React.Dispatch<React.SetStateAction<PlayerData | null>>
) => {
  useEffect(() => {
    if (!gameId || !playerId) return;
    
    const loadGameData = async () => {
      setLoading(true);
      
      try {
        // Get game data
        const { data: gameData, error: gameError } = await supabase
          .from('games')
          .select()
          .eq('id', gameId)
          .single();
        
        if (gameError) throw new Error(gameError.message);
        setGame(gameData);
        
        // Get players data
        const { data: playersData, error: playersError } = await supabase
          .from('players')
          .select()
          .eq('game_id', gameId);
        
        if (playersError) throw new Error(playersError.message);
        
        // Convert the Json character_data to the correct type
        const typedPlayersData = playersData.map(player => ({
          ...player,
          character_data: Array.isArray(player.character_data) 
            ? player.character_data 
            : Array(5).fill(null).map((_, id) => ({ alive: true, id }))
        })) as PlayerData[];
        
        setPlayers(typedPlayersData);
        
        // Set current player and opponent
        const current = typedPlayersData.find(p => p.id === playerId);
        if (current) setCurrentPlayer(current);
        
        const other = typedPlayersData.find(p => p.id !== playerId);
        if (other) setOpponent(other);
        
      } catch (err: any) {
        setError(err.message);
        toast.error('Error loading game data');
      } finally {
        setLoading(false);
      }
    };
    
    loadGameData();
  }, [gameId, playerId, setLoading, setError, setGame, setPlayers, setCurrentPlayer, setOpponent]);
};
