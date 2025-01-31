import { create } from 'zustand';
import { supabase } from '../config/supabase';

interface RequestSong {
  id: string;
  song_id: string;
  song_title: string;
  artist_name: string;
  cover_image: string;
  play_time: string;
  user_id: string;
  owner_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

interface RequestSongStore {
  requestSongs: RequestSong[];
  fetchRequestSongs: (id: string, isAdmin: boolean) => Promise<void>;
  subscribeToChanges: (id: string, isAdmin: boolean) => () => void;
}

export const useRequestSongStore = create<RequestSongStore>((set) => ({
  requestSongs: [],
  fetchRequestSongs: async (ownerId, isAdmin) => {
    try {
      console.log('Fetching songs for ownerId:', ownerId);

      const statusFilter = isAdmin ? ['pending', 'approved'] : ['approved'];
      const { data, error } = await supabase
        .from('request_song')
        .select('*')
        .eq('owner_id', ownerId)
        .in('status', statusFilter)
        .order('updated_at', { ascending: true });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      set({ requestSongs: data || [] });
    } catch (error) {
      console.error('Failed to fetch request songs:', error);
    }
  },

  subscribeToChanges: (ownerId, isAdmin) => {
    const channel = supabase
      .channel('request_songs')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'request_song',
          filter: `owner_id=eq.${ownerId}`,
        },

        (payload) => {
          if (isAdmin) {
            set((state: RequestSongStore) => {
              console.log('Current state before insert:', state.requestSongs);
              return { requestSongs: [...state.requestSongs, payload.new as RequestSong] };
            });
          }
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'request_song',
          filter: `owner_id=eq.${ownerId}`,
        },
        (payload) => {
          if (isAdmin) {
            set((state: RequestSongStore) => {
              console.log('Current state before update:', state.requestSongs);
              return {
                requestSongs: state.requestSongs.map((song) =>
                  song.id === (payload.new as RequestSong).id
                    ? { ...(payload.new as RequestSong) }
                    : song,
                ),
              };
            });
          } else {
            if (payload.new.status === 'approved') {
              set((state: RequestSongStore) => {
                console.log('Current state before update:', state.requestSongs);
                return {
                  requestSongs: [...state.requestSongs, payload.new as RequestSong],
                };
              });
            }
          }
          if (payload.new.status === 'rejected') {
            set((state: RequestSongStore) => {
              console.log('Current state before update:', state.requestSongs);
              return {
                requestSongs: state.requestSongs.filter(
                  (song) => song.id !== (payload.new as RequestSong).id,
                ),
              };
            });
          }
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'request_song',
          filter: `owner_id=eq.${ownerId}`,
        },
        (payload) => {
          set((state: RequestSongStore) => {
            console.log('Current state before delete:', state.requestSongs);
            return {
              requestSongs: state.requestSongs.filter(
                (song) => song.id !== (payload.new as RequestSong).id,
              ),
            };
          });
        },
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to changes');
        } else {
          console.log('Subscription status changed to:', status);
        }
      });

    return () => {
      console.log('Unsubscribing from changes');
      channel.unsubscribe();
    };
  },
}));
