"""
Script to create an initial admin user for the AI-BD Tracker application.
This should be run once after the first deployment to create an initial user account.
"""

import os
import sys
from datetime import datetime

# Add the backend directory to the path so we can import modules
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, backend_path)

from database import SessionLocal
from models import User
from auth import get_password_hash

def create_admin_user():
    db = SessionLocal()
    
    try:
        # Check if admin user already exists
        existing_admin = db.query(User).filter(User.email == "admin@aidbtracker.local").first()
        if existing_admin:
            print("Admin user already exists. Skipping creation.")
            return
        
        # Create a default admin user
        admin_user = User(
            name="Admin User",
            email="admin@aidbtracker.local",
            role="Administrator",
            initials="AU",
            hashed_password=get_password_hash("admin123"),  # Default password
            is_active=1,
            firebase_uid=None  # Since we're using local auth
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print(f"Admin user created successfully with ID: {admin_user.id}")
        print("Email: admin@aidbtracker.local")
        print("Default password: admin123 (Please change this immediately after first login!)")
        
    except Exception as e:
        print(f"Error creating admin user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()