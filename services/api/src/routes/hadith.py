from typing import Optional
"""GET /api/v1/hadith/:collection/:id — Fetch a specific hadith."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import json

from ..database import get_pool

router = APIRouter()

VALID_COLLECTIONS = {
    "bukhari", "muslim", "abudawud", "tirmidhi",
    "nasai", "ibnmajah", "malik", "ahmad",
}


class HadithResponse(BaseModel):
    id: str
    collection_slug: str
    book_number: int
    book_name_en: str
    hadith_number: int
    grade: str
    grade_source: Optional[str]
    arabic_text: str
    narrator_chain: Optional[str]
    translations: dict


@router.get("/hadith/{collection}/{hadith_id}", response_model=HadithResponse)
async def get_hadith(collection: str, hadith_id: int):
    if collection not in VALID_COLLECTIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown collection. Valid: {', '.join(sorted(VALID_COLLECTIONS))}",
        )

    pool = await get_pool()
    row = await pool.fetchrow(
        """
        SELECT id::text, collection_slug, book_number,
               COALESCE(book_name_en,'') as book_name_en, hadith_number,
               grade, grade_source, arabic_text, narrator_chain, translations
        FROM hadith
        WHERE collection_slug = $1 AND hadith_number = $2
        """,
        collection, hadith_id,
    )
    if not row:
        raise HTTPException(
            status_code=404,
            detail=f"Hadith {collection} #{hadith_id} not found",
        )

    translations = row["translations"]
    if isinstance(translations, str):
        translations = json.loads(translations)

    return HadithResponse(
        id=row["id"],
        collection_slug=row["collection_slug"],
        book_number=row["book_number"],
        book_name_en=row["book_name_en"],
        hadith_number=row["hadith_number"],
        grade=row["grade"],
        grade_source=row["grade_source"],
        arabic_text=row["arabic_text"],
        narrator_chain=row["narrator_chain"],
        translations=dict(translations),
    )
