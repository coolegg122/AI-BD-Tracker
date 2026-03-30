import os
from sqlalchemy import create_engine
from sqlalchemy.sql import text

def test_conn(url):
    try:
        engine = create_engine(url)
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version();"))
            print(f"Success with {url}! Version: {result.first()[0]}")
            return True
    except Exception as e:
        print(f"Failed with {url}: {e}\n")
        return False

urls = [
    "postgresql://postgres.wleslkkvwmuocqhhwgtd:rexkzYe3qMoQjkyz@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres",
    "postgresql://postgres.wleslkkvwmuocqhhwgtd:rexkzYe3qMoQjkyz@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres",
    "postgresql://postgres.wleslkkvwmuocqhhwgtd:rexkzYe3qMoQjkyz@aws-0-ap-east-1.pooler.supabase.com:6543/postgres",
    "postgresql://postgres.wleslkkvwmuocqhhwgtd:rexkzYe3qMoQjkyz@pooler.supabase.com:6543/postgres"
]

for url in urls:
    if test_conn(url):
        break
