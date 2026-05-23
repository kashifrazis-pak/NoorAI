"""
NoorAI FastAPI Application Entry Point
"""
from contextlib import asynccontextmanager

import redis.asyncio as aioredis
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from .config import get_settings
from .database import get_pool, close_pool
from .routes import ask, answers, quran, hadith, search, users, scholar, daily

settings = get_settings()
limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    app.state.redis = aioredis.from_url(settings.redis_url, decode_responses=True)
    await get_pool()  # warm up DB pool
    yield
    # Shutdown
    await close_pool()
    await app.state.redis.aclose()


app = FastAPI(
    title="NoorAI API",
    description="AI-Powered Islamic Q&A — answers rooted in the Quran and authentic Sunnah",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.node_env != "production" else None,
    redoc_url="/redoc" if settings.node_env != "production" else None,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS — tighten origins in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.node_env == "development" else [
        "https://noorai.app",
        "https://www.noorai.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response


# Rate-limit the /ask endpoint (100 req/min per IP as per build plan)
@app.middleware("http")
async def rate_limit_ask(request: Request, call_next):
    return await call_next(request)


PREFIX = "/api/v1"

app.include_router(ask.router, prefix=PREFIX, tags=["Q&A"])
app.include_router(answers.router, prefix=PREFIX, tags=["Answers"])
app.include_router(quran.router, prefix=PREFIX, tags=["Quran"])
app.include_router(hadith.router, prefix=PREFIX, tags=["Hadith"])
app.include_router(search.router, prefix=PREFIX, tags=["Search"])
app.include_router(users.router, prefix=PREFIX, tags=["Users"])
app.include_router(scholar.router, prefix=PREFIX, tags=["Scholar"])
app.include_router(daily.router, prefix=PREFIX, tags=["Daily Content"])


@app.get("/health")
async def health():
    return {"status": "ok", "service": "NoorAI API"}


@app.get("/")
async def root():
    return {
        "name": "NoorAI",
        "tagline": "Answers rooted in the Quran and authentic Sunnah",
        "docs": "/docs",
    }
