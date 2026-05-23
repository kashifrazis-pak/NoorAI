-- NoorAI Database Schema — Migration 001: Initial Setup
-- Enable pgvector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;  -- for full-text fuzzy search

-- ─────────────────────────────────────────────────────────────────────────────
-- ENUM TYPES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TYPE hadith_grade AS ENUM ('sahih', 'hasan', 'daif', 'mawdu', 'unknown');
CREATE TYPE user_role AS ENUM ('user', 'scholar', 'admin');
CREATE TYPE flag_status AS ENUM ('pending', 'reviewed', 'resolved', 'dismissed');
CREATE TYPE content_type AS ENUM ('hadith', 'verse');
CREATE TYPE confidence_level AS ENUM ('high', 'medium', 'low');

-- ─────────────────────────────────────────────────────────────────────────────
-- QURAN VERSES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE quran_verses (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    surah_number        SMALLINT NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
    surah_name_ar       VARCHAR(100) NOT NULL,
    surah_name_en       VARCHAR(100) NOT NULL,
    surah_name_transliteration VARCHAR(100),
    ayah_number         SMALLINT NOT NULL CHECK (ayah_number >= 1),
    arabic_text         TEXT NOT NULL,
    translations        JSONB NOT NULL DEFAULT '{}',
    -- e.g. {"en": "...", "ur": "...", "fr": "..."}
    juz_number          SMALLINT CHECK (juz_number BETWEEN 1 AND 30),
    hizb_number         SMALLINT,
    ruku_number         SMALLINT,
    is_sajda            BOOLEAN DEFAULT FALSE,
    embedding_vector    vector(1536),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (surah_number, ayah_number)
);

CREATE INDEX idx_quran_verses_surah ON quran_verses (surah_number);
CREATE INDEX idx_quran_verses_embedding ON quran_verses USING ivfflat (embedding_vector vector_cosine_ops)
    WITH (lists = 100);
CREATE INDEX idx_quran_verses_arabic_trgm ON quran_verses USING gin (arabic_text gin_trgm_ops);

