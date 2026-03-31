import os
import sys

# Add the backend directory to sys.path so we can import models and database
backend_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend")
sys.path.append(backend_dir)

from database import engine
from models import PendingIngestion

def create_table():
    print("Creating pending_ingestion table...")
    PendingIngestion.__table__.create(engine, checkfirst=True)
    print("Table created (or already exists)!")

if __name__ == "__main__":
    create_table()
