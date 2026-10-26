import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchMovieDetails } from "../services/api";
import type { MovieDetails } from "../types";
import { addFavorite, addHistory, getFavorites, removeFavorite } from "../services/auth";
import { useAuth } from "../contexts/AuthContext";

const MovieDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
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
      {movie.genres && <p>{movie.genres.map((genre) => genre.name).join(" · ")}</p>}
      {movie.runtime && <p>{movie.runtime} minutos</p>}
      {movie.videos?.results.find((video) => video.site === "YouTube" && video.type === "Trailer") && <a href={`https://www.youtube.com/watch?v=${movie.videos.results.find((video) => video.site === "YouTube" && video.type === "Trailer")?.key}`} target="_blank" rel="noreferrer">Assistir trailer</a>}
      {user ? <button onClick={toggleFavorite}>{favorite ? "Remover da minha lista" : "Adicionar à minha lista"}</button> : <p><Link to="/login">Entre para salvar este filme</Link></p>}
      {movie.credits?.cast?.length ? <section><h3>Elenco</h3><ul>{movie.credits.cast.slice(0, 8).map((person) => <li key={person.id}>{person.name}{person.character ? ` — ${person.character}` : ""}</li>)}</ul></section> : null}
      {movie.recommendations?.results?.length ? <section><h3>Recomendações</h3><div className="movie_cards">{movie.recommendations.results.slice(0, 6).map((recommendation) => <Link key={recommendation.id} to={`/movies/${recommendation.id}`} className="movie_card"><span>{recommendation.title}</span></Link>)}</div></section> : null}
      {actionError && <p role="alert">{actionError}</p>}
      <Link to="/">Voltar ao catálogo</Link>
    </main>
  );
};

export default MovieDetailsPage;
