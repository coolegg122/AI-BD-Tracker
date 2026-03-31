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

# Try to create auth routes with more debugging
try:
    from database import get_db, SessionLocal
    from models import User
    from schemas import UserCreate, UserResponse, UserLogin
    from auth import authenticate_user, create_access_token, get_current_active_user, get_password_hash
    from fastapi import Depends, HTTPException, status
    
    @app.post("/api/v1/auth/register", response_model=UserResponse)
    def register_user(user: UserCreate, db = Depends(get_db)):
        try:
            # Check if user already exists
            existing_user = db.query(User).filter(
                (User.email == user.email) | (User.name == user.name)
            ).first()
            if existing_user:
                raise HTTPException(status_code=400, detail="User already exists")
            
            # Hash the password
            hashed_password = get_password_hash(user.password)
            
            # Create new user
            db_user = User(
                name=user.name, email=user.email, role=user.role,
                initials=user.initials, hashed_password=hashed_password
            )
            
            # Add to database
            db.add(db_user)
            db.commit()
            db.refresh(db_user)
            
            return db_user
        except Exception as e:
            print(f"Registration error: {str(e)}")
            print(f"Traceback: {traceback.format_exc()}")
            raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")
    
    @app.post("/api/v1/auth/login")
    def login_user(user_credentials: UserLogin, db = Depends(get_db)):
        try:
            user = authenticate_user(db, user_credentials.email, user_credentials.password)
            if not user:
                raise HTTPException(status_code=401, detail="Invalid credentials")
            
            access_token = create_access_token(data={"sub": str(user.id)})
            return {"access_token": access_token, "token_type": "bearer"}
        except Exception as e:
            print(f"Login error: {str(e)}")
            print(f"Traceback: {traceback.format_exc()}")
            raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")

    # Add a test database connection endpoint
    @app.get("/api/v1/test-db")
    def test_db():
        try:
            with SessionLocal() as session:
                from sqlalchemy import text
                result = session.execute(text("SELECT 1")).scalar()
                return {"status": "success", "result": result}
        except Exception as e:
            return {"status": "failed", "error": str(e), "traceback": traceback.format_exc()}

except Exception as e:
    @app.api_route("/api/v1/auth/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
    async def auth_error_handler(path: str):
        return JSONResponse({
            "error": "Auth routes failed to initialize",
            "exception": str(e),
            "traceback": traceback.format_exc()
        })