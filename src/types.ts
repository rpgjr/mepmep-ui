export type MediaType = "movie" | "tv";

/** A card in a grid or row. Works for both TMDB results and saved items. */
export interface Card {
  mediaType: MediaType;
  id: number;
  title: string;
  posterPath: string | null;
  voteAverage?: number | null;
  year?: string | null;
}

export interface Genre { id: number; name: string }

export interface Cast { id: number; name: string; character: string; profile_path: string | null }

export interface TitleDetail {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  tagline?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  runtime?: number;
  episode_run_time?: number[];
  number_of_seasons?: number;
  genres: Genre[];
  seasons?: { season_number: number; name: string; episode_count: number }[];
  credits?: { cast: Cast[] };
  similar?: { results: Record<string, any>[] };
}

export interface Episode {
  episode_number: number;
  name: string;
  overview: string;
  still_path: string | null;
  runtime: number | null;
  air_date: string | null;
}

export interface User { id: number; email: string; displayName: string }

export interface Progress {
  mediaType: MediaType;
  tmdbId: number;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  season: number;
  episode: number;
  positionSec: number;
  durationSec: number;
}

export interface SavedTitle {
  mediaType: MediaType;
  tmdbId: number;
  title: string;
  posterPath: string | null;
  voteAverage: number | null;
  releaseYear: string | null;
}
