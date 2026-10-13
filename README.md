# 🎬 Movies Library

A modern React + TypeScript application for browsing popular, top-rated, and upcoming movies from The Movie Database (TMDb), with a secure backend proxy, comprehensive testing, and CI/CD pipeline.

## 🔒 Security Status

- ✅ **API Key Protection**: TMDb API key stored server-side via Express proxy
- ✅ **Security Headers**: CSP, HSTS, X-Frame-Options, X-Content-Type-Options via Helmet
- ✅ **Rate Limiting**: 100 requests/15min per IP
- ✅ **Input Validation**: Zod schemas for API responses
- ✅ **Dependency Scanning**: 0 high/critical vulnerabilities
- ✅ **CI/CD Security**: CodeQL SAST, npm audit

## 🚀 Features

- **Browse Movies**: Popular, Top Rated, and Upcoming movies
- **Dark/Light Mode**: Theme toggle with system preference support
- **Filtering**: Filter by minimum rating (6+, 7+, 8+)
- **Sorting**: Sort by release date or rating (ascending/descending)
- **Responsive Design**: Mobile-first responsive layout
- **Performance**: Lazy loading images, optimized builds

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript |
| Bundler | Vite 6 |
| Backend | Node.js + Express |
| Testing | Vitest + React Testing Library |
| Linting | ESLint + Prettier + Security Plugin |
| CI/CD | GitHub Actions + CodeQL |
| Deployment | GitHub Pages (frontend) |

## 📦 Installation

### Prerequisites
- Node.js >= 20
- npm or yarn

### Development Setup

```bash
# Clone the repository
git clone https://github.com/mvdevelop/movies-library.git
cd movies-library

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your TMDb API key to .env

# Start the backend proxy
npm run server:dev

# Start the frontend (in another terminal)
npm run dev

# Run tests
npm run test:run

# Run linter
npm run lint

# Type checking
npm run type-check
```

### Environment Variables

**Frontend (`.env`)**:
```
VITE_TMDB_API_KEY=your_tmdb_api_key_here
```

**Backend (`server/.env`)**:
```
TMDB_API_KEY=your_tmdb_api_key_here
PORT=3001
NODE_ENV=development
```

> 🔐 **Never commit `.env` files to version control**. See `.gitignore`.

## 🏗️ Architecture

```
movies-library/
├── src/
│   ├── App.tsx          # App entry component
│   ├── main.tsx         # ReactDOM entry
│   ├── index.css        # Global styles
│   ├── assets/          # Images, fonts, icons
│   ├── components/      # Reusable UI components
│   │   ├── Navbar/      # Navigation
│   │   ├── DarkMode/    # Theme toggle
│   │   └── MovieList/   # Movie display components
│   ├── hooks/           # Custom React hooks
│   │   └── useMovies.ts # Movie fetching + state
│   ├── services/        # API service layer
│   │   └── api.ts       # TMDb API client
│   ├── types/           # Shared TypeScript interfaces
│   │   └── index.ts     # Movie, API response types
│   └── *.test.tsx       # Unit tests (20 tests, 100% pass)
├── server/              # Backend proxy server
│   ├── src/
│   │   ├── index.ts     # Express server with Helmet, CORS, rate limiting
│   │   └── types/       # Server-side types
│   └── .env.example
├── .github/
│   └── workflows/
│       └── ci.yml       # CI/CD pipeline (lint, test, build, CodeQL)
├── vite.config.ts       # Vite config with security headers
├── tsconfig.json        # TypeScript config
├── vitest.config.ts     # Vitest config
└── .eslintrc.json       # ESLint with security plugins
```

### Data Flow

```
┌─────────────────────────────────────────────────┐
│                  React Frontend                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │ MovieList│    │ useMovies│    │   API    │  │
│  │ Component│───▶│    Hook   │───▶│  Service  │  │
│  └──────────┘    └──────────┘    └──────────┘  │
└──────────────────────┬─────────────────────────┘
                       │
                       │ fetch("/api/movies/...")
                       │
┌──────────────────────┴─────────────────────────┐
│                Express Backend                 │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌── │
│  │ Helmet  │  │ RateLimiter│  │  CORS    │  │  │
│  └─────────┘  └──────────┘  └──────────┘  │  │
│  ┌──────────────────────────────────────┐  │  │
│  │      TMDb Proxy (API Key Hidden)   │  │  │
│  └──────────────────────────────────────┘  │  │
│  ┌──────────────────────────────────────┐  │  │
│  │         TMDb API (api.themoviedb)   │  │  │
│  └──────────────────────────────────────┘  └──│
└─────────────────────────────────────────────────┘
```

## 🧪 Testing

```bash
# Run all tests
npm run test:run

# Run tests in watch mode
npm run test

# Generate coverage report
npm run test:coverage
```

## 🔍 Security Measures

| Concern | Mitigation |
|---------|-----------|
| API Key Exposure | Server-side proxy keeps key hidden |
| XSS | CSP headers, input sanitization |
| CSRF | CORS policy, same-origin requests |
| Rate Limiting | express-rate-limit (100 req/15min) |
| Security Headers | Helmet (CSP, HSTS, X-Frame-Options) |
| Dependency Scanning | npm audit + CodeQL in CI |
| Type Safety | TypeScript + Zod for API validation |

## 🔄 Development Workflow

1. **Start backend**: `npm run server:dev`
2. **Start frontend**: `npm run dev`
3. **Run tests**: `npm run test:run`
4. **Lint**: `npm run lint`
5. **Build**: `npm run build`
6. **Format**: `npm run format`

## 📊 CI/CD Pipeline

The CI pipeline runs on every push to `main`:
- **Lint & Type Check**
- **Unit Tests** (Vitest)
- **Security Scan** (npm audit)
- **CodeQL SAST** (Static Analysis)
- **Build Verification**

See `.github/workflows/ci.yml` for details.

## 📜 Licenses

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/xxx`)
3. Make your changes
4. Run tests: `npm run test:run`
5. Run lint: `npm run lint`
6. Commit and push

## 📞 Contact

- **Author**: Marco V. (MvDevelop)
- **Portfolio**: [github.com/mvdevelop](https://github.com/mvdevelop)
