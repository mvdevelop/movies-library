import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import MovieCard from "./MovieCard";
import type { Movie } from "../../types";

const mockMovie: Movie = {
  id: 1,
  title: "Test Movie",
  original_title: "Test Movie",
  overview:
    "A test movie overview that is longer than 100 characters to test the slicing functionality of the movie card component rendering.",
  poster_path: "/test-poster.jpg",
  backdrop_path: "/test-backdrop.jpg",
  release_date: "2024-01-01",
  vote_average: 8.5,
  vote_count: 1000,
  genre_ids: [28, 12],
  original_language: "en",
  popularity: 100,
};

describe("MovieCard Component", () => {
  it("renders movie title", () => {
    render(<MovieCard movie={mockMovie} />);
    expect(screen.getByText("Test Movie")).toBeInTheDocument();
  });

  it("renders movie release date", () => {
    render(<MovieCard movie={mockMovie} />);
    expect(screen.getByText("2024-01-01")).toBeInTheDocument();
  });

  it("renders movie rating", () => {
    render(<MovieCard movie={mockMovie} />);
    expect(screen.getByText("8.5")).toBeInTheDocument();
  });

  it("renders movie overview with truncated text", () => {
    render(<MovieCard movie={mockMovie} />);
    const overviewText = mockMovie.overview.slice(0, 100) + "...";
    expect(screen.getByText(overviewText)).toBeInTheDocument();
  });

  it("links to TMDb page with correct URL", () => {
    render(<MovieCard movie={mockMovie} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://www.themoviedb.org/movie/1");
  });

  it("renders poster image with correct src when poster_path exists", () => {
    render(<MovieCard movie={mockMovie} />);
    const img = screen.getByAltText("Poster de Test Movie");
    expect(img).toHaveAttribute(
      "src",
      "https://image.tmdb.org/t/p/w500/test-poster.jpg"
    );
  });

  it("handles null poster_path gracefully", () => {
    const movieNoPoster = { ...mockMovie, poster_path: null };
    render(<MovieCard movie={movieNoPoster} />);
    const posterImg = screen.queryByAltText("Poster de Test Movie");
    expect(posterImg).not.toBeInTheDocument();
  });
});
