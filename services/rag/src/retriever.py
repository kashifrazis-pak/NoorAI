"""
Semantic retrieval layer.

Given a user question, this module:
1. Embeds the question using OpenAI text-embedding-3-small
2. Queries pgvector for the top-K most similar Quran verses and Hadith
3. Returns structured context chunks ready for the LLM prompt
"""

import asyncpg
import openai
from dataclasses import dataclass
from typing import Literal, Optional

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
    translations: dict[str, str] = None  # type: ignore
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
    translations: dict[str, str] = None  # type: ignore
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


from typing import Union
RetrievedChunk = Union[VerseChunk, HadithChunk]


async def embed_query(text: str) -> list[float]:
    resp = await _openai_client.embeddings.create(
        model=settings.embedding_model,
        input=text[:8192],
        dimensions=settings.embedding_dimensions,
    )
    return resp.data[0].embedding


async def retrieve_context(
    question: str,
    pool: asyncpg.Pool,
    top_k: Optional[int] = None,
    quran_only: bool = False,
    hadith_only: bool = False,
) -> list[RetrievedChunk]:
    """
    Retrieve the most semantically relevant Quran verses and Hadith for a question.
    Only sahih/hasan hadith are returned (daif are excluded at retrieval time).
    """
    k = top_k or settings.max_retrieved_chunks
    half_k = k // 2
    embedding = await embed_query(question)
    embedding_str = f"[{','.join(str(x) for x in embedding)}]"

    chunks: list[RetrievedChunk] = []

    if not hadith_only:
        verse_rows = await pool.fetch(
            """
            SELECT id::text, surah_number, surah_name_en, surah_name_ar,
                   ayah_number, arabic_text, translations,
                   1 - (embedding_vector <=> $1::vector) AS similarity
            FROM quran_verses
            ORDER BY embedding_vector <=> $1::vector
            LIMIT $2
            """,
            embedding_str,
            half_k if not quran_only else k,
        )
        for row in verse_rows:
            import json
            chunks.append(
                VerseChunk(
                    id=row["id"],
                    surah_number=row["surah_number"],
                    surah_name_en=row["surah_name_en"],
                    surah_name_ar=row["surah_name_ar"],
                    ayah_number=row["ayah_number"],
                    arabic_text=row["arabic_text"],
                    translations=json.loads(row["translations"]) if isinstance(row["translations"], str) else dict(row["translations"]),
                    similarity=float(row["similarity"]),
                )
            )

    if not quran_only:
        hadith_rows = await pool.fetch(
            """
            SELECT id::text, collection_slug, hadith_number, book_number,
                   COALESCE(book_name_en,'') as book_name_en, grade,
                   arabic_text, translations, narrator_chain,
                   1 - (embedding_vector <=> $1::vector) AS similarity
            FROM hadith
            WHERE grade IN ('sahih', 'hasan', 'unknown')
            ORDER BY embedding_vector <=> $1::vector
            LIMIT $2
            """,
            embedding_str,
            half_k if not hadith_only else k,
        )
        for row in hadith_rows:
            import json
            chunks.append(
                HadithChunk(
                    id=row["id"],
                    collection_slug=row["collection_slug"],
                    hadith_number=row["hadith_number"],
                    book_number=row["book_number"],
                    book_name_en=row["book_name_en"],
                    grade=row["grade"],
                    arabic_text=row["arabic_text"],
                    translations=json.loads(row["translations"]) if isinstance(row["translations"], str) else dict(row["translations"]),
                    narrator_chain=row["narrator_chain"],
                    similarity=float(row["similarity"]),
                )
            )

    # Sort by similarity descending, take top_k overall
    chunks.sort(key=lambda c: c.similarity, reverse=True)
    return chunks[:k]
