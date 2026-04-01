"""Test IPv4 transaction pooler connectivity. Set DATABASE_URL or POSTGRES_URL (pooler :6543)."""
import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.sql import text

_root = Path(__file__).resolve().parent.parent
load_dotenv(_root / ".env")
load_dotenv(_root / "backend" / ".env")

DB_URL_V4 = os.getenv("DATABASE_URL") or os.getenv("POSTGRES_URL")
if not DB_URL_V4:
    raise SystemExit("Set DATABASE_URL or POSTGRES_URL to your Supabase pooler URL (port 6543).")

if DB_URL_V4.startswith("postgres://"):
    DB_URL_V4 = DB_URL_V4.replace("postgres://", "postgresql://", 1)

try:
    engine = create_engine(DB_URL_V4, pool_pre_ping=True)
    with engine.connect() as conn:
        result = conn.execute(text("SELECT version();"))
        print(f"Success! Connected via pooler: {result.first()[0]}")
except Exception as e:
    print(f"Failed to connect: {e}")
