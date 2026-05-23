from __future__ import annotations
from typing import Optional

import json
import hashlib
import sys
import os
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field, field_validator
import redis.asyncio as aioredis

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../../../..'))

from ..database import get_pool
from ..config import get_settings
from ..auth import get_optional_user

router = APIRouter()
settings = get_settings()

SUPPORTED_LANGUAGES = {"en", "ar", "ur", "fr", "tr", "id", "bn", "ms"}
CACHE_TTL_SECONDS = 60 * 60 * 24  # 24 hours


class AskRequest(BaseModel):
    question: str = Field(..., min_length=3, max_length=2000)
    language: str = Field("en", pattern=r"^[a-z]{2}$")

    @field_validator("language")
    @classmethod
    def validate_language(cls, v: str) -> str:
        if v not in SUPPORTED_LANGUAGES:
            return "en"
        return v

    @field_validator("question")
    @classmethod
    def sanitise_question(cls, v: str) -> str:
        # Basic XSS / prompt injection mitigation
        stripped = v.strip()
        # Reject attempts to inject system prompt overrides
        forbidden = ["ignore previous", "system:", "you are now", "disregard"]
        lower = stripped.lower()
        for phrase in forbidden:
            if phrase in lower:
                raise ValueError("Invalid question content")
        return stripped


class CitationOut(BaseModel):
    type: str
    label: str
    arabic_text: str
    translation: str
    surah_number: Optional[int] = None
    ayah_number: Optional[int] = None
    collection_slug: Optional[str] = None
    hadith_number: Optional[int] = None
    grade: Optional[str] = None


class AskResponse(BaseModel):
    answer_id: str
    answer_text: str
    citations: list[CitationOut]
    confidence: str
    language: str
    from_cache: bool


def _cache_key(question: str, language: str) -> str:
    return "noorai:answer:" + hashlib.sha256(
        f"{language}:{question.strip().lower()}".encode()
    ).hexdigest()


@router.post("/ask", response_model=AskResponse)
async def ask_question(
    body: AskRequest,
    request: Request,
    current_user: Optional[dict] = Depends(get_optional_user),
):
    # Lazy import — resolve path from services/api/src/routes/ up to services/rag/src/pipeline.py
    import importlib.util, pathlib
    _rag_path = pathlib.Path(__file__).parents[3] / "rag" / "src" / "pipeline.py"
    _spec = importlib.util.spec_from_file_location("rag_pipeline", _rag_path)
    _mod = importlib.util.module_from_spec(_spec)
    _spec.loader.exec_module(_mod)
    answer_question = _mod.answer_question

    pool = await get_pool()
    redis: aioredis.Redis = request.app.state.redis
    ck = _cache_key(body.question, body.language)

    # Check cache first
    cached = await redis.get(ck)
    if cached:
        data = json.loads(cached)
        return AskResponse(**data, from_cache=True)

    # Run RAG pipeline
    result = await answer_question(
        question=body.question,
        language=body.language,
        pool=pool,
        anthropic_api_key=settings.anthropic_api_key,
        llm_model=settings.llm_model,
    )

    # Persist question
    user_id = current_user.get("sub") if current_user else None
    question_row = await pool.fetchrow(
        "INSERT INTO questions (user_id, question_text, language) VALUES ($1,$2,$3) RETURNING id",
        user_id,
        body.question,
        body.language,
    )
    question_id = str(question_row["id"])

    # Persist answer
    answer_row = await pool.fetchrow(
        """
        INSERT INTO answers
          (question_id, answer_text, citations, confidence, model_version,
           retrieved_chunk_ids, is_cached, cache_key)
        VALUES ($1,$2,$3::jsonb,$4,$5,$6::jsonb,$7,$8)
        RETURNING id
        """,
        question_id,
        result.answer_text,
        json.dumps([c.__dict__ for c in result.citations]),
        result.confidence,
        result.model_version,
        json.dumps(result.retrieved_chunk_ids),
        False,
        result.cache_key,
    )
    answer_id = str(answer_row["id"])

    response_data = {
        "answer_id": answer_id,
        "answer_text": result.answer_text,
        "citations": [c.__dict__ for c in result.citations],
        "confidence": result.confidence,
        "language": body.language,
    }

    # Store in Redis cache
    await redis.setex(ck, CACHE_TTL_SECONDS, json.dumps(response_data))

    return AskResponse(**response_data, from_cache=False)
