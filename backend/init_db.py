"""
Initialize the database with all tables.
Run this script to create all tables defined in models.py
"""
from database import engine, Base
from models import User, Project, Attachment, Task, ProjectHistory, Catalyst, Contact, CareerHistory, CompanyIntelligence, PendingIngestion

def init_db():
    """Create all tables."""
    print("Creating all tables...")
    Base.metadata.create_all(bind=engine)
    print("Database initialization complete!")
    
    # Verify tables
    import sqlite3
    conn = sqlite3.connect('sqlite.db')
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cursor.fetchall()
    print("\nTables created:")
    for table in tables:
        print(f"  - {table[0]}")
    conn.close()

if __name__ == "__main__":
    init_db()
