# 📋 PROJECT REVIEW — Movies Library

> **Status**: Aguardando validação do resumo executivo
> **Data**: 2026-10-11
> **Autor**: Claude Code (Security Champion)
> **Objetivo**: Transformar este projeto em peça de portfólio de nível pleno/sênior com foco em segurança, arquitetura e qualidade de código.

---

## 📊 INVENTÁRIO TÉCNICO

### Stack Atual
| Camada       | Tecnologia     | Versão  | Observação                          |
|--------------|----------------|---------|-------------------------------------|
| Framework    | React          | 18.3.1  | SPA pura, sem React Router          |
| Bundler      | Vite           | 6.3.5   | —                                   |
| Linter       | ESLint         | 8.38.0  | Sem plugin de segurança             |
| Deploy       | GitHub Pages   | —       | `gh-pages` no package.json          |
| API Externa  | TMDb (REST)    | v3      | Key exposta no código-fonte ❌      |

### Estrutura Atual
```
movies-library/
├── src/
│   ├── App.jsx          # Orquestrador — sem rotas
│   ├── main.jsx         # Entry point (Strict Mode)
│   ├── App.css / index.css
│   ├── assets/          # SVGs, GIFs, PNG, WOFF2
│   ├── components/
│   │   ├── Navbar/      # Anchor links, DarkMode toggle
│   │   ├── DarkMode/    # localStorage theme
│   │   └── MovieList/   # MovieList, MovieCard, FilterGroup
│   └── (ausente: pages, routes, services, hooks, store, tests)
├── index.html
├── vite.config.js
├── package.json
└── .gitignore
```

### Pontos de Entrada
- **Entrada única**: `src/main.jsx` → `App.jsx`
- **Navegação**: anchor links (`#popular`, etc.) — README menciona React Router mas **não está instalado**
- **Dados**: `fetch` direto no componente `MovieList.jsx` → TMDb

### Testes
❌ **Zero testes.** Nenhum framework instalado. `npm run lint` existe mas não faz parte do CI.

### CI/CD
❌ **Zero automação.** Apenas scripts manuais.

### Dependências
- **Produção**: `react`, `react-dom`, `lodash`, `vercel` ❌ (CLI não deveria ser runtime dep)
- **Dev**: `@vitejs/plugin-react`, `eslint`, `gh-pages`, `vite-plugin-svgr`

---

## 🔐 INVENTÁRIO DE SEGURANÇA

| # | Severidade | CWE | Arquivo | Descrição | Recomendação |
|---|-----------|-----|---------|-----------|--------------|
| 1 | 🔴 **Crítica** | CWE-798 | `src/components/MovieList/MovieList.jsx:31` | API Key do TMDb exposta em código-fonte versionado | `.env`, `VITE_TMDB_API_KEY`, proxy server-side, remover do git history |
| 2 | 🟠 **Alta** | — | `npm audit` | 38 vulnerabilidades (30 high, 1 critical) incl. `node-tar` DoS, `@babel/core` file read | `npm audit fix`, migrar para lockfile seguro, CI scan |
| 3 | 🟡 **Média** | — | `dist/` commitado | Bundle buildado no repo | `.gitignore dist/`, build no CI |
| 4 | 🟡 **Média** | CWE-693 | `index.html` | Ausência de CSP, HSTS, X-Frame-Options, X-Content-Type-Options | Headers de segurança via Vite plugin ou backend |
| 5 | 🟢 **Baixa** | — | `package.json:19` | `vercel` como dependência de produção | Mover para `devDependencies` |
| 6 | 🟢 **Informativa** | CWE-200 | — | Ausência de política de privacidade / LGPD | Banner de cookies, política de privacidade |

---

## 🎯 PLANO MACRO EM ETAPAS

### Etapa 1 — 🔐 Remedição Crítica + Migração JS→TS
**Duração estimada**: 2–3h

1. Remover API key hardcoded de `MovieList.jsx`
2. Criar `.env`, `.env.example`, atualizar `.gitignore`
3. Instalar TypeScript e migrar todos os arquivos `.jsx` → `.tsx`/`.ts`
4. Tipagem das respostas da API TMDb (interface básica)
5. Remover `dist/` do controle de versão
6. Mover `vercel` para `devDependencies`

**Entregáveis**: app compila em TS, nenhuma key exposta, `.env.example` funcional

### Etapa 2 — 🛡️ Segurança + Testes
**Duração estimada**: 3–4h

1. `npm audit fix` (analisar breaking changes)
2. Instalar Vitest + React Testing Library
3. Configurar ESLint com plugins de segurança (`eslint-plugin-security`)
4. Escrever testes unitários para `MovieList`, `DarkMode`, `FilterGroup`
5. Remover API key do histórico Git (`git filter-repo` ou BFG)
6. Configurar Prettier

**Entregáveis**: 0 vulnerabilidades críticas/altas, > 70% de cobertura, lint seguro

### Etapa 3 — 🏗️ Arquitetura + CI/CD
**Duração estimada**: 2–3h

1. Refatorar estrutura: `services/`, `types/`, `hooks/`, `components/`
2. Criar hook customizado `useMovies()` para fetch
3. GitHub Actions: lint, test, build, SAST (CodeQL)
4. Corrigir `vercel.json` e `vite.config.js`
5. Separar componentização (shared/ui)

**Entregáveis**: pipeline CI verde, arquitetura modular, CodeQL ativo

### Etapa 4 — 🚀 Docs + Deploy + Headers de Segurança
**Duração estimada**: 2–3h

1. README premium (badges, demo, arquitetura, segurança)
2. ADRs (Architecture Decision Records)
3. Configurar headers de segurança (CSP, HSTS, X-Frame-Options)
4. Banner de cookies + política de privacidade (mínimo LGPD)
5. Dockerfiles mínimos (container hardening, non-root)
6. `.env.example` atualizado

**Entregáveis**: README impressionante, docs completos, 0 achados médios/críticos

---

## ❓ PERGUNTAS ABERTAS

1. **API TMDb** — manter integração frontend-browser ou migrar para backend proxy?
2. **TypeScript** — incluir schemas de validação (Zod/Valibot) para responses da API?
3. **Testes** — framework preferido? (Vitest sugerido por compatibilidade Vite)
4. **Deploy** — manter GitHub Pages ou migrar Vercel? (vercel.json está incorreto)
5. **CI/CD** — GitHub Actions é a preferência? Incluir SAST (CodeQL)?
6. **Secrets** — rotacionar API key do TMDb?

---

## 📖 REFERÊNCIAS

- [OWASP Top 10 (2021)](https://owasp.org/Top10/)
- [OWASP API Security Top 10 (2023)](https://owasp.org/API-Security/)
- [OWASP ASVS v4.0](https://owasp.org/www-project-application-security-verificationStandard/)
- [CWE-798: Use of Hard-coded Credentials](https://cwe.mitre.org/data/definitions/798.html)
- [NIST Cybersecurity Framework (CSF)](https://www.nist.gov/cyberframework)
- [CIS Controls v8](https://www.cisecurity.org/cis-controls/)
- [LGPD — Lei Geral de Proteção de Dados](https://www.legislacao.gov.br/norma/1080480)
- [Vite Security Best Practices](https://vitejs.dev/guide/build.html#security)
