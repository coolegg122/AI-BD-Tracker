import os
from sqlalchemy import create_engine
from sqlalchemy.sql import text

# Derived from ap-southeast-1 region based on IPv6 prefix
DB_URL_V4 = "postgresql://postgres.wleslkkvwmuocqhhwgtd:rexkzYe3qMoQjkyz@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require"

try:
    engine = create_engine(DB_URL_V4)
    with engine.connect() as conn:
        result = conn.execute(text("SELECT version();"))
        print(f"Success! Connected via IPv4 Pooler: {result.first()[0]}")
except Exception as e:
    print(f"Failed to connect: {e}")
