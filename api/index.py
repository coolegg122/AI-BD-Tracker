import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Add backend to path
backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
sys.path.insert(0, backend_path)

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Import the FastAPI app
from main import app as backend_app

# Add CORS middleware for Vercel
backend_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Export for Vercel - MUST be named 'app', 'application', or 'handler'
app = backend_app
