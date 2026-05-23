from typing import Optional
"""GET /api/v1/search — Full-text + semantic search across Quran and Hadith."""
from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel
import json

from ..database import get_pool

router = APIRouter()


class SearchResult(BaseModel):
    type: str  # "verse" | "hadith"
    id: str
    label: str
    arabic_text: str
    translation: str
    grade: Optional[str] = None


@router.get("/search", response_model=list[SearchResult])
async def search(
    q: str = Query(..., min_length=2, max_length=500),
    language: str = Query("en", pattern=r"^[a-z]{2}$"),
    type: str = Query("all", pattern=r"^(all|verse|hadith)$"),
    limit: int = Query(20, ge=1, le=50),
):
    pool = await get_pool()
    results: list[SearchResult] = []

    if type in ("all", "verse"):
        rows = await pool.fetch(
            f"""
            SELECT id::text, surah_number, surah_name_en, ayah_number,
                   arabic_text, translations
            FROM quran_verses
            WHERE arabic_text ILIKE $1
               OR translations->>'en' ILIKE $1
            ORDER BY surah_number, ayah_number
            LIMIT {limit}
            """,
            f"%{q}%",
        )
        for row in rows:
            trans = row["translations"]
            if isinstance(trans, str):
                trans = json.loads(trans)
            translation = dict(trans).get(language) or dict(trans).get("en", "")
            results.append(
                SearchResult(
                    type="verse",
                    id=row["id"],
                    label=f"Surah {row['surah_name_en']} ({row['surah_number']}:{row['ayah_number']})",
                    arabic_text=row["arabic_text"],
                    translation=translation,
                )
            )

    if type in ("all", "hadith"):
        rows = await pool.fetch(
            f"""
            SELECT id::text, collection_slug, hadith_number, grade,
                   arabic_text, translations
            FROM hadith
            WHERE grade IN ('sahih','hasan')
              AND (arabic_text ILIKE $1 OR translations->>'en' ILIKE $1)
            ORDER BY collection_slug, hadith_number
            LIMIT {limit}
            """,
            f"%{q}%",
        )
        for row in rows:
            trans = row["translations"]
            if isinstance(trans, str):
                trans = json.loads(trans)
            translation = dict(trans).get(language) or dict(trans).get("en", "")
            results.append(
                SearchResult(
                    type="hadith",
                    id=row["id"],
                    label=f"{row['collection_slug'].capitalize()} Hadith {row['hadith_number']}",
                    arabic_text=row["arabic_text"],
                    translation=translation,
                    grade=row["grade"],
                )
            )

    return results[:limit]
