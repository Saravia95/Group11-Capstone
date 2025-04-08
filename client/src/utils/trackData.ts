let cachedTrackData: any[] | null = null;
// Accurate TrackData interface
export interface TrackData {
  id: string;
  track_id: string;
  key: number;
  tempo: number;
  time_signature: number;
}

async function loadTrackData(): Promise<any[]> {
  if (cachedTrackData) return cachedTrackData;

  const res = await fetch('/trackData.json');
  if (!res.ok) throw new Error('Failed to load track data');

  cachedTrackData = await res.json();
  return cachedTrackData || [];
}

export async function getTrackDataById(trackId: string): Promise<TrackData | null> {
  const data = await loadTrackData();
  const track = await data.find((entry: TrackData) => entry.track_id === trackId);
  console.log(track, 'trackData', data);

  return track || null;
}
