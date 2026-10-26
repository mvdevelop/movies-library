const API_BASE_URL = import.meta.env.DEV ? "http://localhost:3001/api" : "/api";

export interface User { id: string; name: string; email: string; }
const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const token = localStorage.getItem("movies_token");
  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(init?.headers || {}) } });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || "Erro de autenticação");
  return data as T;
};
export const register = (name: string, email: string, password: string) => request<{ user: User }>("/auth/register", { method: "POST", body: JSON.stringify({ name, email, password }) });
export const login = (email: string, password: string) => request<{ token: string; user: User }>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
export const currentUser = () => request<{ user: User }>("/auth/me");
export const logout = () => request<void>("/auth/logout", { method: "POST" });
export const getFavorites = () => request<Array<{ movieId: number }>>("/me/favorites");
export const addFavorite = (movieId: number) => request("/me/favorites", { method: "POST", body: JSON.stringify({ movieId }) });
export const removeFavorite = (movieId: number) => request(`/me/favorites/${movieId}`, { method: "DELETE" });
export const getHistory = () => request<Array<{ movieId: number }>>("/me/history");
export const addHistory = (movieId: number) => request("/me/history", { method: "POST", body: JSON.stringify({ movieId }) });
