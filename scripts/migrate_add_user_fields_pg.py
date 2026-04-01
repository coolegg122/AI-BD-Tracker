"""Migration script to add email, hashed_password, and is_active columns to the users table.
Supports both SQLite (via recreation) and PostgreSQL (via ALTER TABLE).
"""
import os
import sys

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend"))

from sqlalchemy import text, Table, MetaData, Column, String, Integer
from database import engine, Base
import models

def migrate():
    with engine.connect() as conn:
        print(f"Using dialect: {engine.dialect.name}")
        
        # Check if users table exists
        if engine.dialect.name == "sqlite":
            result = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table' AND name='users'"))
            table_exists = result.fetchone() is not None
        else:
            result = conn.execute(text("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users')"))
            table_exists = result.fetchone()[0]

        if not table_exists:
            print("Users table does not exist. Creating via models...")
            models.User.__table__.create(engine)
            print("Table created.")
            return

        # Check existing columns
        if engine.dialect.name == "sqlite":
            result = conn.execute(text("PRAGMA table_info(users)"))
            existing_cols = [row[1] for row in result.fetchall()]
        else:
            result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'"))
            existing_cols = [row[0] for row in result.fetchall()]
        
        print(f"Current users columns: {existing_cols}")

        # Columns to add
        cols_to_add = [
            ("email", "VARCHAR"),
            ("hashed_password", "VARCHAR"),
            ("is_active", "INTEGER DEFAULT 1")
        ]

        for col_name, col_type in cols_to_add:
            if col_name not in existing_cols:
                print(f"Adding column '{col_name}'...")
                try:
                    # SQLite doesn't support UNIQUE in ALTER TABLE ADD COLUMN.
                    # We add it without UNIQUE first.
                    alter_stmt = f"ALTER TABLE users ADD COLUMN {col_name} {col_type}"
                    conn.execute(text(alter_stmt))
                    print(f"Added '{col_name}' successfully.")
                except Exception as e:
                    print(f"Failed to add '{col_name}': {e}")
            else:
                print(f"Column '{col_name}' already exists.")

        conn.commit()
    print("Migration complete!")

if __name__ == "__main__":
    migrate()
