import { create } from 'zustand';
import { supabase } from '../config/supabase';

export interface RequestSong {
  id: string;
  song_id: string;
  song_title: string;
  artist_name: string;
  cover_image: string;
  play_time: string;
  customer_id: string;
  owner_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

interface RequestSongStore {
  pendingSongs: RequestSong[];
  approvedSongs: RequestSong[];
  currentTrackIndex: number;
  fetchRequestSongs: (ownerId: string, isAdmin: boolean) => Promise<void>;
  subscribeToChanges: (ownerId: string, isAdmin: boolean) => () => void;
  setCurrentTrackIndex: (index: number) => void;
}

export const useRequestSongStore = create<RequestSongStore>((set) => ({
  pendingSongs: [],
  approvedSongs: [],
  currentTrackIndex: 0,
  fetchRequestSongs: async (ownerId) => {
    try {
      const { data, error } = await supabase
        .from('request_song')
        .select('*')
        .eq('owner_id', ownerId)
        .in('status', ['pending', 'approved'])
        .order('updated_at', { ascending: true });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      const songs = data || [];
      const pendingSongs = songs.filter((song: RequestSong) => song.status === 'pending');
      const approvedSongs = songs.filter((song: RequestSong) => song.status === 'approved');

      set({ pendingSongs, approvedSongs });
    } catch (error) {
      console.error('Failed to fetch request songs:', error);
    }
  },

  subscribeToChanges: (ownerId) => {
    const channel = supabase
      .channel('request_songs')
      // INSERT Event
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'request_song',
          filter: `owner_id=eq.${ownerId}`,
        },
        (payload) => {
          const newSong = payload.new as RequestSong;
          console.log('INSERT payload:', newSong);

          set((state) => {
            if (newSong.status === 'pending') {
              return { pendingSongs: [...state.pendingSongs, newSong] };
            } else if (newSong.status === 'approved') {
              return { approvedSongs: [...state.approvedSongs, newSong] };
            }
            return {};
          });
        },
      )
      // UPDATE Event
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'request_song',
          filter: `owner_id=eq.${ownerId}`,
        },
        (payload) => {
          const updatedSong = payload.new as RequestSong;
          console.log('UPDATE payload:', updatedSong);

          set((state) => {
            const updatedPending = state.pendingSongs.filter((song) => song.id !== updatedSong.id);
            const updatedApproved = state.approvedSongs.filter(
              (song) => song.id !== updatedSong.id,
            );

            if (updatedSong.status === 'pending') {
              updatedPending.push(updatedSong);
            } else if (updatedSong.status === 'approved') {
              updatedApproved.push(updatedSong);
            }

            return { pendingSongs: updatedPending, approvedSongs: updatedApproved };
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

    // Unsubscribe when the component unmounts
    return () => {
      console.log('Unsubscribing from changes');
      channel.unsubscribe();
    };
  },

  setCurrentTrackIndex: (index) => {
    set({ currentTrackIndex: index });
  },
}));