-- ─────────────────────────────────────────────────────────────────────────────
-- HADITH COLLECTIONS METADATA
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE hadith_collections (
    id          SERIAL PRIMARY KEY,
    slug        VARCHAR(50) UNIQUE NOT NULL,  -- e.g. 'bukhari', 'muslim'
    name_en     VARCHAR(200) NOT NULL,
    name_ar     VARCHAR(200) NOT NULL,
    author      VARCHAR(200),
    total_hadith INTEGER,
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO hadith_collections (slug, name_en, name_ar, author, total_hadith) VALUES
    ('bukhari',  'Sahih al-Bukhari',       'صحيح البخاري',       'Muhammad ibn Ismail al-Bukhari', 7563),
    ('muslim',   'Sahih Muslim',           'صحيح مسلم',          'Muslim ibn al-Hajjaj',           7500),
    ('abudawud', 'Sunan Abu Dawud',        'سنن أبي داود',        'Abu Dawud al-Sijistani',         5274),
    ('tirmidhi', 'Jami al-Tirmidhi',       'جامع الترمذي',        'Muhammad ibn Isa al-Tirmidhi',   3956),
    ('nasai',    'Sunan al-Nasai',         'سنن النسائي',         'Ahmad ibn Shuayb al-Nasai',      5761),
    ('ibnmajah', 'Sunan Ibn Majah',        'سنن ابن ماجه',        'Ibn Majah al-Qazwini',           4341),
    ('malik',    'Muwatta Imam Malik',     'موطأ الإمام مالك',    'Malik ibn Anas',                 1720),
    ('ahmad',    'Musnad Ahmad ibn Hanbal','مسند أحمد بن حنبل',   'Ahmad ibn Hanbal',               27000);

-- ─────────────────────────────────────────────────────────────────────────────
-- HADITH
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE hadith (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    collection_slug     VARCHAR(50) NOT NULL REFERENCES hadith_collections(slug),
    book_number         INTEGER NOT NULL,
    book_name_en        VARCHAR(300),
    book_name_ar        VARCHAR(300),
    hadith_number       INTEGER NOT NULL,
    grade               hadith_grade NOT NULL DEFAULT 'unknown',
    grade_source        VARCHAR(200),  -- who graded it, e.g. 'al-Albani', 'Tirmidhi himself'
    arabic_text         TEXT NOT NULL,
    narrator_chain      TEXT,          -- isnad
    translations        JSONB NOT NULL DEFAULT '{}',
    topics              TEXT[],        -- searchable topic tags
    embedding_vector    vector(1536),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (collection_slug, hadith_number)
);

CREATE INDEX idx_hadith_collection ON hadith (collection_slug);
CREATE INDEX idx_hadith_grade ON hadith (grade);
CREATE INDEX idx_hadith_grade_collection ON hadith (collection_slug, grade);
CREATE INDEX idx_hadith_embedding ON hadith USING ivfflat (embedding_vector vector_cosine_ops)
    WITH (lists = 200);
CREATE INDEX idx_hadith_arabic_trgm ON hadith USING gin (arabic_text gin_trgm_ops);
CREATE INDEX idx_hadith_topics ON hadith USING gin (topics);

-- ─────────────────────────────────────────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE users (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email               VARCHAR(320) UNIQUE,
    display_name        VARCHAR(100),
    preferred_language  VARCHAR(10) NOT NULL DEFAULT 'en',
    role                user_role NOT NULL DEFAULT 'user',
    email_verified      BOOLEAN DEFAULT FALSE,
    is_active           BOOLEAN DEFAULT TRUE,
    scholar_bio         TEXT,          -- populated for scholar accounts
    scholar_approved_at TIMESTAMPTZ,
    scholar_approved_by UUID REFERENCES users(id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at       TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_role ON users (role);

-- ─────────────────────────────────────────────────────────────────────────────
-- QUESTIONS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE questions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    question_text   TEXT NOT NULL,
    language        VARCHAR(10) NOT NULL DEFAULT 'en',
    ip_hash         VARCHAR(64),  -- hashed, deleted after 24h
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_questions_user ON questions (user_id);
CREATE INDEX idx_questions_created ON questions (created_at);

-- ─────────────────────────────────────────────────────────────────────────────
-- ANSWERS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE answers (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id             UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    answer_text             TEXT NOT NULL,
    citations               JSONB NOT NULL DEFAULT '[]',
    -- [{"type":"verse","surah":2,"ayah":286,"text_ar":"...","text_en":"..."},
    --  {"type":"hadith","collection":"bukhari","hadith_number":47,"grade":"sahih","text_ar":"..."}]
    confidence              confidence_level NOT NULL DEFAULT 'medium',
    model_version           VARCHAR(100) NOT NULL,
    retrieved_chunk_ids     JSONB DEFAULT '[]',  -- UUIDs of quran_verses/hadith used
    verified_by_scholar     UUID REFERENCES users(id),
    verified_at             TIMESTAMPTZ,
    scholar_notes           TEXT,
    is_cached               BOOLEAN DEFAULT FALSE,
    cache_key               VARCHAR(512) UNIQUE,  -- hash of normalised question
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_answers_question ON answers (question_id);
CREATE INDEX idx_answers_cache_key ON answers (cache_key);
CREATE INDEX idx_answers_verified ON answers (verified_by_scholar) WHERE verified_by_scholar IS NOT NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- FLAGS (user-reported issues with answers)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE flags (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    answer_id       UUID NOT NULL REFERENCES answers(id) ON DELETE CASCADE,
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    reason          TEXT NOT NULL,
    status          flag_status NOT NULL DEFAULT 'pending',
    scholar_notes   TEXT,
    reviewed_by     UUID REFERENCES users(id),
    reviewed_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_flags_answer ON flags (answer_id);
CREATE INDEX idx_flags_status ON flags (status);

-- ─────────────────────────────────────────────────────────────────────────────
-- SAVED ITEMS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE saved_items (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    answer_id   UUID NOT NULL REFERENCES answers(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, answer_id)
);

CREATE INDEX idx_saved_items_user ON saved_items (user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- DAILY CONTENT (Hadith of the Day / Verse of the Day)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE daily_content (
    id              SERIAL PRIMARY KEY,
    type            content_type NOT NULL,
    content_id      UUID NOT NULL,  -- quran_verses.id or hadith.id
    scheduled_date  DATE NOT NULL,
    language        VARCHAR(10) NOT NULL DEFAULT 'en',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (scheduled_date, language, type)
);

CREATE INDEX idx_daily_content_date ON daily_content (scheduled_date, language);

-- ─────────────────────────────────────────────────────────────────────────────
-- UPDATED_AT auto-trigger helper
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_quran_verses_updated_at
    BEFORE UPDATE ON quran_verses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_hadith_updated_at
    BEFORE UPDATE ON hadith
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
