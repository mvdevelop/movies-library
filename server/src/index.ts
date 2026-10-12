import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";

// Carrega variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

// Middlewares
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://mvdevelop.github.io"]
        : ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());

// Headers de segurança básicos
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

// Rotas da API TMDb
app.get("/api/movies/:type", async (req: Request, res: Response) => {
  try {
    const { type } = req.params;

    // Validação do tipo de lista de filmes
    const validTypes = ["popular", "top_rated", "upcoming"];
    if (!validTypes.includes(type)) {
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

    const data = await response.json();

    // Remove campos que não devem expor diretamente ao cliente
    const sanitizedResults = data.results.map((movie: any) => ({
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
