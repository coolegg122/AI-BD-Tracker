"""
Vercel Serverless Function Entry Point
This file must export a FastAPI app as 'app'
"""
import os
import sys
import traceback

# Add backend to path
backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

try:
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    # Import FastAPI and middleware
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    
    # Import the backend app
    from main import app as backend_app
    
    # Add CORS middleware for Vercel
    backend_app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Export for Vercel
    app = backend_app
    
except Exception as e:
    # If import fails, create a minimal app that shows the error
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse
    
    app = FastAPI()
    
    @app.get("/{path:path}")
    async def show_error(path: str):
        return JSONResponse(
            status_code=500,
            content={
                "error": "Server initialization failed",
                "message": str(e),
                "type": type(e).__name__,
                "traceback": traceback.format_exc()
            }
        )
