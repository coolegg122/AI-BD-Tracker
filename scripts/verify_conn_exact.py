import os
from sqlalchemy import create_engine
from sqlalchemy.sql import text

# Database URL from user
DB_URL = "postgresql://postgres:rexkzYe3qMoQjkyz@db.wleslkkvwmuocqhhwgtd.supabase.co:5432/postgres"

try:
    engine = create_engine(DB_URL)
    with engine.connect() as conn:
        result = conn.execute(text("SELECT version();"))
        print(f"Success! Connected: {result.first()[0]}")
except Exception as e:
    print(f"Failed to connect: {e}")
