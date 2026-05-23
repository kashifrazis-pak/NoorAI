"""GET /api/v1/daily — Hadith of the Day and Verse of the Day."""
from datetime import date
from fastapi import APIRouter, Query
import json

from ..database import get_pool

router = APIRouter()


@router.get("/daily")
async def get_daily(language: str = Query("en", pattern=r"^[a-z]{2}$")):
    pool = await get_pool()
    today = date.today()

    rows = await pool.fetch(
        """
        SELECT dc.type, dc.content_id::text
        FROM daily_content dc
        WHERE dc.scheduled_date = $1 AND dc.language = $2
        """,
        today, language,
    )

    result: dict = {"date": today.isoformat(), "verse": None, "hadith": None}

    for row in rows:
        if row["type"] == "verse":
            v = await pool.fetchrow(
                """
                SELECT id::text, surah_number, surah_name_en, ayah_number,
                       arabic_text, translations
                FROM quran_verses WHERE id = $1::uuid
                """,
                row["content_id"],
            )
            if v:
                trans = dict(json.loads(v["translations"]) if isinstance(v["translations"], str) else v["translations"])
                result["verse"] = {
                    "id": v["id"],
                    "reference": f"Surah {v['surah_name_en']} ({v['surah_number']}:{v['ayah_number']})",
                    "arabic_text": v["arabic_text"],
                    "translation": trans.get(language) or trans.get("en", ""),
                }
        elif row["type"] == "hadith":
            h = await pool.fetchrow(
                """
                SELECT id::text, collection_slug, hadith_number, grade,
                       arabic_text, translations
                FROM hadith WHERE id = $1::uuid
                """,
                row["content_id"],
            )
            if h:
                trans = dict(json.loads(h["translations"]) if isinstance(h["translations"], str) else h["translations"])
                result["hadith"] = {
                    "id": h["id"],
                    "reference": f"{h['collection_slug'].capitalize()} Hadith {h['hadith_number']} ({h['grade']})",
                    "arabic_text": h["arabic_text"],
                    "translation": trans.get(language) or trans.get("en", ""),
                    "grade": h["grade"],
                }

    # Fallback: pick a pseudo-random verse/hadith by day-of-year if none scheduled
    if not result["verse"]:
        day_num = today.timetuple().tm_yday
        count = await pool.fetchval("SELECT COUNT(*) FROM quran_verses")
        if count and count > 0:
            v = await pool.fetchrow(
                """
                SELECT id::text, surah_number, surah_name_en, ayah_number,
                       arabic_text, translations
                FROM quran_verses
                ORDER BY surah_number, ayah_number
                OFFSET ($1 % $2)
                LIMIT 1
                """,
                day_num, count,
            )
            if v:
                trans = dict(json.loads(v["translations"]) if isinstance(v["translations"], str) else v["translations"])
                result["verse"] = {
                    "id": v["id"],
                    "reference": f"Surah {v['surah_name_en']} ({v['surah_number']}:{v['ayah_number']})",
                    "arabic_text": v["arabic_text"],
                    "translation": trans.get(language) or trans.get("en", ""),
                }

    if not result["hadith"]:
        day_num = today.timetuple().tm_yday
        count = await pool.fetchval("SELECT COUNT(*) FROM hadith WHERE grade IN ('sahih','hasan')")
        if count and count > 0:
            h = await pool.fetchrow(
                """
                SELECT id::text, collection_slug, hadith_number, grade,
                       arabic_text, translations
                FROM hadith
                WHERE grade IN ('sahih','hasan')
                ORDER BY collection_slug, hadith_number
                OFFSET ($1 % $2)
                LIMIT 1
                """,
                day_num, count,
            )
            if h:
                trans = dict(json.loads(h["translations"]) if isinstance(h["translations"], str) else h["translations"])
                result["hadith"] = {
                    "id": h["id"],
                    "reference": f"{h['collection_slug'].capitalize()} Hadith {h['hadith_number']} ({h['grade']})",
                    "arabic_text": h["arabic_text"],
                    "translation": trans.get(language) or trans.get("en", ""),
                    "grade": h["grade"],
                }

    return result
