import os
import sys
from pathlib import Path

# Ensure backend modules can be imported
base_dir = os.path.join(os.path.dirname(__file__), '..')
sys.path.append(base_dir)
sys.path.append(os.path.join(base_dir, 'backend'))

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.models import (
    Base, User, Project, Task, Contact, CareerHistory, 
    CompanyIntelligence, ProjectHistory, Attachment, Catalyst, PendingIngestion
)

# Load .env
dotenv_path = os.path.join(base_dir, "backend", ".env")
load_dotenv(dotenv_path)

# Connect to Local SQLite
local_db_path = os.path.join(base_dir, "backend", "sql_app.db")
LOCAL_DB_URL = f"sqlite:///{local_db_path}"
local_engine = create_engine(LOCAL_DB_URL)
LocalSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=local_engine)

# Connect to Cloud Supabase
CLOUD_DB_URL = os.getenv("DATABASE_URL")
if not CLOUD_DB_URL:
    print("Error: DATABASE_URL not found in .env")
    sys.exit(1)

if CLOUD_DB_URL.startswith("postgres://"):
    CLOUD_DB_URL = CLOUD_DB_URL.replace("postgres://", "postgresql://", 1)

cloud_engine = create_engine(CLOUD_DB_URL, pool_pre_ping=True)
CloudSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=cloud_engine)

def pull_data():
    print("🔄 Starting data sync from Cloud (Supabase) to Local (SQLite)...")
    
    # 1. Initialize local tables if they don't exist
    print("1. Ensuring local SQLite schema is ready...")
    Base.metadata.create_all(bind=local_engine)

    cloud_db = CloudSessionLocal()
    local_db = LocalSessionLocal()

    try:
        # Define models and their dependencies (parents before children)
        models_to_pull = [
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

        # 2. Reading from Cloud and Merging to Local
        for model_class, description in models_to_pull:
            print(f"2. Pulling cloud {description}...")
            records = cloud_db.query(model_class).all()
            print(f"3. Merging {len(records)} {description} into local DB...")
            
            # Optional: Clear local table first if you want an absolute mirror
            # local_db.query(model_class).delete()
            
            for record in records:
                # remove from cloud session
                cloud_db.expunge(record)
                # merge into local session (handles update/insert)
                local_db.merge(record)
            
            local_db.flush()

        # 4. Final Commit to local
        print("4. Committing all transactions to local SQLite...")
        local_db.commit()
        print("✅ Cloud-to-Local Synchronization Completed Successfully!")

    except Exception as e:
        local_db.rollback()
        print(f"❌ Sync Failed: {str(e)}")
    finally:
        cloud_db.close()
        local_db.close()

if __name__ == "__main__":
    pull_data()
