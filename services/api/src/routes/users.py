"""User registration, login, and profile endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field

from ..database import get_pool
from ..auth import (
    hash_password, verify_password,
    create_access_token, create_refresh_token,
    get_current_user,
)

router = APIRouter()


class RegisterRequest(BaseModel):
    email: EmailStr
    display_name: str = Field(..., min_length=2, max_length=100)
    password: str = Field(..., min_length=8, max_length=128)
    preferred_language: str = "en"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


@router.post("/users/register", response_model=TokenResponse, status_code=201)
async def register(body: RegisterRequest):
    pool = await get_pool()

    existing = await pool.fetchval(
        "SELECT 1 FROM users WHERE email = $1", body.email
    )
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    hashed = hash_password(body.password)
    row = await pool.fetchrow(
        """
        INSERT INTO users (email, display_name, preferred_language)
        VALUES ($1, $2, $3)
        RETURNING id::text, role
        """,
        body.email, body.display_name, body.preferred_language,
    )

    # Store hashed password in a separate auth table (not shown in main schema for brevity)
    # In production use Supabase Auth or Auth0 for this
    await pool.execute(
        """
        CREATE TABLE IF NOT EXISTS user_credentials (
            user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
            password_hash TEXT NOT NULL
        )
        """,
    )
    await pool.execute(
        "INSERT INTO user_credentials (user_id, password_hash) VALUES ($1::uuid, $2)",
        row["id"], hashed,
    )

    access = create_access_token(row["id"], row["role"])
    refresh = create_refresh_token(row["id"])
    return TokenResponse(access_token=access, refresh_token=refresh)


@router.post("/users/login", response_model=TokenResponse)
async def login(body: LoginRequest):
    pool = await get_pool()

    row = await pool.fetchrow(
        """
        SELECT u.id::text, u.role, uc.password_hash
        FROM users u
        JOIN user_credentials uc ON uc.user_id = u.id
        WHERE u.email = $1 AND u.is_active = TRUE
        """,
        body.email,
    )
    if not row or not verify_password(body.password, row["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    await pool.execute(
        "UPDATE users SET last_login_at = NOW() WHERE id = $1::uuid", row["id"]
    )

    access = create_access_token(row["id"], row["role"])
    refresh = create_refresh_token(row["id"])
    return TokenResponse(access_token=access, refresh_token=refresh)


@router.get("/users/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    pool = await get_pool()
    row = await pool.fetchrow(
        """
        SELECT id::text, email, display_name, preferred_language,
               role, created_at, last_login_at
        FROM users WHERE id = $1::uuid
        """,
        current_user["sub"],
    )
    if not row:
        raise HTTPException(status_code=404, detail="User not found")
    return dict(row)


@router.get("/users/me/saved")
async def get_saved(current_user: dict = Depends(get_current_user)):
    pool = await get_pool()
    rows = await pool.fetch(
        """
        SELECT s.id::text as save_id, a.id::text as answer_id,
               q.question_text, a.answer_text, a.confidence, s.created_at
        FROM saved_items s
        JOIN answers a ON a.id = s.answer_id
        JOIN questions q ON q.id = a.question_id
        WHERE s.user_id = $1::uuid
        ORDER BY s.created_at DESC
        """,
        current_user["sub"],
    )
    return [dict(r) for r in rows]


@router.post("/users/me/saved", status_code=201)
async def save_item(
    body: dict,
    current_user: dict = Depends(get_current_user),
):
    answer_id = body.get("answer_id")
    if not answer_id:
        raise HTTPException(status_code=400, detail="answer_id required")

    pool = await get_pool()
    exists = await pool.fetchval(
        "SELECT 1 FROM answers WHERE id = $1::uuid", answer_id
    )
    if not exists:
        raise HTTPException(status_code=404, detail="Answer not found")

    row = await pool.fetchrow(
        """
        INSERT INTO saved_items (user_id, answer_id)
        VALUES ($1::uuid, $2::uuid)
        ON CONFLICT (user_id, answer_id) DO NOTHING
        RETURNING id::text
        """,
        current_user["sub"], answer_id,
    )
    return {"saved_id": row["id"] if row else None, "status": "saved"}
