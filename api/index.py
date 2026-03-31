import sys
import os
import traceback

# Add backend to path
backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
sys.path.insert(0, backend_path)

from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

# Create app with debug endpoint
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/debug")
async def debug():
    """Debug endpoint to check environment and database connection"""
    db_url = os.getenv("DATABASE_URL") or os.getenv("POSTGRES_URL") or os.getenv("POSTGRES_URL_NON_POOLING") or "NOT SET"
    
    # Mask sensitive parts
    if db_url and db_url != "NOT SET":
        # Show only the host part
        try:
            if "@" in db_url:
                masked = db_url.split("@")[1][:50] + "..."
            else:
                masked = db_url[:50] + "..."
        except:
            masked = "ERROR_MASKING"
    else:
        masked = db_url
    
    result = {
        "status": "debug",
        "env_vars": {
            "DATABASE_URL": "SET" if os.getenv("DATABASE_URL") else "NOT SET",
            "POSTGRES_URL": "SET" if os.getenv("POSTGRES_URL") else "NOT SET",
            "POSTGRES_URL_NON_POOLING": "SET" if os.getenv("POSTGRES_URL_NON_POOLING") else "NOT SET",
            "SECRET_KEY": "SET" if os.getenv("SECRET_KEY") else "NOT SET",
            "masked_db_url": masked
        },
        "python_version": sys.version,
        "path": sys.path[:5],
    }
    
    # Try to connect to database
    try:
        from database import engine, SessionLocal
        from sqlalchemy import text
        
        # Test connection
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            result["database_connection"] = "SUCCESS"
            
        # Check if users table exists
        with SessionLocal() as session:
            from sqlalchemy import text
            res = session.execute(text("SELECT COUNT(*) FROM users"))
            count = res.scalar()
            result["users_count"] = count
            
    except Exception as e:
        result["database_connection"] = f"FAILED: {str(e)}"
        result["database_error_type"] = type(e).__name__
        result["database_traceback"] = traceback.format_exc()
    
    return JSONResponse(result)

@app.get("/api/test")
async def test():
    """Simple test endpoint"""
    return JSONResponse({"status": "ok", "message": "API is working"})

# Import the main app routes
try:
    from main import app as main_app
    
    # Copy all routes from main_app
    for route in main_app.routes:
        if route.path not in ["/api/debug", "/api/test", "/docs", "/openapi.json"]:
            app.routes.append(route)
            
except Exception as e:
    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
    async def fallback(path: str):
        return JSONResponse({
            "error": "Failed to import main app",
            "message": str(e),
            "traceback": traceback.format_exc()
        })