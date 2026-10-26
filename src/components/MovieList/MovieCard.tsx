import "./MovieCard.css";
import Star from "../../assets/star-gif.gif";
import { Link, useInRouterContext } from "react-router-dom";
import type { Movie } from "../../types";

interface MovieCardProps {
  movie: Movie;
}

const MovieCard = ({ movie }: MovieCardProps) => {
  const cardContent = (
    <>
      {movie.poster_path && (
        <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={`Poster de ${movie.title}`} className="movie_poster" loading="lazy" />
      )}
      <div className="movie_details">
        <h3 className="movie_details_heading">{movie.title}</h3>
        <div className="align_center movie_date_rate">
          <p>{movie.release_date || "Data não disponível"}</p>
          <p className="align_center">{movie.vote_average.toFixed(1)}<img src={Star} alt="Rating icon" className="card_emoji" /></p>
        </div>
        <p className="movie_description">{movie.overview.slice(0, 100)}...</p>
      </div>
    </>
  );

  return useInRouterContext() ? (
    <Link to={`/movies/${movie.id}`} className="movie_card">{cardContent}</Link>
  ) : (
    <a href={`https://www.themoviedb.org/movie/${movie.id}`} target="_blank" rel="noopener noreferrer" className="movie_card">{cardContent}</a>
  );
};

export default MovieCard;
