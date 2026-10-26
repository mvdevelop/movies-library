import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchMovieDetails } from "../services/api";
import type { Movie } from "../types";
import { addFavorite, addHistory, getFavorites, removeFavorite } from "../services/auth";
import { useAuth } from "../contexts/AuthContext";

const MovieDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [favorite, setFavorite] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const movieId = Number(id);
    if (!Number.isInteger(movieId) || movieId < 1) {
      setError("Filme inválido");
      return;
    }
    fetchMovieDetails(movieId).then((data) => { setMovie(data); if (user) { getFavorites().then((items) => setFavorite(items.some((item) => item.movieId === movieId))).catch(() => undefined); addHistory(movieId).catch(() => undefined); } }).catch((err) => setError(err instanceof Error ? err.message : "Erro ao carregar filme"));
  }, [id, user]);

  const toggleFavorite = async () => {
    if (!user || !movie) return;
    try {
      if (favorite) await removeFavorite(movie.id); else await addFavorite(movie.id);
      setFavorite((current) => !current);
    } catch (err) { setActionError(err instanceof Error ? err.message : "Não foi possível atualizar sua lista"); }
  };

  if (error) return <main className="page_content"><p role="alert">{error}</p><Link to="/">Voltar</Link></main>;
  if (!movie) return <main className="page_content"><p>Carregando filme...</p></main>;

  return (
    <main className="page_content movie_detail">
      {movie.backdrop_path && <img src={`https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`} alt="" className="movie_backdrop" />}
      <h2>{movie.title}</h2>
      <p>{movie.release_date || "Data não disponível"} · Nota {movie.vote_average.toFixed(1)}</p>
      <p>{movie.overview || "Sinopse não disponível."}</p>
      {user ? <button onClick={toggleFavorite}>{favorite ? "Remover da minha lista" : "Adicionar à minha lista"}</button> : <p><Link to="/login">Entre para salvar este filme</Link></p>}
      {actionError && <p role="alert">{actionError}</p>}
      <Link to="/">Voltar ao catálogo</Link>
    </main>
  );
};

export default MovieDetailsPage;
