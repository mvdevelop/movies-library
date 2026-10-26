import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { fetchMovieDetails } from "../services/api";
import { getFavorites, removeFavorite } from "../services/auth";
import { useAuth } from "../contexts/AuthContext";
import type { Movie } from "../types";

const MyListPage = () => {
  const { user } = useAuth();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!user) return;
    getFavorites().then((favorites) => Promise.all(favorites.map(({ movieId }) => fetchMovieDetails(movieId)))).then(setMovies).catch(() => setError("Não foi possível carregar sua lista")).finally(() => setLoading(false));
  }, [user]);
  if (!user) return <Navigate to="/login" replace state={{ from: "/my-list" }} />;
  return <main className="page_content"><h2>Minha lista</h2>{loading && <p>Carregando...</p>}{error && <p role="alert">{error}</p>}{!loading && !error && movies.length === 0 && <p>Você ainda não adicionou filmes.</p>}<div className="movie_cards">{movies.map((movie) => <div key={movie.id}><Link to={`/movies/${movie.id}`} className="movie_card">{movie.poster_path && <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={`Poster de ${movie.title}`} className="movie_poster" />}<div className="movie_details"><h3>{movie.title}</h3></div></Link><button onClick={() => { removeFavorite(movie.id).then(() => setMovies((current) => current.filter(({ id }) => id !== movie.id))); }}>Remover</button></div>)}</div></main>;
};
export default MyListPage;
