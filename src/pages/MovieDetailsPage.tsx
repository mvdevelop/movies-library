import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchMovieDetails } from "../services/api";
import type { Movie } from "../types";

const MovieDetailsPage = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const movieId = Number(id);
    if (!Number.isInteger(movieId) || movieId < 1) {
      setError("Filme inválido");
      return;
    }
    fetchMovieDetails(movieId).then(setMovie).catch((err) => setError(err instanceof Error ? err.message : "Erro ao carregar filme"));
  }, [id]);

  if (error) return <main className="page_content"><p role="alert">{error}</p><Link to="/">Voltar</Link></main>;
  if (!movie) return <main className="page_content"><p>Carregando filme...</p></main>;

  return (
    <main className="page_content movie_detail">
      {movie.backdrop_path && <img src={`https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`} alt="" className="movie_backdrop" />}
      <h2>{movie.title}</h2>
      <p>{movie.release_date || "Data não disponível"} · Nota {movie.vote_average.toFixed(1)}</p>
      <p>{movie.overview || "Sinopse não disponível."}</p>
      <Link to="/">Voltar ao catálogo</Link>
    </main>
  );
};

export default MovieDetailsPage;
