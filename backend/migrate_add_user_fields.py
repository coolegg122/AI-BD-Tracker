"""Migration script to add email, hashed_password, and is_active columns to users table."""
import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), "sql_app.db")
conn = sqlite3.connect(db_path)

# Check existing columns for users
cursor = conn.execute("PRAGMA table_info(users)")
user_cols = [row[1] for row in cursor.fetchall()]
print(f"Current users columns: {user_cols}")

# Add email column if it doesn't exist (without UNIQUE constraint initially)
if "email" not in user_cols:
    try:
        conn.execute('ALTER TABLE users ADD COLUMN email TEXT')
        print("Added 'email' column to users table.")
    except sqlite3.OperationalError as e:
        print(f"Could not add email column: {e}")
else:
    print("'email' column already exists.")

# Add hashed_password column if it doesn't exist
if "hashed_password" not in user_cols:
    try:
        conn.execute('ALTER TABLE users ADD COLUMN hashed_password TEXT')
        print("Added 'hashed_password' column to users table.")
    except sqlite3.OperationalError as e:
        print(f"Could not add hashed_password column: {e}")
else:
    print("'hashed_password' column already exists.")

# Add is_active column if it doesn't exist
if "is_active" not in user_cols:
    try:
        conn.execute('ALTER TABLE users ADD COLUMN is_active INTEGER DEFAULT 1')
        print("Added 'is_active' column to users table.")
    except sqlite3.OperationalError as e:
        print(f"Could not add is_active column: {e}")
else:
    print("'is_active' column already exists.")

conn.commit()
conn.close()
print("Migration complete!")