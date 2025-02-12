export interface Song {
  id: string;
  coverImage: string;
  songTitle: string;
  artistName: string;
  playTime: string;
}

export interface RequestSongResponse {
  success: boolean;
  message?: string;
  data?: Song;
}
