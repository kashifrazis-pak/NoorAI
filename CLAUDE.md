# NoorAI — Claude Code Guide

AI-powered Islamic Q&A application. Answers are grounded exclusively in the Quran and authentic (sahih/hasan) Hadith. Every response is citation-verified against the database before being returned to the user.

---

## Architecture

```
NoorAI/
├── apps/
│   ├── web/                        # Next.js 14 PWA (TypeScript + Tailwind)
│   └── mobile/                     # React Native + Expo (iOS & Android)
├── packages/
│   └── shared/src/index.ts         # Shared TypeScript types (Citation, AskResponse, etc.)
├── services/
│   ├── api/                        # FastAPI backend (Python 3.9)
│   │   └── src/
│   │       ├── main.py             # App entry point, middleware, router registration
│   │       ├── config.py           # Pydantic settings — reads from root .env
│   │       ├── database.py         # asyncpg connection pool
│   │       ├── auth.py             # JWT creation/verification, bcrypt
│   │       └── routes/             # One file per endpoint group
│   ├── rag/                        # RAG pipeline (Python 3.9)
│   │   └── src/
│   │       ├── pipeline.py         # Orchestrates: retrieve → LLM → verify → return
│   │       ├── retriever.py        # pgvector semantic search (sahih/hasan only)
│   │       ├── prompt_builder.py   # Hardcoded system prompt + context formatter
│   │       └── citation_verifier.py# Parses LLM output, checks every citation in DB
│   └── ingestion/                  # Quran & Hadith data pipeline (TypeScript)
│       └── src/
│           ├── ingest_quran.ts     # Fetches from quran.com API, embeds, stores
│           ├── ingest_hadith.ts    # Fetches from sunnah.com API or GitHub fallback
│           ├── embedder.ts         # OpenAI text-embedding-3-small wrapper
│           └── db.ts               # pg pool for ingestion scripts
└── database/
    └── migrations/001_initial_schema.sql   # Full schema with pgvector indexes
```

---

## Running the App

### Prerequisites
- Docker Desktop running (for Postgres + Redis)
- Python 3.9 venv at `services/api/.venv`
- Node.js 26 + npm

### Start infrastructure
```bash
docker compose up postgres redis -d
```

### Start the API (port 3001)
```bash
cd /Users/kashifrazi/Documents/NoorAI
source services/api/.venv/bin/activate
PYTHONPATH=/Users/kashifrazi/Documents/NoorAI/services \
  uvicorn services.api.src.main:app --reload --port 3001
```

### Start the web app (port 3000)
```bash
cd apps/web && npm run dev
```

### Run ingestion (one-time, ~30 min each)
```bash
cd services/ingestion
node_modules/.bin/ts-node --project tsconfig.json src/ingest_quran.ts
node_modules/.bin/ts-node --project tsconfig.json src/ingest_hadith.ts
```

### Check everything is working
```bash
curl http://localhost:3001/health
curl http://localhost:3001/api/v1/daily
curl -X POST http://localhost:3001/api/v1/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"What does Islam say about patience?","language":"en"}'
```

---

## Key Technical Decisions

### Python compatibility
The backend runs on **Python 3.9** (macOS system default). This means:
- Use `Optional[X]` from `typing`, NOT `X | None` (3.10+ syntax)
- Use `List[X]` from `typing`, NOT `list[X]` (3.10+ syntax)
- Do NOT use `from __future__ import annotations` in dataclass files — it breaks `sys.modules` resolution when modules are loaded dynamically
- RAG modules (`rag/src/`) are loaded via `importlib` with explicit `sys.modules` registration to avoid relative import errors

### RAG module imports
The `services/rag/` modules are loaded dynamically from `services/api/src/routes/ask.py` using `importlib.util.spec_from_file_location`. Each module must be registered in `sys.modules` before `exec_module()` is called, otherwise dataclasses fail to resolve their own `__module__`. See `pipeline.py`'s `_load()` helper.

### Environment variables
All config is read from the **root `.env`** file (`/Users/kashifrazi/Documents/NoorAI/.env`). The path is resolved absolutely in `config.py` using `os.path.dirname(__file__)`. Ingestion scripts resolve it with `require('path').resolve(__dirname, '../../../.env')`.

### Citation verification (critical)
Every LLM response goes through `citation_verifier.py` before being returned. It parses `[Surah Name, X:Y]` and `[Collection, Book X, Hadith Y]` patterns and checks each against the database. If any citation doesn't exist, the response is rejected and the LLM is retried with a stricter prompt. This is the primary anti-hallucination safeguard.

