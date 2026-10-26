import "./App.css";
import Fire from "./assets/fire-gif.gif";
import Star from "./assets/star-gif.gif";
import Party from "./assets/happy-gif.gif";
import Navbar from "./components/Navbar/Navbar";
import MovieList from "./components/MovieList/MovieList";
import SearchPage from "./pages/SearchPage";
import MovieDetailsPage from "./pages/MovieDetailsPage";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";

const HomePage = () => (
  <>
    <MovieList type="popular" title="Popular" emoji={Fire} />
    <MovieList type="top_rated" title="Top Rated" emoji={Star} />
    <MovieList type="upcoming" title="Upcoming" emoji={Party} />
  </>
);

const App = () => (
  <BrowserRouter>
    <div className="app">
      <Navbar />
      <nav className="app_navigation"><Link to="/">Início</Link><Link to="/search">Buscar</Link></nav>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/movies/:id" element={<MovieDetailsPage />} />
        <Route path="*" element={<main className="page_content"><h2>Página não encontrada</h2><Link to="/">Voltar ao início</Link></main>} />
      </Routes>
    </div>
  </BrowserRouter>
);

export default App;
