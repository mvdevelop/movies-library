/**
 * Tipos e interfaces compartilhadas entre o frontend e backend
 */

export interface Movie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  original_language: string;
  popularity: number;
  adult: boolean;
  video: boolean;
}

export interface TmdbApiResponse {
  page: number;
  results: Movie[];
  total_results: number;
  total_pages: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface TmdbGenreResponse {
  genres: Genre[];
}

export type MovieType = "popular" | "top_rated" | "upcoming";
