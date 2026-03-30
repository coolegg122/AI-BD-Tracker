import models, database
from datetime import datetime

# Setup DB session
db = database.SessionLocal()

try:
    # Clear existing to start fresh (optional, but ensures clean demo)
    # WARNING: Don't do this in production. For demo, it's nice.
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

    contacts_data = [
        {
            "name": "Dr. Sarah Jenkins",
            "currentCompany": "Pfizer",
            "currentTitle": "SVP, Global BD",
            "functionArea": "Licensing & M&A",
            "photoUrl": "/logos/contact_sarah.png",
            "location": "New York, NY",
            "email": "sarah.jenkins@pfizer.com",
            "linkedin": "linkedin.com/in/sjenkins-phd",
            "phone": "+1 (212) 733-1000",
            "profile": "Veteran deal-maker in the oncology space. Deeply analytical, relies heavily on clinical data integrity. Known for driving hard bargains on upfront payments but offers generous milestone structures.",
            "metAt": ["JPM 2027", "ASCO 2024 (as AZ Delegate)"],
            "careerHistory": [
                {"company": "Pfizer", "title": "SVP, Global BD", "dateRange": "Jan 2025 - Present", "isCurrent": 1},
                {"company": "AstraZeneca", "title": "VP, Oncology Search & Evaluation", "dateRange": "Mar 2019 - Dec 2024", "isCurrent": 0},
                {"company": "McKinsey & Company", "title": "Engagement Manager (Life Sciences)", "dateRange": "2014 - 2019", "isCurrent": 0}
            ]
        },
        {
            "name": "James Henderson",
            "currentCompany": "Sequoia Capital",
            "currentTitle": "General Partner",
            "functionArea": "Venture Capital",
            "photoUrl": "/logos/contact_james.png",
            "location": "Menlo Park, CA",
            "email": "jhenderson@sequoiacap.com",
            "linkedin": "linkedin.com/in/james-henderson-vc",
            "phone": "+1 (650) 854-3927",
            "profile": "Lead investor for our Series A. Focuses on founder dynamics and platform extensibility. Prefers weekly high-level updates over granular data dumps.",
            "metAt": ["JPM 2026", "Board Meeting (Monthly)"],
            "careerHistory": [
                {"company": "Sequoia Capital", "title": "General Partner", "dateRange": "2021 - Present", "isCurrent": 1},
                {"company": "Sequoia Capital", "title": "Principal", "dateRange": "2017 - 2021", "isCurrent": 0},
                {"company": "Goldman Sachs", "title": "VP, Healthcare Investment Banking", "dateRange": "2010 - 2017", "isCurrent": 0}
            ]
        },
        {
            "name": "Dr. Amanda Lewis",
            "currentCompany": "Merck & Co.",
            "currentTitle": "Global Clinical Lead",
            "functionArea": "Clinical Development",
            "photoUrl": "/logos/contact_amanda.png",
            "location": "Rahway, NJ",
            "email": "amanda.lewis_clin@merck.com",
            "linkedin": "linkedin.com/in/alewis-md",
            "phone": "+1 (908) 740-4000",
            "profile": "Key decision-maker for Keytruda combination trials. Extremely protective of the Keytruda combo rationale. Needs to see compelling mechanistic synergy before providing free drug supply.",
            "metAt": ["ASCO 2027", "ESMO 2025"],
            "careerHistory": [
                {"company": "Merck & Co.", "title": "Global Clinical Lead", "dateRange": "2023 - Present", "isCurrent": 1},
                {"company": "Merck & Co.", "title": "Senior Medical Director", "dateRange": "2020 - 2023", "isCurrent": 0},
                {"company": "Dana-Farber Cancer Institute", "title": "Attending Oncologist", "dateRange": "2012 - 2020", "isCurrent": 0}
            ]
        },
        {
            "name": "Dr. Klaus Richter",
            "currentCompany": "Novartis",
            "currentTitle": "Head of Solid Tumors",
            "functionArea": "R&D / Strategy",
            "photoUrl": "/logos/contact_klaus.png",
            "location": "Basel, Switzerland",
            "email": "klaus.richter@novartis.com",
            "linkedin": "linkedin.com/in/krichter-basel",
            "phone": "+41 61 324 11 11",
            "profile": "Highly academic and rigorous European clinical leader. Dislikes aggressive sales pitches; responds best to peer-reviewed data and robust statistical analysis plans.",
            "metAt": ["ESMO 2026"],
            "careerHistory": [
                {"company": "Novartis", "title": "Head of Solid Tumors", "dateRange": "2022 - Present", "isCurrent": 1},
                {"company": "Roche", "title": "Global Medical Affairs Leader", "dateRange": "2016 - 2022", "isCurrent": 0},
                {"company": "University Hospital Zurich", "title": "Professor of Oncology", "dateRange": "2008 - 2016", "isCurrent": 0}
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
