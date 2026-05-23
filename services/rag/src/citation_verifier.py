"""
Citation Verification Layer (Section 7.1, Step 9 of the build plan)

After the LLM generates a response, this module:
1. Parses all citations claimed in the response text
2. Verifies each one exists in the database
3. If any citation is fabricated, rejects the response and triggers regeneration
4. Returns a verified response or raises CitationVerificationError
"""
from __future__ import annotations

import re
import asyncpg
from dataclasses import dataclass


class CitationVerificationError(Exception):
    """Raised when the LLM has hallucinated a citation that doesn't exist in the DB."""
    def __init__(self, bad_citations: list[str]):
        self.bad_citations = bad_citations
        super().__init__(
            f"Response contains {len(bad_citations)} unverifiable citation(s): "
            + ", ".join(bad_citations)
        )


@dataclass
class ParsedVerseCitation:
    surah_number: int
    ayah_number: int
    raw: str


@dataclass
class ParsedHadithCitation:
    collection_slug: str
    hadith_number: int
    raw: str


COLLECTION_SLUG_MAP = {
    "sahih al-bukhari": "bukhari",
    "bukhari": "bukhari",
    "sahih muslim": "muslim",
    "muslim": "muslim",
    "sunan abu dawud": "abudawud",
    "abu dawud": "abudawud",
    "abudawud": "abudawud",
    "jami al-tirmidhi": "tirmidhi",
    "tirmidhi": "tirmidhi",
    "sunan al-nasai": "nasai",
    "nasai": "nasai",
    "sunan ibn majah": "ibnmajah",
    "ibn majah": "ibnmajah",
    "ibnmajah": "ibnmajah",
    "muwatta imam malik": "malik",
    "malik": "malik",
    "musnad ahmad": "ahmad",
    "ahmad": "ahmad",
}

# Patterns to match citations the LLM is instructed to use
# Quran: [Al-Baqarah, 2:286] or [Surah Al-Fatiha, 1:1]
QURAN_PATTERN = re.compile(
    r'\[(?:Surah\s+)?[^\],]+?,\s*(\d{1,3}):(\d{1,3})',
    re.IGNORECASE,
)

# Hadith: [Sahih al-Bukhari, Book 2, Hadith 47, Sahih]
HADITH_PATTERN = re.compile(
    r'\[([^,\]]+?),\s*Book\s+\d+,\s*Hadith\s+(\d+)',
    re.IGNORECASE,
)


def parse_citations(text: str) -> tuple[list[ParsedVerseCitation], list[ParsedHadithCitation]]:
    verse_citations: list[ParsedVerseCitation] = []
    hadith_citations: list[ParsedHadithCitation] = []

    for m in QURAN_PATTERN.finditer(text):
        verse_citations.append(
            ParsedVerseCitation(
                surah_number=int(m.group(1)),
                ayah_number=int(m.group(2)),
                raw=m.group(0),
            )
        )

    for m in HADITH_PATTERN.finditer(text):
        collection_raw = m.group(1).strip().lower()
        slug = COLLECTION_SLUG_MAP.get(collection_raw)
        if slug:
            hadith_citations.append(
                ParsedHadithCitation(
                    collection_slug=slug,
                    hadith_number=int(m.group(2)),
                    raw=m.group(0),
                )
            )

    return verse_citations, hadith_citations


async def verify_citations(
    response_text: str,
    pool: asyncpg.Pool,
) -> None:
    """
    Verify all citations in the response exist in the database.
    Raises CitationVerificationError if any are invalid.
    """
    verse_citations, hadith_citations = parse_citations(response_text)
    bad: list[str] = []

    for vc in verse_citations:
        row = await pool.fetchrow(
            "SELECT 1 FROM quran_verses WHERE surah_number=$1 AND ayah_number=$2",
            vc.surah_number,
            vc.ayah_number,
        )
        if not row:
            bad.append(f"Quran {vc.surah_number}:{vc.ayah_number}")

    for hc in hadith_citations:
        row = await pool.fetchrow(
            "SELECT 1 FROM hadith WHERE collection_slug=$1 AND hadith_number=$2",
            hc.collection_slug,
            hc.hadith_number,
        )
        if not row:
            bad.append(f"{hc.collection_slug} Hadith {hc.hadith_number}")

    if bad:
        raise CitationVerificationError(bad)


def determine_confidence(
    response_text: str,
    chunks_count: int,
    max_similarity: float,
) -> str:
    """Heuristic confidence scoring based on retrieval quality."""
    if "unable to find" in response_text.lower():
        return "low"
    if max_similarity >= 0.55 and chunks_count >= 3:
        return "high"
    if max_similarity >= 0.38:
        return "medium"
    return "low"
