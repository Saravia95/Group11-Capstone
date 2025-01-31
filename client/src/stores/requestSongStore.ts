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
  setRequestSongs: (songs: RequestSong[]) => void;
  addRequestSong: (song: RequestSong) => void;
  updateRequestSong: (id: string, status: 'pending' | 'approved' | 'rejected') => void;
  fetchRequestSongs: (ownerId: string) => Promise<void>;
  subscribeToChanges: (ownerId: string) => () => void;
  unsubscribeFromChanges: (() => void) | null;
}

export const useRequestSongStore = create<RequestSongStore>((set) => ({
  requestSongs: [],
  setRequestSongs: (songs) => set({ requestSongs: songs }),
  addRequestSong: (song) => set((state) => ({ requestSongs: [...state.requestSongs, song] })),
  updateRequestSong: (id, status) =>
    set((state) => ({
      requestSongs: state.requestSongs.map((song) => (song.id === id ? { ...song, status } : song)),
    })),
  fetchRequestSongs: async (ownerId) => {
    try {
      console.log('Fetching songs for ownerId:', ownerId);

      const { data, error } = await supabase
        .from('request_song')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      set({ requestSongs: data || [] });
    } catch (error) {
      console.error('Failed to fetch request songs:', error);
    }
  },

  subscribeToChanges: (ownerId) => {
    console.log('Subscribing to changes for ownerId:', ownerId);

    const channel = supabase
      .channel('request_songs')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'request_song',
          filter: `owner_id=eq.${ownerId}`,
        },

        (payload) => {
          console.log('Received realtime payload:', payload);
          console.log('Payload type:', payload.eventType);
          console.log('Payload new data:', payload.new);

          if (payload.eventType === 'INSERT') {
            console.log('Inserting new song:', payload.new);
            set((state: RequestSongStore) => {
              console.log('Current state before insert:', state.requestSongs);
              return { requestSongs: [...state.requestSongs, payload.new as RequestSong] };
            });
          } else if (payload.eventType === 'UPDATE') {
            console.log('Updating song:', payload.new);
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
          }
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
  unsubscribeFromChanges: null,
}));
