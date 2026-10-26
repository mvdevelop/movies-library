import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";

// Carrega variáveis de ambiente
dotenv.config();

const app = express();
const MOCK_API_URL = process.env.MOCK_API_URL || "http://localhost:3002";
const sessions = new Map<string, { userId: string; expiresAt: number }>();

type MockUser = { id: string; name: string; email: string; passwordHash: string };
const mockRequest = async (path: string, init?: RequestInit) => fetch(`${MOCK_API_URL}${path}`, {
  ...init,
  headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
});
const publicUser = ({ passwordHash: _passwordHash, ...user }: MockUser) => user; // Nunca devolve o hash.
const getSessionUser = async (req: Request) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  const session = token ? sessions.get(token) : undefined;
  if (!session || session.expiresAt < Date.now()) return null;
  const response = await mockRequest(`/users/${session.userId}`);
  return response.ok ? (await response.json() as MockUser) : null;
};
const requireUser = async (req: Request, res: Response) => {
  const user = await getSessionUser(req);
  if (!user) { res.status(401).json({ error: "Autenticação necessária" }); return null; }
  return user;
};

app.post("/api/auth/register", async (req: Request, res: Response) => {
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8) return res.status(400).json({ error: "Nome, email e senha válidos são obrigatórios" });
  const existing = await mockRequest(`/users?email=${encodeURIComponent(email)}`);
  if ((await existing.json()).length) return res.status(409).json({ error: "Não foi possível criar a conta" });
  const user: MockUser = { id: crypto.randomUUID(), name, email, passwordHash: await bcrypt.hash(password, 12) };
  const created = await mockRequest("/users", { method: "POST", body: JSON.stringify(user) });
  if (!created.ok) return res.status(502).json({ error: "Persistência indisponível" });
  return res.status(201).json({ user: publicUser(user) });
});

app.post("/api/auth/login", async (req: Request, res: Response) => {
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  const response = await mockRequest(`/users?email=${encodeURIComponent(email)}`);
  const users = response.ok ? await response.json() as MockUser[] : [];
  const user = users[0];
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ error: "Email ou senha inválidos" });
  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, { userId: user.id, expiresAt: Date.now() + 86_400_000 });
  return res.json({ token, user: publicUser(user) });
});

app.post("/api/auth/logout", async (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token) sessions.delete(token);
  return res.status(204).send();
});

app.get("/api/auth/me", async (req: Request, res: Response) => {
  const user = await getSessionUser(req);
  return user ? res.json({ user: publicUser(user) }) : res.status(401).json({ error: "Sessão inválida" });
});

app.get("/api/me/favorites", async (req: Request, res: Response) => {
  const user = await requireUser(req, res); if (!user) return;
  const response = await mockRequest(`/favorites?userId=${user.id}`); return res.json(await response.json());
});

app.post("/api/me/favorites", async (req: Request, res: Response) => {
  const user = await requireUser(req, res); if (!user) return;
  const movieId = Number(req.body?.movieId); if (!Number.isInteger(movieId) || movieId < 1) return res.status(400).json({ error: "Filme inválido" });
  const existing = await mockRequest(`/favorites?userId=${user.id}&movieId=${movieId}`);
  const existingFavorites = await existing.json() as unknown[];
  if (existingFavorites.length) return res.status(200).json(existingFavorites[0]);
  const response = await mockRequest("/favorites", { method: "POST", body: JSON.stringify({ id: crypto.randomUUID(), userId: user.id, movieId, addedAt: new Date().toISOString() }) });
  return res.status(201).json(await response.json());
});

app.delete("/api/me/favorites/:movieId", async (req: Request, res: Response) => {
  const user = await requireUser(req, res); if (!user) return;
  const response = await mockRequest(`/favorites?userId=${user.id}&movieId=${Number(req.params.movieId)}`); const favorites = await response.json() as Array<{ id: string }>;
  await Promise.all(favorites.map((favorite) => mockRequest(`/favorites/${favorite.id}`, { method: "DELETE" }))); return res.status(204).send();
});

app.get("/api/me/history", async (req: Request, res: Response) => {
  const user = await requireUser(req, res); if (!user) return;
  const response = await mockRequest(`/watchHistory?userId=${user.id}`); return res.json(await response.json());
});

