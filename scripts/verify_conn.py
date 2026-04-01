"""Test direct (non-pooler) Postgres connectivity. Set DATABASE_URL or POSTGRES_URL in .env."""
import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.sql import text

_root = Path(__file__).resolve().parent.parent
load_dotenv(_root / ".env")
load_dotenv(_root / "backend" / ".env")

DB_URL = os.getenv("DATABASE_URL") or os.getenv("POSTGRES_URL")
if not DB_URL:
    raise SystemExit("Set DATABASE_URL or POSTGRES_URL (e.g. in .env or backend/.env)")

if DB_URL.startswith("postgres://"):
    DB_URL = DB_URL.replace("postgres://", "postgresql://", 1)

try:
    engine = create_engine(DB_URL)
    with engine.connect() as conn:
        result = conn.execute(text("SELECT version();"))
        print(f"Success! Connected to Postgres: {result.first()[0]}")
except Exception as e:
    print(f"Failed to connect: {e}")
