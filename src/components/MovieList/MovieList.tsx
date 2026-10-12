import React, { useEffect } from "react";
import _ from "lodash";

import "./MovieList.css";
import MovieCard from "./MovieCard";
import FilterGroup from "./FilterGroup";
import { useMovies } from "../../hooks/useMovies";
import type { MovieType } from "../../types";

interface MovieListProps {
  type: MovieType;
  title: string;
  emoji: string;
}

const MovieList = ({ type, title, emoji }: MovieListProps) => {
  const {
    filteredMovies,
    isLoading,
    error,
    filterByRating,
    sortBy,
    movies,
  } = useMovies(type);

  const [minRating, setMinRating] = React.useState<number>(0);
  const [sort, setSort] = React.useState<{ by: string; order: "asc" | "desc" }>({
    by: "default",
    order: "asc",
  });

  // Aplica ordenação quando as dependências mudam
  useEffect(() => {
    if (sort.by !== "default") {
      const sortedMovies = _.orderBy(
        filteredMovies,
        [sort.by],
        [sort.order]
      );
      setFilteredMovies(sortedMovies);
    }
  }, [sort, filteredMovies]);

  // Estado local para os filmes filtrados
  const [localFilteredMovies, setLocalFilteredMovies] = React.useState<typeof filteredMovies>(filteredMovies);

  useEffect(() => {
    setLocalFilteredMovies(filteredMovies);
    if (sort.by !== "default") {
      const sortedMovies = _.orderBy(
        filteredMovies,
        [sort.by],
        [sort.order]
      );
      setLocalFilteredMovies(sortedMovies);
    }
  }, [filteredMovies, sort]);

  const handleFilter = (rate: number) => {
    if (rate === minRating) {
      setMinRating(0);
      filterByRating(0);
    } else {
      setMinRating(rate);
      filterByRating(rate);
    }
  };

  const handleSort = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSort((prev) => ({ ...prev, [name]: value } as typeof prev));
  };

  if (isLoading) {
    return (
      <section className="movie_list" id={type}>
        <header className="align_center movie_list_header">
          <h2 className="align_center movie_list_heading">
            {title}{" "}
            <img src={emoji} alt={`${emoji} icon`} className="navbar_emoji" />
          </h2>
        </header>
        <div className="movie_cards loading">
          <p>Carregando filmes...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="movie_list" id={type}>
        <header className="align_center movie_list_header">
          <h2 className="align_center movie_list_heading">
            {title}{" "}
            <img src={emoji} alt={`${emoji} icon`} className="navbar_emoji" />
          </h2>
        </header>
        <div className="movie_cards error">
          <p>Erro ao carregar filmes: {error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="movie_list" id={type}>
      <header className="align_center movie_list_header">
        <h2 className="align_center movie_list_heading">
          {title}{" "}
          <img src={emoji} alt={`${emoji} icon`} className="navbar_emoji" />
        </h2>

        <div className="align_center movie_list_fs">
          <FilterGroup
            minRating={minRating}
            onRatingClick={handleFilter}
            ratings={[8, 7, 6]}
          />

          <select
            name="by"
            onChange={handleSort}
            value={sort.by}
            className="movie_sorting"
            aria-label="Ordenar por"
          >
            <option value="default">SortBy</option>
            <option value="release_date">Date</option>
            <option value="vote_average">Rating</option>
          </select>
          <select
            name="order"
            onChange={handleSort}
            value={sort.order}
            className="movie_sorting"
            aria-label="Ordem de classificação"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </header>

      <div className="movie_cards">
        {localFilteredMovies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </section>
  );
};

export default MovieList;
