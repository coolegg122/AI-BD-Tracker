#!/usr/bin/env python3
"""
Vercel Deployment Diagnostic Tool
Analyzes the codebase for common Vercel deployment issues.
"""

import os
import sys
import json

def check_api_index():
    """Check api/index.py for Vercel compatibility."""
    print("=" * 60)
    print("Checking api/index.py")
    print("=" * 60)
    
    api_path = os.path.join(os.path.dirname(__file__), '..', 'api', 'index.py')
    
    with open(api_path, 'r') as f:
        content = f.read()
    
    issues = []
    
    # Check for app export
    if 'app =' in content or 'app=' in content:
        print("✓ Found 'app' export")
    else:
        issues.append("Missing 'app' export")
        print("✗ Missing 'app' export")
    
    # Check for FastAPI import
    if 'from fastapi import FastAPI' in content or 'from fastapi import' in content:
        print("✓ FastAPI imported")
    else:
        issues.append("FastAPI not imported")
        print("✗ FastAPI not imported")
    
    # Check for backend import
    if 'from main import' in content:
        print("✓ Backend app imported")
    else:
        issues.append("Backend app not imported")
        print("✗ Backend app not imported")
    
    # Check for path setup
    if 'sys.path' in content:
        print("✓ Path setup found")
    else:
        issues.append("Missing sys.path setup")
        print("✗ Missing sys.path setup")
    
    return issues

def check_vercel_json():
    """Check vercel.json configuration."""
    print("\n" + "=" * 60)
    print("Checking vercel.json")
    print("=" * 60)
    
    vercel_path = os.path.join(os.path.dirname(__file__), '..', 'vercel.json')
    
    try:
        with open(vercel_path, 'r') as f:
            config = json.load(f)
        print("✓ Valid JSON")
    except json.JSONDecodeError as e:
        print(f"✗ Invalid JSON: {e}")
        return ["Invalid vercel.json"]
    
    issues = []
    
    # Check builds
    if 'builds' in config:
        print(f"✓ Found {len(config['builds'])} build configurations")
        
        has_python = False
        for build in config['builds']:
            if '@vercel/python' in build.get('use', ''):
                has_python = True
                print("  ✓ Python runtime configured")
                if 'src' in build:
                    print(f"    Source: {build['src']}")
        
        if not has_python:
            issues.append("No Python runtime in builds")
            print("  ✗ No Python runtime found")
    else:
        issues.append("Missing 'builds' configuration")
        print("✗ Missing 'builds' configuration")
    
    # Check rewrites
    if 'rewrites' in config:
        print(f"✓ Found {len(config['rewrites'])} rewrite rules")
        
        has_api_rewrite = False
        for rewrite in config['rewrites']:
            if '/api' in rewrite.get('source', ''):
                has_api_rewrite = True
                print(f"  ✓ API rewrite: {rewrite['source']} → {rewrite['destination']}")
        
        if not has_api_rewrite:
            issues.append("No API rewrite rule")
            print("  ✗ No API rewrite rule")
    else:
        issues.append("Missing 'rewrites' configuration")
        print("✗ Missing 'rewrites' configuration")
    
    return issues

def check_requirements():
    """Check requirements.txt for Vercel compatibility."""
    print("\n" + "=" * 60)
    print("Checking requirements.txt")
    print("=" * 60)
    
    req_path = os.path.join(os.path.dirname(__file__), '..', 'requirements.txt')
    
    with open(req_path, 'r') as f:
        content = f.read().lower()
    
    required = ['fastapi', 'uvicorn', 'pydantic', 'bcrypt', 'pyjwt', 'python-jose']
    issues = []
    
    for pkg in required:
        if pkg in content:
            print(f"✓ {pkg} found")
        else:
            issues.append(f"Missing {pkg}")
            print(f"✗ {pkg} missing")
    
    # Check for passlib (should NOT be there)
    if 'passlib' in content:
        issues.append("passlib should be removed (use bcrypt directly)")
        print("⚠ passlib found (should use bcrypt directly)")
    else:
        print("✓ passlib not found (correct)")
    
    return issues

def check_backend_main():
    """Check backend/main.py for issues."""
    print("\n" + "=" * 60)
    print("Checking backend/main.py")
    print("=" * 60)
    
    main_path = os.path.join(os.path.dirname(__file__), '..', 'backend', 'main.py')
    
    with open(main_path, 'r') as f:
        content = f.read()
    
    issues = []
    
    # Check for app definition
    if 'app = FastAPI(' in content or 'app=FastAPI(' in content:
        print("✓ FastAPI app defined")
    else:
        issues.append("FastAPI app not defined")
        print("✗ FastAPI app not defined")
    
    # Check for auth routes
    if '@app.post("/api/v1/auth' in content or '@app.post' in content:
        print("✓ Auth routes found")
    else:
        issues.append("No auth routes found")
        print("✗ No auth routes found")
    
    # Check for CORS
    if 'CORSMiddleware' in content:
        print("✓ CORS middleware configured")
    else:
        print("⚠ CORS middleware not in main.py (might be in api/index.py)")
    
    return issues

def main():
    """Run all diagnostic checks."""
    print("\n" + "=" * 70)
    print("VERCEL DEPLOYMENT DIAGNOSTIC TOOL")
    print("=" * 70 + "\n")
    
    all_issues = []
    
    all_issues.extend(check_api_index())
    all_issues.extend(check_vercel_json())
    all_issues.extend(check_requirements())
    all_issues.extend(check_backend_main())
    
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    
    if not all_issues:
        print("\n✓ No critical issues found!")
        print("\nNext steps:")
        print("1. Push to GitHub: git push origin main")
        print("2. Wait for Vercel auto-deployment")
        print("3. Set environment variables in Vercel Dashboard")
        print("4. Test the deployment")
        return 0
    else:
        print(f"\n✗ Found {len(all_issues)} issue(s):")
        for i, issue in enumerate(all_issues, 1):
            print(f"  {i}. {issue}")
        print("\nPlease fix these issues before deploying.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