app.post("/api/me/history", async (req: Request, res: Response) => {
  const user = await requireUser(req, res); if (!user) return;
  const movieId = Number(req.body?.movieId); if (!Number.isInteger(movieId) || movieId < 1) return res.status(400).json({ error: "Filme inválido" });
  const response = await mockRequest("/watchHistory", { method: "POST", body: JSON.stringify({ id: crypto.randomUUID(), userId: user.id, movieId, watchedAt: new Date().toISOString() }) }); return res.status(201).json(await response.json());
});
const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

// Middlewares de segurança
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://mvdevelop.github.io"]
        : ["http://localhost:5173"],
    credentials: true,
  })
);

// Helmet para headers de segurança
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "https:", "data:", "blob:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", "https:", "data:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

app.use(express.json());

// Rate limiting: 100 requests por 15 minutos por IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: {
    error: "Muitas requisições. Por favor, tente novamente mais tarde.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/", limiter);

// Rotas da API TMDb
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const fetchTmdb = async (path: string, init?: RequestInit) => {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) throw new Error("TMDB_API_KEY não configurada");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  try {
    const separator = path.includes("?") ? "&" : "?";
    return await fetch(`${TMDB_BASE_URL}${path}${separator}api_key=${encodeURIComponent(apiKey)}&language=pt-BR`, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
};

app.get("/api/movies/search", async (req: Request, res: Response) => {
  const query = typeof req.query.query === "string" ? req.query.query.trim() : "";
  const page = typeof req.query.page === "string" ? Number(req.query.page) : 1;
  if (!query || !Number.isInteger(page) || page < 1 || page > 500) {
    return res.status(400).json({ error: "Informe uma busca e uma página válida" });
  }
  try {
    const response = await fetchTmdb(`/search/movie?query=${encodeURIComponent(query)}&page=${page}`);
    const data = await response.json().catch(() => null);
    if (!response.ok) return res.status(response.status).json({ error: "Erro na API TMDb" });
    return res.json(data);
  } catch {
    return res.status(502).json({ error: "Não foi possível consultar o catálogo" });
  }
});

app.get("/api/movies/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: "ID de filme inválido" });
  try {
    const response = await fetchTmdb(`/movie/${id}?append_to_response=credits,videos,recommendations`);
    const data = await response.json().catch(() => null);
    if (!response.ok) return res.status(response.status).json({ error: "Filme não encontrado" });
    return res.json(data);
  } catch {
    return res.status(502).json({ error: "Não foi possível consultar o catálogo" });
  }
});

app.get("/api/movies/:type", async (req: Request, res: Response) => {
  try {
    const type = req.params.type as string;

    // Validação do tipo de lista de filmes
    const validTypes = ["popular", "top_rated", "upcoming"] as const;
    if (!validTypes.includes(type as (typeof validTypes)[number])) {
      return res.status(400).json({ error: "Tipo de filme inválido" });
    }

    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      console.error("[ERRO] TMDB_API_KEY não configurada");
      return res.status(500).json({ error: "Configuração do servidor incompleta" });
    }

    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${type}?api_key=${apiKey}&language=pt-BR`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error(`[ERRO TMDb] ${response.status}:`, errorData);
      return res.status(response.status).json(errorData || { error: "Erro na API TMDb" });
    }

    const data = (await response.json()) as {
      page: number;
      results: Array<Record<string, unknown>>;
      total_results: number;
      total_pages: number;
    };

    // Remove campos que não devem expor diretamente ao cliente
    const sanitizedResults = data.results.map((movie: Record<string, unknown>) => ({
      id: movie.id,
      title: movie.title,
      original_title: movie.original_title,
      overview: movie.overview,
      poster_path: movie.poster_path,
      backdrop_path: movie.backdrop_path,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      vote_count: movie.vote_count,
      genre_ids: movie.genre_ids,
      original_language: movie.original_language,
      popularity: movie.popularity,
    }));

    res.json({
      page: data.page,
      results: sanitizedResults,
      total_results: data.total_results,
      total_pages: data.total_pages,
    });
  } catch (error) {
    console.error("[ERRO] Erro interno do servidor:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Health check
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`[SERVIDOR] Proxy TMDb rodando na porta ${PORT}`);
  console.log(`[AMBIENTE] NODE_ENV=${process.env.NODE_ENV || "development"}`);
});