### System prompt
The system prompt in `prompt_builder.py` is hardcoded and must never be weakened. It:
- Restricts answers to only the context block provided
- Requires exact citations on every claim
- Instructs the model to say "I was unable to find..." rather than guess
- Cannot be overridden by user input (injection attempts are caught in `ask.py`'s validator)

### Only sahih/hasan hadith
The retriever filters at query time: `WHERE grade IN ('sahih', 'hasan')`. Daif and mawdu hadith are stored in the database but never surfaced in answers. Do not remove this filter.

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/ask` | Submit question → returns answer with citations |
| GET | `/api/v1/answers/:id` | Fetch a stored answer |
| POST | `/api/v1/answers/:id/flag` | Flag answer for scholar review |
| GET | `/api/v1/quran/:surah/:ayah` | Fetch a verse |
| GET | `/api/v1/quran/:surah` | Fetch full surah |
| GET | `/api/v1/hadith/:collection/:id` | Fetch a hadith |
| GET | `/api/v1/search` | Full-text search across Quran & Hadith |
| GET | `/api/v1/daily` | Verse of the Day + Hadith of the Day |
| POST | `/api/v1/users/register` | Create account |
| POST | `/api/v1/users/login` | Login → JWT |
| GET | `/api/v1/users/me/saved` | Saved Q&A items |
| POST | `/api/v1/users/me/saved` | Save an answer |
| GET | `/api/v1/scholar/flags` | Scholar: list pending flags |
| PUT | `/api/v1/scholar/flags/:id` | Scholar: approve/reject/annotate |

Interactive docs available at `http://localhost:3001/docs` in development.

---

## Database

PostgreSQL 16 with pgvector extension. Schema defined in `database/migrations/001_initial_schema.sql`.

Key tables:
- `quran_verses` — 6,236 ayat with Arabic text, translations (JSONB), and `embedding_vector(1536)`
- `hadith` — all 8 collections with `grade` enum and `embedding_vector(1536)`
- `hadith_collections` — pre-seeded metadata for the 8 collections
- `questions` / `answers` — every Q&A pair persisted with citations as JSONB
- `flags` — user-reported issues, reviewed by scholars
- `users` — supports roles: `user`, `scholar`, `admin`

Vector indexes use `ivfflat` with cosine distance. pgvector queries use `<=>` operator.

---

## Environment Variables

All in root `.env` (copy from `.env.example`):

| Variable | Required | Purpose |
|----------|----------|---------|
| `ANTHROPIC_API_KEY` | Yes | Claude LLM for answer generation |
| `OPENAI_API_KEY` | Yes | text-embedding-3-small for vectors |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | Yes | Redis for answer caching |
| `JWT_SECRET` | Yes | Token signing (min 32 chars) |
| `SUNNAH_COM_API_KEY` | No | Hadith ingestion (GitHub fallback used if absent) |
| `LLM_MODEL` | No | Defaults to `claude-sonnet-4-6` |
| `EMBEDDING_MODEL` | No | Defaults to `text-embedding-3-small` |
| `MAX_RETRIEVED_CHUNKS` | No | Defaults to `8` |

---

## Adding a New Feature

### New API endpoint
1. Create `services/api/src/routes/your_feature.py`
2. Register it in `services/api/src/main.py` with `app.include_router(...)`
3. Add the corresponding TypeScript types to `packages/shared/src/index.ts`
4. Add the API call to `apps/web/src/lib/api.ts` and `apps/mobile/lib/api.ts`

### New language
1. Add the language code to `SUPPORTED_LANGUAGES` in `services/api/src/routes/ask.py`
2. Add translations to the Quran ingestion script (`TRANSLATIONS` dict in `ingest_quran.ts`)
3. Add i18n strings to `apps/web/src/components/layout/I18nProvider.tsx`
4. Add the option to the language selector in `apps/web/src/components/qa/QuestionForm.tsx` and `apps/mobile/app/(tabs)/settings.tsx`

### New hadith collection
1. Add a row to the `hadith_collections` INSERT in `001_initial_schema.sql`
2. Add the collection to `COLLECTIONS` in `ingest_hadith.ts`
3. Add the slug mapping to `COLLECTION_SLUG_MAP` in `citation_verifier.py` and `HadithChunk.COLLECTION_NAMES` in `retriever.py`

---

## What NOT to change

- **The system prompt** in `services/rag/src/prompt_builder.py` — it is the core safety mechanism
- **The grade filter** in `services/rag/src/retriever.py` (`WHERE grade IN ('sahih', 'hasan')`) — removing it would allow weak hadith in answers
- **The citation verifier** in `services/rag/src/citation_verifier.py` — it prevents hallucinated references reaching users
- **The disclaimer** appended in `pipeline.py` (`DISCLAIMER`) — legally and ethically required on every response
