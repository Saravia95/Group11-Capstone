import { create } from 'zustand';
import { supabase } from '../config/supabase';
import { setPlaying } from '../utils/songUtils';

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
  is_playing: boolean;
  created_at: string;
}

interface RequestSongStore {
  pendingSongs: RequestSong[];
  approvedSongs: RequestSong[];
  rejectedSongs: RequestSong[];

  fetchRequestSongs: (ownerId: string) => Promise<void>;
  subscribeToChanges: (ownerId: string) => () => void;
}

export const useRequestSongStore = create<RequestSongStore>((set) => ({
  pendingSongs: [],
  approvedSongs: [],
  rejectedSongs: [],

  fetchRequestSongs: async (ownerId) => {
    try {
      const { data, error } = await supabase
        .from('request_songs')
        .select('*')
        .eq('owner_id', ownerId)
        .in('status', ['pending', 'approved', 'rejected'])
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      const songs = data || [];
      const pendingSongs = songs.filter((song: RequestSong) => song.status === 'pending');
      const approvedSongs = songs.filter((song: RequestSong) => song.status === 'approved');
      const rejectedSongs = songs.filter((song: RequestSong) => song.status === 'rejected');

      if (!approvedSongs.find((song) => song.is_playing)) {
        setPlaying(approvedSongs[0].id);
      }

      set({ pendingSongs, approvedSongs, rejectedSongs });
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
          table: 'request_songs',
          filter: `owner_id=eq.${ownerId}`,
        },
        (payload) => {
          const newSong = payload.new as RequestSong;
          //console.log('INSERT payload:', newSong);

          set((state) => {
            if (newSong.status === 'pending') {
              return { pendingSongs: [...state.pendingSongs, newSong] };
            } else if (newSong.status === 'approved') {
              return { approvedSongs: [...state.approvedSongs, newSong] };
            } else if (newSong.status === 'rejected') {
              return { rejectedSongs: [...state.rejectedSongs, newSong] };
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
          table: 'request_songs',
          filter: `owner_id=eq.${ownerId}`,
        },
        (payload) => {
          if (payload.old.status === payload.new.status) {
            return;
          }

          const updatedSong = payload.new as RequestSong;
          // console.log('UPDATE payload:', updatedSong);

          set((state) => {
            const updatedPending = state.pendingSongs.filter((song) => song.id !== updatedSong.id);
            const updatedApproved = state.approvedSongs.filter(
              (song) => song.id !== updatedSong.id,
            );
            const updatedRejected = state.rejectedSongs.filter(
              (song) => song.id !== updatedSong.id,
            );

            if (updatedSong.status === 'pending') {
              updatedPending.push(updatedSong);
            } else if (updatedSong.status === 'approved') {
              updatedApproved.push(updatedSong);
            } else if (updatedSong.status === 'rejected') {
              updatedRejected.push(updatedSong);
            }

            return {
              pendingSongs: updatedPending,
              approvedSongs: updatedApproved,
              rejectedSongs: updatedRejected,
            };
          });
        },
      )
      // DELETE Event
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'request_songs',
        },
        (payload) => {
          const deletedSongId = payload.old.id;
          //console.log('DELETE payload:', payload, deletedSongId);

          set((state) => ({
            rejectedSongs: state.rejectedSongs.filter((song) => song.id !== deletedSongId),
          }));
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
}));
