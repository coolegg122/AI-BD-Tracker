import sys
import os
import traceback
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

# Add backend to path
backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
sys.path.insert(0, backend_path)

# Create fallback app for error handling
fallback_app = FastAPI()

@fallback_app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def show_import_error(path: str):
    return JSONResponse({
        "error": "Backend import failed",
        "exception": str(import_error) if 'import_error' in globals() else "Unknown",
        "traceback": import_traceback if 'import_traceback' in globals() else ""
    })

# Try to import backend app
try:
    from main import app as backend_app
    
    # Add CORS middleware
    backend_app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Use backend app
    app = backend_app
    
except Exception as e:
    import_error = str(e)
    import_traceback = traceback.format_exc()
    app = fallback_app