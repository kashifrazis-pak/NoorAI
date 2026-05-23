-- NoorAI Database Schema — Migration 002: Tafsir, Duas, Seerah

-- ─────────────────────────────────────────────────────────────────────────────
-- TAFSIR (Quranic Commentary)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tafsir (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    surah_number        SMALLINT NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
    ayah_number         SMALLINT NOT NULL CHECK (ayah_number >= 1),
    tafsir_slug         VARCHAR(50) NOT NULL,   -- e.g. 'ibn-kathir'
    tafsir_name_en      VARCHAR(150) NOT NULL,
    scholar_name        VARCHAR(150),
    text                TEXT NOT NULL,
    language            VARCHAR(10) NOT NULL DEFAULT 'en',
    embedding_vector    vector(1536),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (surah_number, ayah_number, tafsir_slug, language)
);

CREATE INDEX IF NOT EXISTS idx_tafsir_surah_ayah ON tafsir (surah_number, ayah_number);
CREATE INDEX IF NOT EXISTS idx_tafsir_slug ON tafsir (tafsir_slug);
CREATE INDEX IF NOT EXISTS idx_tafsir_embedding ON tafsir
    USING ivfflat (embedding_vector vector_cosine_ops) WITH (lists = 100);

-- ─────────────────────────────────────────────────────────────────────────────
-- DUAS (Supplications — Hisnul Muslim)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS duas (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category            VARCHAR(150) NOT NULL,   -- e.g. 'Morning', 'Before Sleep'
    title               VARCHAR(255),
    arabic_text         TEXT NOT NULL,
    transliteration     TEXT,
    translations        JSONB NOT NULL DEFAULT '{}',  -- {"en": "...", "ur": "..."}
    source              VARCHAR(255),   -- e.g. 'Sahih al-Bukhari 6306'
    reference           VARCHAR(255),
    embedding_vector    vector(1536),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_duas_category ON duas (category);
CREATE INDEX IF NOT EXISTS idx_duas_embedding ON duas
    USING ivfflat (embedding_vector vector_cosine_ops) WITH (lists = 50);

-- ─────────────────────────────────────────────────────────────────────────────
-- SEERAH (Prophet's Biography chapters)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS seerah (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_title          VARCHAR(255) NOT NULL,  -- e.g. 'Ar-Raheeq Al-Makhtum'
    chapter_number      SMALLINT NOT NULL,
    chapter_title       VARCHAR(255) NOT NULL,
    content             TEXT NOT NULL,
    language            VARCHAR(10) NOT NULL DEFAULT 'en',
    embedding_vector    vector(1536),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (book_title, chapter_number, language)
);

CREATE INDEX IF NOT EXISTS idx_seerah_book ON seerah (book_title);
CREATE INDEX IF NOT EXISTS idx_seerah_embedding ON seerah
    USING ivfflat (embedding_vector vector_cosine_ops) WITH (lists = 50);
