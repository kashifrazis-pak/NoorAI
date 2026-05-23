# نور NoorAI

> **AI-Powered Islamic Q&A — Answers rooted in the Quran and authentic Sunnah**

NoorAI is a multilingual, cross-platform Islamic Q&A application that uses a large language model (Claude) grounded exclusively in the Holy Quran and authentic (sahih/hasan) Hadith. Every response cites specific verse or hadith references, which are verified to exist in the database before the answer is shown to the user.

---

## Architecture

```
NoorAI/
├── apps/
│   ├── web/            # Next.js 14 PWA (TypeScript + Tailwind)
│   └── mobile/         # React Native + Expo (iOS & Android)
├── packages/
│   └── shared/         # Shared TypeScript types
├── services/
│   ├── api/            # FastAPI backend (Python)
│   ├── rag/            # RAG pipeline (retriever, prompt builder, citation verifier)
│   └── ingestion/      # Quran & Hadith data ingestion (TypeScript)
└── database/
    └── migrations/     # PostgreSQL schema migrations
```

The system uses **Retrieval-Augmented Generation (RAG)**:

1. User question → embedded via OpenAI `text-embedding-3-small`
2. pgvector similarity search → top-K Quran verses + Hadith (sahih/hasan only)
3. Retrieved context passed to Claude with a strict grounding system prompt
4. Citation verification — every reference checked against the database
5. Verified answer returned to user

---

## Phase 1 Setup (Local Development)

### Prerequisites
- Docker & Docker Compose
- Node.js 20+
- Python 3.12+
- Yarn 4+

### 1. Environment variables

```bash
cp .env.example .env
# Fill in: ANTHROPIC_API_KEY, OPENAI_API_KEY
# SUNNAH_COM_API_KEY optional (GitHub fallback used if absent)
```

### 2. Start infrastructure

```bash
docker-compose up postgres redis -d
```

### 3. Run database migrations

```bash
# Migrations run automatically via docker-entrypoint-initdb.d
# Or manually:
psql $DATABASE_URL -f database/migrations/001_initial_schema.sql
```

### 4. Ingest Quran data

```bash
cd services/ingestion
yarn install
yarn ingest:quran       # Fetches all 6,236 ayat from quran.com API + embeds
```

### 5. Ingest Hadith (MVP: Bukhari + Muslim)

```bash
yarn ingest:hadith      # Uses sunnah.com API or GitHub fallback
```

### 6. Start the API

```bash
cd services/api
pip install -r requirements.txt
uvicorn src.main:app --reload --port 3001
# API docs available at: http://localhost:3001/docs
```

### 7. Start the web app

```bash
cd apps/web
yarn install
yarn dev
# Open: http://localhost:3000
```

### 8. Start the mobile app

```bash
cd apps/mobile
yarn install
yarn start          # Opens Expo Go
yarn ios            # iOS simulator
yarn android        # Android emulator
```

---

## Full Docker Compose (all services)

```bash
cp .env.example .env   # fill in API keys
docker-compose up --build
```

| Service  | URL                          |
|----------|------------------------------|
| Web PWA  | http://localhost:3000        |
| API      | http://localhost:3001        |
| API Docs | http://localhost:3001/docs   |
| Postgres | localhost:5432               |
| Redis    | localhost:6379               |

---

## API Reference

| Method | Endpoint                          | Description                              |
|--------|-----------------------------------|------------------------------------------|
| POST   | `/api/v1/ask`                     | Submit a question; returns cited answer  |
| GET    | `/api/v1/answers/:id`             | Retrieve a specific answer               |
| POST   | `/api/v1/answers/:id/flag`        | Flag an answer for scholar review        |
| GET    | `/api/v1/quran/:surah/:ayah`      | Fetch a Quran verse                      |
| GET    | `/api/v1/quran/:surah`            | Fetch all verses of a surah              |
| GET    | `/api/v1/hadith/:collection/:id`  | Fetch a specific hadith                  |
| GET    | `/api/v1/search`                  | Full-text search across Quran & Hadith   |
| GET    | `/api/v1/daily`                   | Hadith of the Day + Verse of the Day     |
| POST   | `/api/v1/users/register`          | Create user account                      |
| POST   | `/api/v1/users/login`             | Authenticate; receive JWT                |
| GET    | `/api/v1/users/me/saved`          | Get saved Q&A items                      |
| POST   | `/api/v1/users/me/saved`          | Save a Q&A item                          |
| GET    | `/api/v1/scholar/flags`           | Scholar: list flagged answers            |
| PUT    | `/api/v1/scholar/flags/:id`       | Scholar: approve/reject/annotate         |

---

## Hadith Sources

| Collection             | Approx. Hadith | Grade filter |
|------------------------|----------------|--------------|
| Sahih al-Bukhari       | 7,563          | Sahih only   |
| Sahih Muslim           | 7,500          | Sahih only   |
| Sunan Abu Dawud        | 5,274          | Sahih/Hasan  |
| Jami al-Tirmidhi       | 3,956          | Sahih/Hasan  |
| Sunan al-Nasai         | 5,761          | Sahih/Hasan  |
| Sunan Ibn Majah        | 4,341          | Sahih/Hasan  |
| Muwatta Imam Malik     | 1,720          | Sahih/Hasan  |
| Musnad Ahmad           | 27,000+        | Sahih/Hasan  |

---

## Important Disclaimer

NoorAI is for **educational purposes only**. Responses are AI-generated and are **not fatwas** or authoritative religious rulings. Always consult a qualified Islamic scholar for personal religious decisions.

---

*— May this app be a source of benefit (nafa') for the Ummah — Ameen —*
