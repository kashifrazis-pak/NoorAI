"""
Semantic retrieval layer.

Given a user question, this module:
1. Embeds the question using OpenAI text-embedding-3-small
2. Queries pgvector for the top-K most similar chunks across:
   - Quran verses
   - Hadith (sahih/hasan/unknown)
   - Tafsir Ibn Kathir
   - Duas (Hisnul Muslim)
   - Seerah (Ar-Raheeq Al-Makhtum)
3. Returns structured context chunks ready for the LLM prompt
"""

import asyncpg
import openai
import json as _json
from dataclasses import dataclass, field
from typing import Literal, Optional, Union

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../api'))
from src.config import get_settings  # type: ignore[import]

settings = get_settings()

_openai_client = openai.AsyncOpenAI(api_key=settings.openai_api_key)


@dataclass
class VerseChunk:
    type: Literal["verse"] = "verse"
    id: str = ""
    surah_number: int = 0
    surah_name_en: str = ""
    surah_name_ar: str = ""
    ayah_number: int = 0
    arabic_text: str = ""
    translations: dict = field(default_factory=dict)
    similarity: float = 0.0

    def citation_label(self) -> str:
        return f"Surah {self.surah_name_en} ({self.surah_number}:{self.ayah_number})"


@dataclass
class HadithChunk:
    type: Literal["hadith"] = "hadith"
    id: str = ""
    collection_slug: str = ""
    hadith_number: int = 0
    book_number: int = 0
    book_name_en: str = ""
    grade: str = ""
    arabic_text: str = ""
    translations: dict = field(default_factory=dict)
    narrator_chain: Optional[str] = None
    similarity: float = 0.0

    COLLECTION_NAMES = {
        "bukhari":  "Sahih al-Bukhari",
        "muslim":   "Sahih Muslim",
        "abudawud": "Sunan Abu Dawud",
        "tirmidhi": "Jami al-Tirmidhi",
        "nasai":    "Sunan al-Nasai",
        "ibnmajah": "Sunan Ibn Majah",
        "malik":    "Muwatta Imam Malik",
        "ahmad":    "Musnad Ahmad",
    }

    def collection_name(self) -> str:
        return self.COLLECTION_NAMES.get(self.collection_slug, self.collection_slug)

    def citation_label(self) -> str:
        return (
            f"{self.collection_name()}, "
            f"Book {self.book_number}, "
            f"Hadith {self.hadith_number} ({self.grade})"
        )


@dataclass
class TafsirChunk:
    type: Literal["tafsir"] = "tafsir"
    id: str = ""
    surah_number: int = 0
    ayah_number: int = 0
    tafsir_name_en: str = ""
    scholar_name: str = ""
    text: str = ""
    similarity: float = 0.0

    def citation_label(self) -> str:
        return f"{self.tafsir_name_en} — Surah {self.surah_number}:{self.ayah_number}"


@dataclass
class DuaChunk:
    type: Literal["dua"] = "dua"
    id: str = ""
    category: str = ""
    arabic_text: str = ""
    transliteration: Optional[str] = None
    translations: dict = field(default_factory=dict)
    source: str = ""
    similarity: float = 0.0

    def citation_label(self) -> str:
        return f"Hisnul Muslim — {self.category} ({self.source})"


@dataclass
class SeerahChunk:
    type: Literal["seerah"] = "seerah"
    id: str = ""
    book_title: str = ""
    chapter_number: int = 0
    chapter_title: str = ""
    content: str = ""
    similarity: float = 0.0

    def citation_label(self) -> str:
        return f"{self.book_title}, Chapter {self.chapter_number}: {self.chapter_title}"


RetrievedChunk = Union[VerseChunk, HadithChunk, TafsirChunk, DuaChunk, SeerahChunk]


async def embed_query(text: str) -> list:
    resp = await _openai_client.embeddings.create(
        model=settings.embedding_model,
        input=text[:8192],
        dimensions=settings.embedding_dimensions,
    )
    return resp.data[0].embedding


def _parse_json(val) -> dict:
    if isinstance(val, str):
        return _json.loads(val)
    return dict(val)


