import os
import sys

# Ensure backend modules can be imported
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.models import Base, Project, Task, Contact, CareerHistory, CompanyIntelligence

# Connect to Local SQLite
LOCAL_DB_URL = "sqlite:///./backend/sql_app.db"
local_engine = create_engine(LOCAL_DB_URL)
LocalSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=local_engine)

# ==============================================================
# IMPORTANT: Put the Supabase IPv4 Pooler connection string here
# ==============================================================
# e.g.: postgresql://postgres.wleslkkvwmuocqhhwgtd:PASSWORD@aws-0-xxxx.pooler.supabase.com:6543/postgres?sslmode=require
CLOUD_DB_URL = os.getenv("SUPABASE_DB_URL") 

if not CLOUD_DB_URL:
    print("Error: Please set SUPABASE_DB_URL environment variable with the IPv4 Pooler URL.")
    sys.exit(1)

# Connect to Supabase Postgres
# Use pool_pre_ping=True to prevent stale connections
cloud_engine = create_engine(CLOUD_DB_URL, pool_pre_ping=True)
CloudSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=cloud_engine)

def migrate_data():
    print("🚀 Starting data migration from local SQLite to Supabase Postgres...")

    # 1. Create tables in Supabase if they don't exist
    print("1. Creating schemas in Supabase...")
    Base.metadata.create_all(bind=cloud_engine)

    local_db = LocalSessionLocal()
    cloud_db = CloudSessionLocal()

    try:
        # 2. Query all local data
        print("2. Reading local data...")
        projects = local_db.query(Project).all()
        tasks = local_db.query(Task).all()
        contacts = local_db.query(Contact).all()
        histories = local_db.query(CareerHistory).all()
        intel = local_db.query(CompanyIntelligence).all()
        
        # 3. Insert into Supabase (Wiping first to avoid duplicates, though ID collisions may still occur if we aren't careful. For a clean slate, this is safe.)
        
        # Merge instead of insert to keep IDs the same
        print(f"3. Migrating {len(projects)} Projects and {len(tasks)} Tasks...")
        for p in projects:
            # detach from local session
            local_db.expunge(p)
            cloud_db.merge(p)
            
        for t in tasks:
            local_db.expunge(t)
            cloud_db.merge(t)
            
        print(f"4. Migrating {len(contacts)} Contacts and {len(histories)} Career Histories...")
        for c in contacts:
            local_db.expunge(c)
            cloud_db.merge(c)
            
        for h in histories:
            local_db.expunge(h)
            cloud_db.merge(h)
            
        print(f"5. Migrating {len(intel)} Company Intelligence records...")
        for i in intel:
            local_db.expunge(i)
            cloud_db.merge(i)

        # Commit to cloud
        print("6. Committing to Supabase...")
        cloud_db.commit()
        print("✅ Migration Completed Successfully!")

    except Exception as e:
        cloud_db.rollback()
        print(f"❌ Migration Failed: {str(e)}")
    finally:
        local_db.close()
        cloud_db.close()

if __name__ == "__main__":
    migrate_data()
