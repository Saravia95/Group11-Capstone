import axiosInstance from '../config/axiosInstance';
import { useAuthStore } from '../stores/authStore';

export interface Song {
  id: string;
  coverImage: string;
  songTitle: string;
  artistName: string;
  playTime: string;
}

export const searchSong = async (filter: string, searchTerm: string): Promise<Song[]> => {
  try {
    const { data } = await axiosInstance.get(
      `/song/search?filter=${filter}&searchTerm=${searchTerm}`,
    );

    if (!data.success) {
      console.error('fail to search songs:', data.message);
      return [];
    }

    return data.data;
  } catch (error) {
    console.error('fail to search songs:', error);
    return [];
  }
};

export const requestSong = async (song: Song) => {
  try {
    const { user } = useAuthStore.getState();
    const { data } = await axiosInstance.post('/song/request', {
      song,
      userId: user?.id,
      ownerId: user?.assignedOwner,
    });
    return data;
  } catch (error) {
    console.error('fail to request song:', error);
    throw error;
  }
};

export const reviewSong = async (id: string, approved: boolean) => {
  try {
    const { data } = await axiosInstance.post(`/song/review/${id}`, { approved });
    return data;
  } catch (error) {
    console.error('fail to approve song:', error);
    throw error;
  }
};
