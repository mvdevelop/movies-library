import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { searchMovies } from "../services/api";
import type { Movie } from "../types";

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await searchMovies(query.trim());
      setMovies(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar filmes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page_content">
      <h2>Buscar filmes</h2>
      <form onSubmit={handleSubmit} className="search_form">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Digite um título" aria-label="Buscar filmes" />
        <button type="submit">Buscar</button>
      </form>
      {loading && <p>Buscando...</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && !error && query && movies.length === 0 && <p>Nenhum filme encontrado.</p>}
      <div className="movie_cards">
        {movies.map((movie) => (
          <Link key={movie.id} to={`/movies/${movie.id}`} className="movie_card">
            {movie.poster_path && <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={`Poster de ${movie.title}`} className="movie_poster" loading="lazy" />}
            <div className="movie_details"><h3>{movie.title}</h3><p>{movie.release_date || "Data não disponível"}</p></div>
          </Link>
        ))}
      </div>
    </main>
  );
};

export default SearchPage;
