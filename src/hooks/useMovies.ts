import { useState, useEffect, useCallback } from "react";
import type { Movie, MovieType } from "../types";
import { fetchMovies as apiFetchMovies } from "../services/api";

/**
 * Hook personalizado para gerenciamento de filmes
 */
export const useMovies = (type: MovieType) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Carrega filmes na montagem do componente
  const loadMovies = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiFetchMovies(type);
      setMovies(data.results);
      setFilteredMovies(data.results);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erro desconhecido ao carregar filmes"
      );
      console.error("[ERRO] Falha ao carregar filmes:", err);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  useEffect(() => {
    loadMovies();
  }, [loadMovies]);

  // Aplica filtro de rating
  const filterByRating = useCallback(
    (minRating: number): void => {
      if (minRating === 0) {
        setFilteredMovies(movies);
      } else {
        setFilteredMovies(
          movies.filter((movie) => movie.vote_average >= minRating)
        );
      }
    },
    [movies]
  );

  // Aplica ordenação
  const sortBy = useCallback(
    (
      moviesToSort: Movie[],
      sortByField: string,
      order: "asc" | "desc"
    ): Movie[] => {
      return [...moviesToSort].sort((a, b) => {
        const aVal = a[sortByField as keyof Movie];
        const bVal = b[sortByField as keyof Movie];

        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;

        if (typeof aVal === "number" && typeof bVal === "number") {
          return order === "asc" ? aVal - bVal : bVal - aVal;
        }

        if (typeof aVal === "string" && typeof bVal === "string") {
          return order === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }

        return 0;
      });
    },
    []
  );

  return {
    movies,
    filteredMovies,
    isLoading,
    error,
    filterByRating,
    sortBy,
    reload: loadMovies,
  };
};
