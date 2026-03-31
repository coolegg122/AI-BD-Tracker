#!/usr/bin/env python3
"""
Test script to verify Vercel deployment configuration.
Run this before pushing to GitHub.
"""

import os
import sys

def test_imports():
    """Test that all required modules can be imported."""
    print("Testing imports...")
    
    # Test backend import
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
    try:
        from main import app as backend_app
        print("✓ Backend import successful")
    except Exception as e:
        print(f"✗ Backend import failed: {e}")
        return False
    
    # Test API import
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'api'))
    try:
        from index import app as api_app
        print("✓ API import successful")
    except Exception as e:
        print(f"✗ API import failed: {e}")
        return False
    
    return True

def test_app_structure():
    """Test that the app has the correct structure."""
    print("\nTesting app structure...")
    
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'api'))
    from index import app
    
    # Check app type
    if not hasattr(app, 'routes'):
        print("✗ App doesn't have routes")
        return False
    print(f"✓ App has {len(app.routes)} routes")
    
    # Check for auth routes
    auth_routes = [r for r in app.routes if '/auth/' in str(r)]
    if not auth_routes:
        print("✗ No auth routes found")
        return False
    print(f"✓ Found {len(auth_routes)} auth routes")
    
    return True

def test_environment():
    """Test that environment variables are loaded."""
    print("\nTesting environment...")
    
    from dotenv import load_dotenv
    load_dotenv()
    
    # Check for required env vars (optional for local dev)
    secret_key = os.getenv('SECRET_KEY')
    gemini_key = os.getenv('GEMINI_API_KEY')
    
    if secret_key:
        print("✓ SECRET_KEY is set")
    else:
        print("⚠ SECRET_KEY not set (required for Vercel)")
    
    if gemini_key:
        print("✓ GEMINI_API_KEY is set")
    else:
        print("⚠ GEMINI_API_KEY not set (required for Vercel)")
    
    return True

def main():
    """Run all tests."""
    print("=" * 60)
    print("Vercel Deployment Pre-flight Check")
    print("=" * 60)
    
    tests = [
        ("Imports", test_imports),
        ("App Structure", test_app_structure),
        ("Environment", test_environment),
    ]
    
    results = []
    for name, test_func in tests:
        try:
            result = test_func()
            results.append((name, result))
        except Exception as e:
            print(f"\n✗ {name} test failed with exception: {e}")
            results.append((name, False))
    
    print("\n" + "=" * 60)
    print("Summary")
    print("=" * 60)
    
    all_passed = all(result for _, result in results)
    
    for name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status}: {name}")
    
    if all_passed:
        print("\n✓ All tests passed! Ready to deploy to Vercel.")
        print("\nRemember to set these environment variables in Vercel:")
        print("  - SECRET_KEY")
        print("  - GEMINI_API_KEY")
        print("  - POSTGRES_URL (or DATABASE_URL)")
        return 0
    else:
        print("\n✗ Some tests failed. Please fix before deploying.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
