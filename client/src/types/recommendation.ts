export interface RecommendationParams {
  // Seed parameters (at least one required, max 5 total across all)
  seed_artists?: string; // Comma-separated list of Spotify artist IDs, e.g., "artistId1,artistId2"
  seed_genres?: string; // Comma-separated list of genre names, e.g., "pop,rock"
  seed_tracks?: string; // Comma-separated list of Spotify track IDs, e.g., "trackId1,trackId2"

  // General parameters
  limit?: number; // Number of tracks to return (1–100)
  market?: string; // ISO 3166-1 alpha-2 country code, e.g., "US"

  // Tunable audio features (all optional, with min_, max_, target_ prefixes)
  min_danceability?: number; // 0.0–1.0
  max_danceability?: number; // 0.0–1.0
  target_danceability?: number; // 0.0–1.0

  min_energy?: number; // 0.0–1.0
  max_energy?: number; // 0.0–1.0
  target_energy?: number; // 0.0–1.0

  min_key?: number; // 0–11 (integer representing musical key: 0 = C, 1 = C#, etc.)
  max_key?: number; // 0–11
  target_key?: number; // 0–11

  min_loudness?: number; // Typically -60 to 0 (decibels)
  max_loudness?: number; // Typically -60 to 0
  target_loudness?: number; // Typically -60 to 0

  min_mode?: number; // 0 (minor) or 1 (major)
  max_mode?: number; // 0 or 1
  target_mode?: number; // 0 or 1

  min_speechiness?: number; // 0.0–1.0
  max_speechiness?: number; // 0.0–1.0
  target_speechiness?: number; // 0.0–1.0

  min_acousticness?: number; // 0.0–1.0
  max_acousticness?: number; // 0.0–1.0
  target_acousticness?: number; // 0.0–1.0

  min_instrumentalness?: number; // 0.0–1.0
  max_instrumentalness?: number; // 0.0–1.0
  target_instrumentalness?: number; // 0.0–1.0

  min_liveness?: number; // 0.0–1.0
  max_liveness?: number; // 0.0–1.0
  target_liveness?: number; // 0.0–1.0

  min_valence?: number; // 0.0–1.0 (musical positiveness)
  max_valence?: number; // 0.0–1.0
  target_valence?: number; // 0.0–1.0

  min_tempo?: number; // Typically 0–250 (beats per minute)
  max_tempo?: number; // Typically 0–250
  target_tempo?: number; // Typically 0–250
}
