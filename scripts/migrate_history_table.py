import os
import sys

# Add the backend directory to sys.path so we can import modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from database import engine, SessionLocal
from models import Base, ProjectHistory, Project

def migrate():
    print("Testing database connection...")
    try:
        # Create ProjectHistory table if it doesn't exist. 
        # Base.metadata.create_all will only create missing tables.
        print("Creating table project_history...")
        ProjectHistory.__table__.create(bind=engine, checkfirst=True)
        print("Table project_history created successfully or already exists.")

        # Optionally, seed with initial mock data connecting to project id=1 (or first available)
        db = SessionLocal()
        first_project = db.query(Project).first()
        
        if first_project:
            existing_history = db.query(ProjectHistory).filter(ProjectHistory.project_id == first_project.id).first()
            if not existing_history:
                print(f"Seeding dummy footprint data for Project ID {first_project.id} ({first_project.company})")
                
                dummy_entries = [
                    ProjectHistory(
                        project_id=first_project.id,
                        type="meeting",
                        title="Initial Connect & Synergies",
                        date="Sept 14, 2026",
                        desc="Introduced our portfolio synergy and clinical platform capabilities.",
                        details={
                            "attendees": "Dr. Sarah Chen (Chief Medical Officer), Mark Johnson (VP BD, Partner)",
                            "minutes": "- Partner expressed high interest in the safety profile of our Ph2 asset.\n- Action Item: Send non-confidential teaser deck.\n- Action Item: Schedule follow-up CDMO review.",
                            "link": "Zoom Recording (Passcode: 9x$2pq)",
                            "url": "https://zoom.us/"
                        }
                    ),
                    ProjectHistory(
                        project_id=first_project.id,
                        type="document",
                        title="CDA Executed",
                        date="Sept 20, 2026",
                        desc="Mutual Non-Disclosure Agreement countersigned by both legal teams.",
                        details={
                            "docId": "DOC-2026-0920-CDA",
                            "signatories": "Alex Mercer (Our CEO), Dr. Elena Rostova (Partner EVP)",
                            "expiryDate": "Sept 20, 2028 (2 Years Validity)",
                            "status": "Active & Enforced",
                            "link": "SharePoint/Legal/CDA_Executed.pdf",
                            "url": "/demo-assets/CDA_Executed.txt"
                        }
                    ),
                    ProjectHistory(
                        project_id=first_project.id,
                        type="call",
                        title="Management Q&A Session",
                        date="Oct 15, 2026",
                        desc="Detailed dive into Phase 2b secondary endpoints.",
                        details={
                            "attendees": "Clinical Lead Team (Both sides)",
                            "minutes": "- Cleared up concerns regarding arm B dropout rates.\n- Requested additional cuts of the demographic data.\n- Proceeding to commercial valuation modeling next week.",
                            "link": "Read Full Transcript",
                            "url": "/demo-assets/Transcript.txt"
                        }
                    )
                ]
                
                db.add_all(dummy_entries)
                db.commit()
                print("Dummy data seeded successfully!")
            else:
                print("Dummy data already exists, skipping seed.")
        else:
            print("No projects found in DB to seed data against.")
            
    except Exception as e:
        print(f"Error during migration: {str(e)}")
    finally:
        if 'db' in locals():
            db.close()

if __name__ == "__main__":
    migrate()
