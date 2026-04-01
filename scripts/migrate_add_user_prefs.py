import sqlite3
import os
import psycopg2
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '../backend/.env'))

def get_db_connection():
    db_url = os.getenv("DATABASE_URL") or os.getenv("POSTGRES_URL") or os.getenv("POSTGRES_URL_NON_POOLING")
    
    if not db_url or db_url.startswith("sqlite"):
        # Local SQLite
        db_path = os.path.join(os.path.dirname(__file__), '../backend/sql_app.db')
        print(f"Connecting to SQLite: {db_path}")
        return sqlite3.connect(db_path), "sqlite"
    else:
        # Cloud PostgreSQL (Supabase)
        print("Connecting to PostgreSQL (Supabase)...")
        # Ensure we use IPv4 pooler or direct connection
        return psycopg2.connect(db_url), "postgres"

def migrate():
    conn, db_type = get_db_connection()
    cursor = conn.cursor()

    try:
        if db_type == "sqlite":
            # Add notification_prefs
            try:
                cursor.execute("ALTER TABLE users ADD COLUMN notification_prefs JSON DEFAULT '{}'")
                print("Added notification_prefs column to SQLite.")
            except sqlite3.OperationalError as e:
                if "duplicate column name" in str(e).lower():
                    print("notification_prefs column already exists in SQLite.")
                else:
                    raise e

            # Add theme
            try:
                cursor.execute("ALTER TABLE users ADD COLUMN theme VARCHAR DEFAULT 'light'")
                print("Added theme column to SQLite.")
            except sqlite3.OperationalError as e:
                if "duplicate column name" in str(e).lower():
                    print("theme column already exists in SQLite.")
                else:
                    raise e
        else:
            # PostgreSQL
            # Add notification_prefs
            cursor.execute("""
                DO $$ 
                BEGIN 
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='notification_prefs') THEN
                        ALTER TABLE users ADD COLUMN notification_prefs JSONB DEFAULT '{}'::jsonb;
                    END IF;
                END $$;
            """)
            print("Checked/Added notification_prefs column to PostgreSQL.")

            # Add theme
            cursor.execute("""
                DO $$ 
                BEGIN 
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='theme') THEN
                        ALTER TABLE users ADD COLUMN theme VARCHAR DEFAULT 'light';
                    END IF;
                END $$;
            """)
            print("Checked/Added theme column to PostgreSQL.")

        conn.commit()
        print("Migration successful.")

    except Exception as e:
        print(f"Migration failed: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
