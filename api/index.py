import os
import sys

# Add the parent directory to the path so we can import the backend package
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from backend.main import app

# Vercel needs the app object to be named 'app'
# Since we imported from backend.main, it's already there as 'app'
