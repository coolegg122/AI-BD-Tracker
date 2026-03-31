import sys
import os
import traceback
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

# Add backend to path
backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
sys.path.insert(0, backend_path)

# Create a simple app to test imports
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/v1/test-imports")
async def test_imports():
    """Test individual imports to find the problematic one"""
    results = {}
    
    try:
        import database
        results['database'] = 'SUCCESS'
    except Exception as e:
        results['database'] = f'FAILED: {str(e)}'
    
    try:
        import models
        results['models'] = 'SUCCESS'
    except Exception as e:
        results['models'] = f'FAILED: {str(e)}'
    
    try:
        import schemas
        results['schemas'] = 'SUCCESS'
    except Exception as e:
        results['schemas'] = f'FAILED: {str(e)}'
    
    try:
        import auth
        results['auth'] = 'SUCCESS'
    except Exception as e:
        results['auth'] = f'FAILED: {str(e)}'
    
    try:
        from sqlalchemy.orm import Session
        results['sqlalchemy'] = 'SUCCESS'
    except Exception as e:
        results['sqlalchemy'] = f'FAILED: {str(e)}'
    
    try:
        import bcrypt
        results['bcrypt'] = 'SUCCESS'
    except Exception as e:
        results['bcrypt'] = f'FAILED: {str(e)}'
    
    try:
        import jwt
        results['jwt'] = 'SUCCESS'
    except Exception as e:
        results['jwt'] = f'FAILED: {str(e)}'
    
    return JSONResponse(results)

# Try to create auth routes
try:
    from database import get_db
    from models import User
    from schemas import UserCreate, UserResponse, UserLogin
    from auth import authenticate_user, create_access_token, get_current_active_user, get_password_hash
    from fastapi import Depends, HTTPException, status
    
    @app.post("/api/v1/auth/register", response_model=UserResponse)
    def register_user(user: UserCreate, db = Depends(get_db)):
        existing_user = db.query(User).filter(
            (User.email == user.email) | (User.name == user.name)
        ).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="User already exists")
        hashed_password = get_password_hash(user.password)
        db_user = User(
            name=user.name, email=user.email, role=user.role,
            initials=user.initials, hashed_password=hashed_password
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    
    @app.post("/api/v1/auth/login")
    def login_user(user_credentials: UserLogin, db = Depends(get_db)):
        user = authenticate_user(db, user_credentials.email, user_credentials.password)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        access_token = create_access_token(data={"sub": str(user.id)})  # Convert to string
        return {"access_token": access_token, "token_type": "bearer"}

except Exception as e:
    @app.api_route("/api/v1/auth/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
    async def auth_error_handler(path: str):
        return JSONResponse({
            "error": "Auth routes failed to initialize",
            "exception": str(e),
            "traceback": traceback.format_exc()
        })