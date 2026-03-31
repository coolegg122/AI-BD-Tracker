"""Migration script to add email, hashed_password, and is_active columns to Supabase PostgreSQL users table."""
import os
import sys

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend"))

from sqlalchemy import text
from database import engine

def migrate():
    with engine.connect() as conn:
        # Check existing columns
        result = conn.execute(text(
            "SELECT column_name FROM information_schema.columns WHERE table_name = 'users'"
        ))
        existing_cols = [row[0] for row in result.fetchall()]
        print(f"Current users columns: {existing_cols}")

        # Add email column if it doesn't exist
        if "email" not in existing_cols:
            conn.execute(text("ALTER TABLE users ADD COLUMN email VARCHAR UNIQUE"))
            print("Added 'email' column.")
        else:
            print("'email' column already exists.")

        # Add hashed_password column if it doesn't exist
        if "hashed_password" not in existing_cols:
            conn.execute(text("ALTER TABLE users ADD COLUMN hashed_password VARCHAR"))
            print("Added 'hashed_password' column.")
        else:
            print("'hashed_password' column already exists.")

        # Add is_active column if it doesn't exist
        if "is_active" not in existing_cols:
            conn.execute(text("ALTER TABLE users ADD COLUMN is_active INTEGER DEFAULT 1"))
            print("Added 'is_active' column.")
        else:
            print("'is_active' column already exists.")

        conn.commit()
    print("Supabase users migration complete!")

if __name__ == "__main__":
    migrate()
