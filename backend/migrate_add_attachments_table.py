"""One-time migration: add 'attachments' table to the database."""
import sqlite3
import os
import datetime

db_path = os.path.join(os.path.dirname(__file__), "sql_app.db")
conn = sqlite3.connect(db_path)

# Create attachments table
conn.execute("""
CREATE TABLE IF NOT EXISTS attachments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER,
    name TEXT,
    file_type TEXT,
    category TEXT,
    url TEXT,
    uploaded_at TEXT,
    FOREIGN KEY (project_id) REFERENCES projects (id)
)
""")

print("SUCCESS: Created 'attachments' table.")

conn.commit()
conn.close()
print("Migration complete!")
