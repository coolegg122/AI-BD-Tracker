#!/usr/bin/env python3
"""
Test script to verify registration and login functionality
"""

import sys
import os

# Add backend to path
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, backend_path)

from main import app
from database import SessionLocal
from models import User
from auth import verify_password

def test_registration():
    """Test the registration process manually"""
    print("Testing registration process...")

    # Simulate registration data
    test_user_data = {
        'name': 'Test User',
        'email': 'test@example.com',
        'password': 'testpassword123',
        'role': 'BD Manager',
        'initials': 'TU'
    }

    # Test if we can manually create a user in the database
    db = SessionLocal()
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == test_user_data['email']).first()
        if existing_user:
            print(f"User with email {test_user_data['email']} already exists, removing...")
            db.delete(existing_user)
            db.commit()

        # Import auth functions
        from auth import get_password_hash

        # Hash the password
        hashed_password = get_password_hash(test_user_data['password'])

        # Create new user
        new_user = User(
            name=test_user_data['name'],
            email=test_user_data['email'],
            role=test_user_data['role'],
            initials=test_user_data['initials'],
            hashed_password=hashed_password
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        print(f"✓ User created successfully with ID: {new_user.id}")

        # Verify we can authenticate the user
        from auth import authenticate_user
        authenticated_user = authenticate_user(db, test_user_data['email'], test_user_data['password'])

        if authenticated_user:
            print("✓ Authentication successful")
            print(f"  - User ID: {authenticated_user.id}")
            print(f"  - Name: {authenticated_user.name}")
            print(f"  - Email: {authenticated_user.email}")
        else:
            print("✗ Authentication failed")

    except Exception as e:
        print(f"✗ Error during test: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

def test_database_connection():
    """Test database connection and check if users table exists"""
    print("\nTesting database connection...")

    db = SessionLocal()
    try:
        # Try to query users table
        users = db.query(User).limit(5).all()
        print(f"✓ Successfully connected to database")
        print(f"✓ Found {len(users)} existing users")

        if users:
            print("Sample users:")
            for user in users[:2]:  # Show first 2 users
                print(f"  - ID: {user.id}, Name: {user.name}, Email: {user.email}")

    except Exception as e:
        print(f"✗ Database connection error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    print("=" * 60)
    print("Registration and Login Functionality Test")
    print("=" * 60)

    test_database_connection()
    test_registration()

    print("\n" + "=" * 60)
    print("Test completed!")