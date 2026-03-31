"""One-time migration: add 'details' JSON column to projects and contacts tables."""
import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), "sql_app.db")
conn = sqlite3.connect(db_path)

# Check existing columns for projects
cursor = conn.execute("PRAGMA table_info(projects)")
project_cols = [row[1] for row in cursor]
print(f"Current projects columns: {project_cols}")

if "details" not in project_cols:
    conn.execute('ALTER TABLE projects ADD COLUMN details JSON DEFAULT \'{}\'')
    print("Added 'details' column to projects table.")
else:
    print("projects.details already exists.")

# Check existing columns for contacts
cursor = conn.execute("PRAGMA table_info(contacts)")
contact_cols = [row[1] for row in cursor]
print(f"Current contacts columns: {contact_cols}")

if "details" not in contact_cols:
    conn.execute('ALTER TABLE contacts ADD COLUMN details JSON DEFAULT \'{}\'')
    print("Added 'details' column to contacts table.")
else:
    print("contacts.details already exists.")

conn.commit()
conn.close()
print("Migration complete!")
