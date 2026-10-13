import type { MovieApiResponse, MovieType } from "../types";

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
export const fetchMovies = async (
  type: MovieType
): Promise<MovieApiResponse> => {
  const response = await fetch(`${API_BASE_URL}/movies/${type}`);

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(
      error?.message || `Erro ao buscar filmes: ${response.status}`
    );
  }

  const data: MovieApiResponse = await response.json();
  return data;
};
