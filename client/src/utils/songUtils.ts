import axiosInstance from '../config/axiosInstance';

export interface Song {
  id: string;
  coverImage: string;
  songTitle: string;
  artistName: string;
  playTime: string;
}

export const searchSong = async (
  filter: string, 
  searchTerm: string
): Promise<Song[]> => {
  try {
    const { data } = await axiosInstance.get(
      `/song/search?filter=${filter}&searchTerm=${searchTerm}`
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