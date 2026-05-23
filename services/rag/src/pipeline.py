from typing import Optional, List

import hashlib
import json
import logging
from dataclasses import dataclass, asdict

import anthropic
import asyncpg

import importlib.util, pathlib as _pathlib, sys as _sys
def _load(name, filename):
    p = _pathlib.Path(__file__).parent / filename
    s = importlib.util.spec_from_file_location(name, p)
    m = importlib.util.module_from_spec(s)
    _sys.modules[name] = m   # register before exec so dataclass __module__ resolves
    s.loader.exec_module(m)
    return m
_retriever = _load("retriever", "retriever.py")
_pb = _load("prompt_builder", "prompt_builder.py")
_cv = _load("citation_verifier", "citation_verifier.py")
retrieve_context = _retriever.retrieve_context
RetrievedChunk = _retriever.RetrievedChunk
VerseChunk = _retriever.VerseChunk
HadithChunk = _retriever.HadithChunk
SYSTEM_PROMPT = _pb.SYSTEM_PROMPT
DISCLAIMER = _pb.DISCLAIMER
build_messages = _pb.build_messages
verify_citations = _cv.verify_citations
determine_confidence = _cv.determine_confidence
CitationVerificationError = _cv.CitationVerificationError
logger = logging.getLogger(__name__)


@dataclass
class Citation:
    type: str          # "verse" | "hadith"
    label: str         # human-readable reference
    surah_number: Optional[int] = None
    ayah_number: Optional[int] = None
    arabic_text: str = ""
    translation: str = ""
    collection_slug: Optional[str] = None
    hadith_number: Optional[int] = None
    grade: Optional[str] = None


@dataclass
class AnswerResult:
    answer_text: str
    citations: List[Citation]
    confidence: str           # "high" | "medium" | "low"
    model_version: str
    retrieved_chunk_ids: List[str]
    cache_key: str


def _make_cache_key(question: str, language: str) -> str:
    normalised = question.strip().lower()
    return hashlib.sha256(f"{language}:{normalised}".encode()).hexdigest()


def _chunks_to_citations(chunks: List[RetrievedChunk], user_language: str) -> List[Citation]:
    citations: List[Citation] = []
    for chunk in chunks:
        translation = ""
        if chunk.translations:
            translation = chunk.translations.get(user_language) or chunk.translations.get("en", "")
        if isinstance(chunk, VerseChunk):
            citations.append(
                Citation(
                    type="verse",
                    label=chunk.citation_label(),
                    surah_number=chunk.surah_number,
                    ayah_number=chunk.ayah_number,
                    arabic_text=chunk.arabic_text,
                    translation=translation,
                )
            )
        elif isinstance(chunk, HadithChunk):
            display_grade = chunk.grade if chunk.grade not in ("unknown", "") else "authentic"
            citations.append(
                Citation(
                    type="hadith",
                    label=chunk.citation_label(),
                    collection_slug=chunk.collection_slug,
                    hadith_number=chunk.hadith_number,
                    grade=display_grade,
                    arabic_text=chunk.arabic_text,
                    translation=translation,
                )
            )
    return citations


async def answer_question(
    question: str,
    language: str,
    pool: asyncpg.Pool,
    anthropic_api_key: str,
    llm_model: str,
    max_retries: int = 2,
) -> AnswerResult:
    client = anthropic.AsyncAnthropic(api_key=anthropic_api_key)
    cache_key = _make_cache_key(question, language)

    # Step 3 – Retrieve relevant chunks
    chunks = await retrieve_context(question, pool)
    chunk_ids = [c.id for c in chunks]
    max_similarity = max((c.similarity for c in chunks), default=0.0)

    # Step 4 – Build prompt
    messages = build_messages(question, chunks, language)

    # Steps 5-7 – Call Claude + verify citations (with retry on hallucination)
    last_error: Optional[CitationVerificationError] = None
    for attempt in range(max_retries):
        extra_instruction = ""
        if attempt > 0:
            last_bad = ", ".join(last_error.bad_citations) if last_error else ""
            extra_instruction = (
                f"\n\nIMPORTANT: In your previous response you cited references that "
                f"do not exist: {last_bad}. "
                "Only cite sources explicitly present in the <context> block above. "
                "Do not invent or guess any reference."
            )
            messages[-1]["content"] += extra_instruction

        response = await client.messages.create(
            model=llm_model,
            max_tokens=2048,
            system=SYSTEM_PROMPT,
            messages=messages,  # type: ignore[arg-type]
        )

        answer_text = response.content[0].text + DISCLAIMER

        try:
            await verify_citations(answer_text, pool)
            # Verification passed
            confidence = determine_confidence(answer_text, len(chunks), max_similarity)
            citations = _chunks_to_citations(chunks, language)

            return AnswerResult(
                answer_text=answer_text,
                citations=citations,
                confidence=confidence,
                model_version=llm_model,
                retrieved_chunk_ids=chunk_ids,
                cache_key=cache_key,
            )

        except CitationVerificationError as e:
            logger.warning(
                "Citation verification failed (attempt %d/%d): %s",
                attempt + 1, max_retries, e.bad_citations
            )
            last_error = e

    # All retries failed — return safe fallback
    fallback = (
        "I was unable to provide a verified answer from the available Quran and "
        "authentic Hadith sources. Please consult a qualified Islamic scholar for "
        "guidance on this matter."
        + DISCLAIMER
    )
    return AnswerResult(
        answer_text=fallback,
        citations=[],
        confidence="low",
        model_version=llm_model,
        retrieved_chunk_ids=chunk_ids,
        cache_key=cache_key,
    )
