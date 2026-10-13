import { renderHook, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useMovies } from "./useMovies";
import { fetchMovies as apiFetchMovies } from "../services/api";

// Mock the API
vi.mock("../services/api");

const mockFetchMovies = vi.mocked(apiFetchMovies);

describe("useMovies Hook", () => {
  const mockMovies = [
    {
      id: 1,
      title: "Test Movie 1",
      original_title: "Test Movie 1",
      overview: "Overview 1",
      poster_path: "/poster1.jpg",
      backdrop_path: "/backdrop1.jpg",
      release_date: "2024-01-01",
      vote_average: 8.5,
      vote_count: 1000,
      genre_ids: [28],
      original_language: "en",
      popularity: 100,
    },
    {
      id: 2,
      title: "Test Movie 2",
      original_title: "Test Movie 2",
      overview: "Overview 2",
      poster_path: "/poster2.jpg",
      backdrop_path: "/backdrop2.jpg",
      release_date: "2024-02-01",
      vote_average: 6.2,
      vote_count: 500,
      genre_ids: [12],
      original_language: "pt",
      popularity: 80,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes with loading state", () => {
    mockFetchMovies.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useMovies("popular"));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.movies).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("fetches movies on mount", async () => {
    mockFetchMovies.mockResolvedValue({
      page: 1,
      results: mockMovies,
      total_results: 2,
      total_pages: 1,
    });

    const { result } = renderHook(() => useMovies("popular"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.movies).toHaveLength(2);
    expect(result.current.movies[0].title).toBe("Test Movie 1");
    expect(mockFetchMovies).toHaveBeenCalledWith("popular");
  });

  it("handles errors during fetch", async () => {
    mockFetchMovies.mockRejectedValue(new Error("API Error"));

    const { result } = renderHook(() => useMovies("popular"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe("API Error");
    expect(result.current.movies).toEqual([]);
  });

  it("sorts movies by rating", async () => {
    mockFetchMovies.mockResolvedValue({
      results: mockMovies,
    });

    const { result } = renderHook(() => useMovies("popular"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const sortedAsc = result.current.sortBy(mockMovies, "vote_average", "asc");
    expect(sortedAsc[0].vote_average).toBe(6.2);
    expect(sortedAsc[1].vote_average).toBe(8.5);

    const sortedDesc = result.current.sortBy(
      mockMovies,
      "vote_average",
      "desc"
    );
    expect(sortedDesc[0].vote_average).toBe(8.5);
    expect(sortedDesc[1].vote_average).toBe(6.2);
  });
});
