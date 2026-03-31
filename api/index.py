import sys
import os
import traceback
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

# Create a fallback app first
fallback_app = FastAPI()

@fallback_app.get("/api/debug")
async def debug():
    return JSONResponse({
        "status": "debug",
        "python_version": sys.version,
        "path": sys.path,
        "cwd": os.getcwd(),
        "files": os.listdir('.') if os.path.exists('.') else [],
        "backend_exists": os.path.exists('../backend'),
        "env_vars": {
            "SECRET_KEY": "SET" if os.getenv("SECRET_KEY") else "NOT SET",
            "POSTGRES_URL": "SET" if os.getenv("POSTGRES_URL") else "NOT SET",
            "DATABASE_URL": "SET" if os.getenv("DATABASE_URL") else "NOT SET",
        }
    })

@fallback_app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def catch_all(path: str):
    return JSONResponse({
        "error": "Backend import failed",
        "path": path,
        "message": "Check /api/debug for details"
    })

# Try to import the backend app
try:
    # Add backend to path
    backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
    sys.path.insert(0, backend_path)
    
    # Import the backend app
    from main import app as backend_app
    
    # Add CORS middleware
    backend_app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Use the backend app
    app = backend_app
    
except Exception as e:
    # Use the fallback app with error info
    @fallback_app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
    async def show_error(path: str):
        return JSONResponse({
            "error": "Backend import failed",
            "exception": str(e),
            "type": type(e).__name__,
            "traceback": traceback.format_exc(),
            "path": path,
            "debug_endpoint": "/api/debug"
        })
    
    app = fallback_app