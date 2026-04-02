import models, database
from datetime import datetime

# Setup DB session
db = database.SessionLocal()

try:
    # Clear existing to start fresh (optional, but ensures clean demo)
    # WARNING: Don't do this in production. For demo, it's nice.
    # Clear existing to start fresh (ordered by dependency)
    db.query(models.Attachment).delete()
    db.query(models.ProjectHistory).delete()
    db.query(models.Task).delete()
    db.query(models.Project).delete()
    db.query(models.CareerHistory).delete()
    db.query(models.Contact).delete()

    projects_data = [
        # Pipeline 1: Project Helios
        {
            "company": "Pfizer",
            "pipeline": "Project Helios (Ph2 Oncology)",
            "stage": "CDA Signed",
            "status": "active",
            "lastContactDate": "2026-10-12",
            "nextFollowUp": "2026-10-25",
            "task_desc": "CDA executed. Sent Phase 1 data room link."
        },
        {
            "company": "Merck",
            "pipeline": "Project Helios (Ph2 Oncology)",
            "stage": "Term Sheet",
            "status": "active",
            "lastContactDate": "2026-10-15",
            "nextFollowUp": "2026-10-22",
            "task_desc": "Counter-offer received on upfront payment. Deal team reviewing."
        },
        {
            "company": "Sanofi",
            "pipeline": "Project Helios (Ph2 Oncology)",
            "stage": "Due Diligence",
            "status": "active",
            "lastContactDate": "2026-10-10",
            "nextFollowUp": "2026-10-28",
            "task_desc": "CMC audit scheduled for next week. IP documents cleared."
        },

        # Pipeline 2: Asset BDX-402
        {
            "company": "Novartis",
            "pipeline": "Asset BDX-402 (Pre-clinical)",
            "stage": "Initial Contact",
            "status": "active",
            "lastContactDate": "2026-10-18",
            "nextFollowUp": "2026-10-25",
            "task_desc": "Intro deck sent to Oncology BD head. Waiting for reply."
        },
        {
            "company": "AstraZeneca",
            "pipeline": "Asset BDX-402 (Pre-clinical)",
            "stage": "Initial Contact",
            "status": "dormant",
            "lastContactDate": "2026-09-20",
            "nextFollowUp": "None",
            "task_desc": "External innovation team paused review until Q1 budget unlocks."
        },
        {
            "company": "Pfizer",
            "pipeline": "Asset BDX-402 (Pre-clinical)",
            "stage": "CDA Signed",
            "status": "active",
            "lastContactDate": "2026-10-20",
            "nextFollowUp": "2026-11-05",
            "task_desc": "Under scientific review by their early-stage immunology committee."
        },

        # Pipeline 3: Aurora Platform
        {
            "company": "Moderna",
            "pipeline": "Aurora Technology Platform",
            "stage": "Negotiation",
            "status": "active",
            "lastContactDate": "2026-10-19",
            "nextFollowUp": "2026-10-21",
            "task_desc": "Drafting licensing agreement for mRNA delivery tech application."
        },
        {
            "company": "Johnson & Johnson",
            "pipeline": "Aurora Technology Platform",
            "stage": "Term Sheet",
            "status": "active",
            "lastContactDate": "2026-10-21",
            "nextFollowUp": "2026-10-26",
            "task_desc": "Agreed on core economics, strict legal phrasing review pending."
        }
    ]

    for p_data in projects_data:
        p = models.Project(
            company=p_data["company"],
            pipeline=p_data["pipeline"],
            stage=p_data["stage"],
            status=p_data["status"],
            lastContactDate=p_data["lastContactDate"],
            nextFollowUp=p_data["nextFollowUp"]
        )
        db.add(p)
        db.commit() # Commit to get ID
        db.refresh(p)
        
        # Add a dummy task for history/feedback
        t = models.Task(
            project_id=p.id,
            type="email",
            desc=p_data["task_desc"],
            date=p_data["lastContactDate"],
            status="confirmed"
        )
        db.add(t)
        db.commit()

    print("Successfully seeded diverse projects for demo!")

    # Pipeline 3: Aurora Platform (continued in p_data loop)
    # ... loop logic ...

    # Add ProjectHistory for Pfizer (Project Helios)
    pfizer_helios = db.query(models.Project).filter(models.Project.company == "Pfizer", models.Project.pipeline.contains("Helios")).first()
    if pfizer_helios:
        history_entries = [
            {
                "type": "meeting",
                "title": "Clinical Strategy Sync",
                "date": "2026-10-15",
                "desc": "Detailed dive into Phase 2b clinical endpoints and patient stratification.",
                "details": {
                    "attendees": [
                        {"name": "Dr. Sarah Jenkins", "title": "SVP, Global BD", "functionArea": "BD", "company": "Pfizer"},
                        {"name": "Michael Chen", "title": "Clinical Lead", "functionArea": "Clinical", "company": "Pfizer"},
                        {"name": "Internal Team", "title": "Various", "functionArea": "Clinical", "company": "Internal"}
                    ],
                    "minutes": "- Confirmed endpoint selection criteria.\n- Agreed on safety monitoring board composition.\n- Discussion on recruitment acceleration strategies."
                }
            },
            {
                "type": "call",
                "title": "Governance Q&A",
                "date": "2026-10-18",
                "desc": "Short follow-up regarding the joint steering committee structure.",
                "details": {
                    "attendees": [
                        {"name": "Dr. Sarah Jenkins", "title": "SVP, Global BD", "functionArea": "BD", "company": "Pfizer"}
                    ],
                    "minutes": "SVP clarified that Pfizer prefers a 3+3 structure for the JSC."
                }
            }
        ]
        for h_entry in history_entries:
            db_h = models.ProjectHistory(
                project_id=pfizer_helios.id,
                type=h_entry["type"],
                title=h_entry["title"],
                date=h_entry["date"],
                desc=h_entry["desc"],
                details=h_entry["details"]
            )
            db.add(db_h)
        db.commit()

    print("Successfully seeded diverse projects and history for demo!")

    contacts_data = [
        {
            "name": "Dr. Sarah Jenkins",
            "currentCompany": "Pfizer",
            "currentTitle": "SVP, Global BD",
            "functionArea": "Licensing & M&A",
            "photoUrl": "https://api.uifaces.co/our-content/donated/x_7-8-0_0.jpg",
            "location": "New York, NY",
            "email": "sarah.jenkins@pfizer.com",
            "linkedin": "linkedin.com/in/sjenkins-phd",
            "phone": "+1 (212) 733-1000",
            "profile": "Veteran deal-maker in the oncology space. Deeply analytical, relies heavily on clinical data integrity. Known for driving hard bargains on upfront payments but offers generous milestone structures.",
            "metAt": ["JPM 2027", "ASCO 2024"],
            "careerHistory": [
                {"company": "Pfizer", "title": "SVP, Global BD", "dateRange": "Jan 2025 - Present", "isCurrent": 1},
                {"company": "AstraZeneca", "title": "VP, Oncology Search & Evaluation", "dateRange": "Mar 2019 - Dec 2024", "isCurrent": 0}
            ]
        },
        {
            "name": "Michael Chen",
            "currentCompany": "Pfizer",
            "currentTitle": "Director, Clinical Development",
            "functionArea": "Clinical",
            "photoUrl": "https://api.uifaces.co/our-content/donated/9e67_jvy.jpg",
            "location": "Boston, MA",
            "email": "michael.chen@pfizer.com",
            "linkedin": "linkedin.com/in/mchen-clinical",
            "phone": "+1 (617) 555-0123",
            "profile": "Lead clinical strategist for early-stage oncology assets. Pragmatic, focused on 'killing' poor candidates early. Very supportive of our platform's mechanistic data.",
            "metAt": ["Project Helios Sync", "ESMO 2026"],
            "careerHistory": [
                {"company": "Pfizer", "title": "Director, Clinical Development", "dateRange": "2023 - Present", "isCurrent": 1},
                {"company": "Amgen", "title": "Sr. Medical Director", "dateRange": "2018 - 2023", "isCurrent": 0}
            ]
        },
        {
            "name": "James Henderson",
            "currentCompany": "Sequoia Capital",
            "currentTitle": "General Partner",
            "functionArea": "Venture Capital",
            "photoUrl": "https://api.uifaces.co/our-content/donated/Kt_Anm9m.jpg",
            "location": "Menlo Park, CA",
            "email": "jhenderson@sequoiacap.com",
            "linkedin": "linkedin.com/in/james-henderson-vc",
            "phone": "+1 (650) 854-3927",
            "profile": "Lead investor for our Series A. Focuses on founder dynamics and platform extensibility.",
            "metAt": ["JPM 2026"],
            "careerHistory": [
                {"company": "Sequoia Capital", "title": "General Partner", "dateRange": "2021 - Present", "isCurrent": 1}
            ]
        },
        {
            "name": "Dr. Amanda Lewis",
            "currentCompany": "Merck & Co.",
            "currentTitle": "Global Clinical Lead",
            "functionArea": "Clinical",
            "photoUrl": "https://api.uifaces.co/our-content/donated/o-vD_e6T.jpg",
            "location": "Rahway, NJ",
            "email": "amanda.lewis_clin@merck.com",
            "linkedin": "linkedin.com/in/alewis-md",
            "phone": "+1 (908) 740-4000",
            "profile": "Key decision-maker for Keytruda combination trials.",
            "metAt": ["ASCO 2027"],
            "careerHistory": [
                {"company": "Merck & Co.", "title": "Global Clinical Lead", "dateRange": "2023 - Present", "isCurrent": 1}
            ]
        }
    ]

    for c_data in contacts_data:
        c = models.Contact(
            name=c_data["name"],
            currentCompany=c_data["currentCompany"],
            currentTitle=c_data["currentTitle"],
            functionArea=c_data["functionArea"],
            photoUrl=c_data["photoUrl"],
            location=c_data["location"],
            email=c_data["email"],
            linkedin=c_data["linkedin"],
            phone=c_data["phone"],
            profile=c_data["profile"],
            metAt=c_data["metAt"]
        )
        db.add(c)
        db.commit()
        db.refresh(c)
        
        for h_data in c_data["careerHistory"]:
            h = models.CareerHistory(
                contact_id=c.id,
                company=h_data["company"],
                title=h_data["title"],
                dateRange=h_data["dateRange"],
                isCurrent=h_data["isCurrent"]
            )
            db.add(h)
        db.commit()

    print("Successfully seeded Key Contacts with career histories!")

except Exception as e:
    print(f"Error seeding DB: {e}")
    db.rollback()
finally:
    db.close()
