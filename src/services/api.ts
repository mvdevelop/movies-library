import type { Movie, MovieApiResponse, MovieDetails, MovieType } from "../types";

/**
 * Serviço para consumo da API de filmes via proxy backend
 */

declare global {
  interface ImportMetaEnv {
    DEV: boolean;
    PROD: boolean;
    MODE: string;
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

const API_BASE_URL =
  typeof import.meta !== "undefined" && import.meta.env?.DEV
    ? "http://localhost:3001/api"
    : "/api";

/**
 * Busca filmes de uma categoria específica
 */
const fetchApi = async <T>(path: string): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`);
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || `Erro na API: ${response.status}`);
  return data as T;
};

export const fetchMovies = async (
  type: MovieType
): Promise<MovieApiResponse> => {
  return fetchApi<MovieApiResponse>(`/movies/${type}`);
};

export const searchMovies = async (
  query: string,
  page = 1
): Promise<MovieApiResponse> => {
  return fetchApi<MovieApiResponse>(
    `/movies/search?query=${encodeURIComponent(query)}&page=${page}`
  );
};

export const fetchMovieDetails = async (id: number): Promise<MovieDetails> => {
  return fetchApi<Movie>(`/movies/${id}`);
};

