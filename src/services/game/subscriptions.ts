
import { supabase } from '@/integrations/supabase/client';

// Subscribe to game changes
export const subscribeToGame = (gameId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`game:${gameId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'games',
      filter: `id=eq.${gameId}`
    }, callback)
    .subscribe();
};

// Subscribe to player changes
export const subscribeToPlayers = (gameId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`players:${gameId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'players',
      filter: `game_id=eq.${gameId}`
    }, callback)
    .subscribe();
};
