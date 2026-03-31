import sys
import os
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

# Import only essential modules first
try:
    import database
    import models
    import schemas
    import auth
    from sqlalchemy.orm import Session
    from fastapi import Depends, HTTPException, status
    
    # Create a minimal FastAPI app with just auth routes
    app = FastAPI(title="AI-BD Tracker API")
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Import auth functions
    from auth import authenticate_user, create_access_token, get_current_active_user, get_password_hash
    
    # Register route
    @app.post("/api/v1/auth/register", response_model=schemas.UserResponse)
    def register_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
        existing_user = db.query(models.User).filter(
            (models.User.email == user.email) | (models.User.name == user.name)
        ).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="User already exists")
        hashed_password = get_password_hash(user.password)
        db_user = models.User(
            name=user.name, email=user.email, role=user.role,
            initials=user.initials, hashed_password=hashed_password
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    
    # Login route
    @app.post("/api/v1/auth/login")
    def login_user(user_credentials: schemas.UserLogin, db: Session = Depends(database.get_db)):
        user = authenticate_user(db, user_credentials.email, user_credentials.password)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        access_token = create_access_token(data={"sub": user.email})
        return {"access_token": access_token, "token_type": "bearer"}
    
    # Test route
    @app.get("/api/v1/test")
    def test():
        return {"status": "ok"}
    
except Exception as e:
    # Fallback app showing error
    app = FastAPI()
    
    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
    async def show_error(path: str):
        return JSONResponse({
            "error": "Import failed",
            "exception": str(e),
            "traceback": traceback.format_exc()
        })