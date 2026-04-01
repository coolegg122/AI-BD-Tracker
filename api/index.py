import sys
import os

# Add the backend directory to Python path so we can import from it
backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
sys.path.insert(0, backend_path)

# Import the full application — all routes, auth, projects, contacts, users/me, etc.
# sqladmin is conditionally disabled in main.py when VERCEL env var is set,
# preventing the cold-start DDL timeout against Supabase's transaction pooler (Phase 17).
from main import app  # noqa: F401 — Vercel picks up `app` as the ASGI handler
