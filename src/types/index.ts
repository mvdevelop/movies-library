/**
 * Tipos compartilhados entre componentes do frontend
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
}

export interface MovieApiResponse {
  page: number;
  results: Movie[];
  total_results: number;
  total_pages: number;
}

export interface MovieVideo {
  key: string;
  name: string;
  site: string;
  type: string;
}

export interface MovieCredit {
  id: number;
  name: string;
  character?: string;
  profile_path: string | null;
}

export interface MovieDetails extends Movie {
  runtime?: number;
  genres?: Array<{ id: number; name: string }>;
  credits?: { cast: MovieCredit[] };
  videos?: { results: MovieVideo[] };
  recommendations?: MovieApiResponse;
}

export type MovieType = "popular" | "top_rated" | "upcoming";

export interface SortConfig {
  by: string;
  order: "asc" | "desc";
}

export interface Theme {
  dark: string;
  light: string;
}
