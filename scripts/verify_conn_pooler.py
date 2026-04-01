"""
Try multiple pooler URLs until one succeeds.
Set POOLER_TEST_URLS to a comma-separated list, or rely on a single DATABASE_URL / POSTGRES_URL.
"""
import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.sql import text

_root = Path(__file__).resolve().parent.parent
load_dotenv(_root / ".env")
load_dotenv(_root / "backend" / ".env")


def test_conn(url: str) -> bool:
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    try:
        engine = create_engine(url, pool_pre_ping=True)
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version();"))
            print(f"Success with {url.split('@')[-1]}! Version: {result.first()[0]}")
            return True
    except Exception as e:
        print(f"Failed with {url.split('@')[-1]}: {e}\n")
        return False


raw = os.getenv("POOLER_TEST_URLS", "").strip()
if raw:
    urls = [u.strip() for u in raw.split(",") if u.strip()]
else:
    single = os.getenv("DATABASE_URL") or os.getenv("POSTGRES_URL")
    if not single:
        raise SystemExit(
            "Set POOLER_TEST_URLS (comma-separated) or DATABASE_URL / POSTGRES_URL"
        )
    urls = [single]

for url in urls:
    if test_conn(url):
        break
else:
    print("No working URL in list.")