async def retrieve_context(
    question: str,
    pool: asyncpg.Pool,
    top_k: Optional[int] = None,
    quran_only: bool = False,
    hadith_only: bool = False,
) -> list:
    """
    Retrieve the most semantically relevant chunks across all knowledge sources.
    Allocates slots per source then re-ranks by similarity globally.
    """
    k = top_k or settings.max_retrieved_chunks
    # Slot allocation: verses=3, hadith=3, tafsir=2, duas=1, seerah=1 (for k=10)
    # Scale proportionally for other k values
    slot_verse   = max(1, int(k * 0.30))
    slot_hadith  = max(1, int(k * 0.30))
    slot_tafsir  = max(1, int(k * 0.20))
    slot_dua     = max(1, int(k * 0.10))
    slot_seerah  = max(1, int(k * 0.10))

    embedding = await embed_query(question)
    embedding_str = f"[{','.join(str(x) for x in embedding)}]"

    chunks: list = []

    # ── Quran verses ──────────────────────────────────────────────────────────
    if not hadith_only:
        rows = await pool.fetch(
            """
            SELECT id::text, surah_number, surah_name_en, surah_name_ar,
                   ayah_number, arabic_text, translations,
                   1 - (embedding_vector <=> $1::vector) AS similarity
            FROM quran_verses
            ORDER BY embedding_vector <=> $1::vector
            LIMIT $2
            """,
            embedding_str, slot_verse if not quran_only else k,
        )
        for row in rows:
            chunks.append(VerseChunk(
                id=row["id"],
                surah_number=row["surah_number"],
                surah_name_en=row["surah_name_en"],
                surah_name_ar=row["surah_name_ar"],
                ayah_number=row["ayah_number"],
                arabic_text=row["arabic_text"],
                translations=_parse_json(row["translations"]),
                similarity=float(row["similarity"]),
            ))

    # ── Hadith ────────────────────────────────────────────────────────────────
    if not quran_only:
        rows = await pool.fetch(
            """
            SELECT id::text, collection_slug, hadith_number, book_number,
                   COALESCE(book_name_en,'') AS book_name_en, grade,
                   arabic_text, translations, narrator_chain,
                   1 - (embedding_vector <=> $1::vector) AS similarity
            FROM hadith
            WHERE grade IN ('sahih', 'hasan', 'unknown')
            ORDER BY embedding_vector <=> $1::vector
            LIMIT $2
            """,
            embedding_str, slot_hadith if not hadith_only else k,
        )
        for row in rows:
            chunks.append(HadithChunk(
                id=row["id"],
                collection_slug=row["collection_slug"],
                hadith_number=row["hadith_number"],
                book_number=row["book_number"],
                book_name_en=row["book_name_en"],
                grade=row["grade"],
                arabic_text=row["arabic_text"],
                translations=_parse_json(row["translations"]),
                narrator_chain=row["narrator_chain"],
                similarity=float(row["similarity"]),
            ))

    # ── Tafsir Ibn Kathir ─────────────────────────────────────────────────────
    rows = await pool.fetch(
        """
        SELECT id::text, surah_number, ayah_number, tafsir_name_en,
               COALESCE(scholar_name,'') AS scholar_name, text,
               1 - (embedding_vector <=> $1::vector) AS similarity
        FROM tafsir
        ORDER BY embedding_vector <=> $1::vector
        LIMIT $2
        """,
        embedding_str, slot_tafsir,
    )
    for row in rows:
        chunks.append(TafsirChunk(
            id=row["id"],
            surah_number=row["surah_number"],
            ayah_number=row["ayah_number"],
            tafsir_name_en=row["tafsir_name_en"],
            scholar_name=row["scholar_name"],
            text=row["text"],
            similarity=float(row["similarity"]),
        ))

    # ── Duas (Hisnul Muslim) ──────────────────────────────────────────────────
    rows = await pool.fetch(
        """
        SELECT id::text, category, arabic_text, transliteration,
               translations, COALESCE(source,'') AS source,
               1 - (embedding_vector <=> $1::vector) AS similarity
        FROM duas
        ORDER BY embedding_vector <=> $1::vector
        LIMIT $2
        """,
        embedding_str, slot_dua,
    )
    for row in rows:
        chunks.append(DuaChunk(
            id=row["id"],
            category=row["category"],
            arabic_text=row["arabic_text"],
            transliteration=row["transliteration"],
            translations=_parse_json(row["translations"]),
            source=row["source"],
            similarity=float(row["similarity"]),
        ))

    # ── Seerah ────────────────────────────────────────────────────────────────
    rows = await pool.fetch(
        """
        SELECT id::text, book_title, chapter_number, chapter_title, content,
               1 - (embedding_vector <=> $1::vector) AS similarity
        FROM seerah
        ORDER BY embedding_vector <=> $1::vector
        LIMIT $2
        """,
        embedding_str, slot_seerah,
    )
    for row in rows:
        chunks.append(SeerahChunk(
            id=row["id"],
            book_title=row["book_title"],
            chapter_number=row["chapter_number"],
            chapter_title=row["chapter_title"],
            content=row["content"],
            similarity=float(row["similarity"]),
        ))

    chunks.sort(key=lambda c: c.similarity, reverse=True)
    return chunks[:k]
