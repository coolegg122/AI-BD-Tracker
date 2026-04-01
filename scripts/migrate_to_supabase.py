import os
import sys

# Ensure backend modules can be imported
base_dir = os.path.join(os.path.dirname(__file__), '..')
sys.path.append(base_dir)
sys.path.append(os.path.join(base_dir, 'backend'))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.models import (
    Base, User, Project, Task, Contact, CareerHistory, 
    CompanyIntelligence, ProjectHistory, Attachment, Catalyst, PendingIngestion
)

# Connect to Local SQLite (consistent with backend/database.py)
local_db_path = os.path.join(base_dir, "backend", "sql_app.db")
LOCAL_DB_URL = f"sqlite:///{local_db_path}"
local_engine = create_engine(LOCAL_DB_URL)
LocalSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=local_engine)

# ==============================================================
# IMPORTANT: Put the Supabase IPv4 Pooler connection string here
# ==============================================================
CLOUD_DB_URL = os.getenv("SUPABASE_DB_URL") or os.getenv("DATABASE_URL")

if not CLOUD_DB_URL:
    print("Error: Please set SUPABASE_DB_URL environment variable with the IPv4 Pooler URL.")
    sys.exit(1)

# Connect to Supabase Postgres
cloud_engine = create_engine(CLOUD_DB_URL, pool_pre_ping=True)
CloudSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=cloud_engine)

def migrate_data():
    print("🚀 Starting data migration from local SQLite to Supabase Postgres...")

    # 1. Create tables in Supabase if they don't exist
    print("1. Creating schemas in Supabase (if missing)...")
    Base.metadata.create_all(bind=cloud_engine)

    local_db = LocalSessionLocal()
    cloud_db = CloudSessionLocal()

    try:
        # Define the models and their order (dependencies first)
        models_to_migrate = [
            (User, "Users"),
            (Project, "Projects"),
            (Task, "Tasks"),
            (Contact, "Contacts"),
            (CareerHistory, "Career Histories"),
            (ProjectHistory, "Project Histories"),
            (Attachment, "Attachments"),
            (Catalyst, "Catalysts"),
            (CompanyIntelligence, "AI Intelligence"),
            (PendingIngestion, "AI Ingestions")
        ]

        # 2. Reading and Migrating local data
        for model_class, description in models_to_migrate:
            print(f"2. Pulling local {description}...")
            records = local_db.query(model_class).all()
            print(f"3. Migrating {len(records)} {description}...")
            
            for record in records:
                # detach from local session
                local_db.expunge(record)
                # merge into cloud session (handles updates/inserts via PK)
                cloud_db.merge(record)
            
            # Optional: commit after each table for large migrations
            cloud_db.flush()

        # 4. Final Commit to cloud
        print("4. Committing all transactions to Supabase...")
        cloud_db.commit()
        print("✅ Cloud Synchronization Completed Successfully!")

    except Exception as e:
        cloud_db.rollback()
        print(f"❌ Migration Failed: {str(e)}")
    finally:
        local_db.close()
        cloud_db.close()

if __name__ == "__main__":
    migrate_data()
