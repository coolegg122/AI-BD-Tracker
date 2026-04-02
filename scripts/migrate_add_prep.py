import os
import sys
from pathlib import Path
from sqlalchemy import create_engine, text

# Ensure backend modules can be imported
base_dir = os.path.join(os.path.dirname(__file__), '..')
sys.path.append(base_dir)
sys.path.append(os.path.join(base_dir, 'backend'))

from dotenv import load_dotenv
dotenv_path = os.path.join(base_dir, "backend", ".env")
load_dotenv(dotenv_path)

def migrate():
    # 1. Local SQLite
    local_db_path = os.path.join(base_dir, "backend", "sql_app.db")
    local_url = f"sqlite:///{local_db_path}"
    print(f"Migrating local SQLite: {local_db_path}")
    
    local_engine = create_engine(local_url)
    try:
        with local_engine.connect() as conn:
            # Check if column exists (SQLite specific check)
            columns = [row[1] for row in conn.execute(text("PRAGMA table_info(projects)")).fetchall()]
            if "negotiation_prep" not in columns:
                conn.execute(text("ALTER TABLE projects ADD COLUMN negotiation_prep JSON DEFAULT '{}'"))
                print("Added negotiation_prep to local projects table.")
            if "prep_updated_at" not in columns:
                conn.execute(text("ALTER TABLE projects ADD COLUMN prep_updated_at VARCHAR"))
                print("Added prep_updated_at to local projects table.")
            conn.commit()
    except Exception as e:
        print(f"Local migration skipped/failed: {e}")

    # 2. Cloud Supabase
    cloud_url = os.getenv("DATABASE_URL")
    if cloud_url:
        print("Migrating Cloud Supabase...")
        if cloud_url.startswith("postgres://"):
            cloud_url = cloud_url.replace("postgres://", "postgresql://", 1)
        
        cloud_engine = create_engine(cloud_url)
        try:
            with cloud_engine.connect() as conn:
                # PostgreSQL check
                conn.execute(text("ALTER TABLE projects ADD COLUMN IF NOT EXISTS negotiation_prep JSONB DEFAULT '{}'"))
                conn.execute(text("ALTER TABLE projects ADD COLUMN IF NOT EXISTS prep_updated_at VARCHAR"))
                conn.commit()
                print("Cloud Supabase migration completed.")
        except Exception as e:
            print(f"Cloud migration failed: {e}")
    else:
        print("No DATABASE_URL found, skipping cloud migration.")

if __name__ == "__main__":
    migrate()
