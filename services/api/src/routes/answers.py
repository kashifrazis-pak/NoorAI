from typing import Optional
"""Answer retrieval and flagging endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
import json

from ..database import get_pool
from ..auth import get_current_user, get_optional_user

router = APIRouter()


class FlagRequest(BaseModel):
    reason: str = Field(..., min_length=10, max_length=1000)


@router.get("/answers/{answer_id}")
async def get_answer(answer_id: str):
    pool = await get_pool()
    row = await pool.fetchrow(
        """
        SELECT a.id::text, a.answer_text, a.citations, a.confidence,
               a.model_version, a.verified_by_scholar, a.verified_at,
               a.scholar_notes, a.created_at,
               q.question_text, q.language
        FROM answers a
        JOIN questions q ON q.id = a.question_id
        WHERE a.id = $1::uuid
        """,
        answer_id,
    )
    if not row:
        raise HTTPException(status_code=404, detail="Answer not found")

    citations = row["citations"]
    if isinstance(citations, str):
        citations = json.loads(citations)

    return {
        "id": row["id"],
        "question": row["question_text"],
        "language": row["language"],
        "answer_text": row["answer_text"],
        "citations": citations,
        "confidence": row["confidence"],
        "model_version": row["model_version"],
        "verified": row["verified_by_scholar"] is not None,
        "scholar_notes": row["scholar_notes"],
        "created_at": row["created_at"].isoformat(),
    }


@router.post("/answers/{answer_id}/flag", status_code=201)
async def flag_answer(
    answer_id: str,
    body: FlagRequest,
    current_user: Optional[dict] = Depends(get_optional_user),
):
    pool = await get_pool()

    # Verify answer exists
    exists = await pool.fetchval(
        "SELECT 1 FROM answers WHERE id = $1::uuid", answer_id
    )
    if not exists:
        raise HTTPException(status_code=404, detail="Answer not found")

    user_id = current_user.get("sub") if current_user else None
    row = await pool.fetchrow(
        """
        INSERT INTO flags (answer_id, user_id, reason)
        VALUES ($1::uuid, $2::uuid, $3)
        RETURNING id::text
        """,
        answer_id, user_id, body.reason,
    )
    return {"flag_id": row["id"], "status": "pending"}
