import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { fetchMovieDetails } from "../services/api";
import { getHistory } from "../services/auth";
import { useAuth } from "../contexts/AuthContext";
import type { Movie } from "../types";

const HistoryPage = () => {
  const { user } = useAuth();
  const [movies, setMovies] = useState<Movie[]>([]);
  useEffect(() => { if (user) getHistory().then((items) => Promise.all(items.slice(-12).reverse().map((item) => fetchMovieDetails(item.movieId)))).then(setMovies).catch(() => setMovies([])); }, [user]);
  if (!user) return <Navigate to="/login" replace state={{ from: "/history" }} />;
  return <main className="page_content"><h2>Continuar assistindo</h2>{movies.length ? <div className="movie_cards">{movies.map((movie) => <Link key={movie.id} to={`/movies/${movie.id}`} className="movie_card">{movie.poster_path && <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={`Poster de ${movie.title}`} className="movie_poster" />}<div className="movie_details"><h3>{movie.title}</h3><p>Assistido recentemente</p></div></Link>)}</div> : <p>Seu histórico aparecerá aqui quando você abrir um filme.</p>}</main>;
};
export default HistoryPage;
