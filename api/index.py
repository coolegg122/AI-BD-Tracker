import os
import sys
import traceback
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

# Add backend to path
backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
sys.path.insert(0, backend_path)

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

try:
    # Import the FastAPI app
    from main import app as fastapi_app
    
    # Add CORS middleware for Vercel
    fastapi_app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Export for Vercel
    app = fastapi_app
    
except Exception as e:
    # Create a fallback app that shows the error
    app = FastAPI()
    
    @app.get("/{path:path}")
    async def error_handler(path: str):
        return JSONResponse(
            status_code=500,
            content={
                "detail": f"Server initialization error: {str(e)}",
                "type": type(e).__name__,
                "traceback": traceback.format_exc()
            }
        )
