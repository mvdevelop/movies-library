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
