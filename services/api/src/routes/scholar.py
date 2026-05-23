from typing import Optional
"""Scholar review dashboard endpoints (scholar/admin role required)."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from ..database import get_pool
from ..auth import get_current_scholar

router = APIRouter()


class ReviewRequest(BaseModel):
    action: str = Field(..., pattern=r"^(approve|reject|annotate)$")
    notes: Optional[str] = None


@router.get("/scholar/flags")
async def list_flags(
    status: str = "pending",
    limit: int = 50,
    current_scholar: dict = Depends(get_current_scholar),
):
    pool = await get_pool()
    rows = await pool.fetch(
        """
        SELECT f.id::text, f.answer_id::text, f.reason, f.status,
               f.created_at, q.question_text, a.answer_text, a.confidence
        FROM flags f
        JOIN answers a ON a.id = f.answer_id
        JOIN questions q ON q.id = a.question_id
        WHERE f.status = $1
        ORDER BY f.created_at ASC
        LIMIT $2
        """,
        status, limit,
    )
    return [dict(r) for r in rows]


@router.put("/scholar/flags/{flag_id}")
async def review_flag(
    flag_id: str,
    body: ReviewRequest,
    current_scholar: dict = Depends(get_current_scholar),
):
    pool = await get_pool()

    flag = await pool.fetchrow(
        "SELECT id, answer_id FROM flags WHERE id = $1::uuid", flag_id
    )
    if not flag:
        raise HTTPException(status_code=404, detail="Flag not found")

    new_status = {
        "approve": "resolved",
        "reject": "dismissed",
        "annotate": "reviewed",
    }[body.action]

    await pool.execute(
        """
        UPDATE flags SET status=$1, scholar_notes=$2,
               reviewed_by=$3::uuid, reviewed_at=NOW()
        WHERE id=$4::uuid
        """,
        new_status, body.notes, current_scholar["sub"], flag_id,
    )

    # If approved, mark the answer as scholar-verified
    if body.action == "approve":
        await pool.execute(
            """
            UPDATE answers SET verified_by_scholar=$1::uuid,
                   verified_at=NOW(), scholar_notes=$2
            WHERE id=$3
            """,
            current_scholar["sub"], body.notes, str(flag["answer_id"]),
        )

    return {"flag_id": flag_id, "new_status": new_status}
