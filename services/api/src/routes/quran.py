from typing import Optional
"""GET /api/v1/quran/:surah/:ayah — Fetch a specific Quran verse."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import json

from ..database import get_pool

router = APIRouter()


class VerseResponse(BaseModel):
    id: str
    surah_number: int
    surah_name_en: str
    surah_name_ar: str
    ayah_number: int
    arabic_text: str
    translations: dict
    juz_number: Optional[int]


@router.get("/quran/{surah}/{ayah}", response_model=VerseResponse)
async def get_verse(surah: int, ayah: int):
    if not (1 <= surah <= 114):
        raise HTTPException(status_code=400, detail="Surah number must be between 1 and 114")
    if ayah < 1:
        raise HTTPException(status_code=400, detail="Ayah number must be >= 1")

    pool = await get_pool()
    row = await pool.fetchrow(
        """
        SELECT id::text, surah_number, surah_name_en, surah_name_ar,
               ayah_number, arabic_text, translations, juz_number
        FROM quran_verses
        WHERE surah_number = $1 AND ayah_number = $2
        """,
        surah, ayah,
    )
    if not row:
        raise HTTPException(status_code=404, detail=f"Verse {surah}:{ayah} not found")

    translations = row["translations"]
    if isinstance(translations, str):
        translations = json.loads(translations)

    return VerseResponse(
        id=row["id"],
        surah_number=row["surah_number"],
        surah_name_en=row["surah_name_en"],
        surah_name_ar=row["surah_name_ar"],
        ayah_number=row["ayah_number"],
        arabic_text=row["arabic_text"],
        translations=dict(translations),
        juz_number=row["juz_number"],
    )


@router.get("/quran/{surah}", response_model=list[VerseResponse])
async def get_surah(surah: int):
    if not (1 <= surah <= 114):
        raise HTTPException(status_code=400, detail="Surah number must be between 1 and 114")

    pool = await get_pool()
    rows = await pool.fetch(
        """
        SELECT id::text, surah_number, surah_name_en, surah_name_ar,
               ayah_number, arabic_text, translations, juz_number
        FROM quran_verses
        WHERE surah_number = $1
        ORDER BY ayah_number
        """,
        surah,
    )
    if not rows:
        raise HTTPException(status_code=404, detail=f"Surah {surah} not found")

    return [
        VerseResponse(
            id=row["id"],
            surah_number=row["surah_number"],
            surah_name_en=row["surah_name_en"],
            surah_name_ar=row["surah_name_ar"],
            ayah_number=row["ayah_number"],
            arabic_text=row["arabic_text"],
            translations=dict(json.loads(row["translations"]) if isinstance(row["translations"], str) else row["translations"]),
            juz_number=row["juz_number"],
        )
        for row in rows
    ]
