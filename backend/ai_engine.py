import os
import json
from google import genai

def extract_universal(text: str, target_type: str = "project") -> dict:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print(f"Warning: GEMINI_API_KEY not set. Returning mock data for {target_type}.")
        if target_type == "project":
            return {
                "company": "Mocked BioPharma Inc.",
                "pipeline": "Auto-Generated Mock Pipeline Phase I",
                "stage": "Due Diligence",
                "nextFollowUp": "2026-11-01",
                "tasks": [{ "type": "meeting", "desc": "Discuss early stage funding", "date": "TBD", "status": "pending" }]
            }
        elif target_type == "contact":
            return {
                "name": "Alex Rivier",
                "currentCompany": "Novartis",
                "currentTitle": "Head of BD",
                "functionArea": "Oncology",
                "email": "alex.rivier@novartis.com",
                "careerHistory": [
                    {"company": "Novartis", "title": "Head of BD", "dateRange": "2020 - Present", "isCurrent": True},
                    {"company": "Roche", "title": "BD Manager", "dateRange": "2015 - 2020", "isCurrent": False}
                ]
            }
        elif target_type == "meeting_note":
            return {
                "type": "meeting",
                "title": "Discussion with Novartis on ADC",
                "date": "2026-03-31",
                "desc": "Next steps on data sharing.",
                "suspected_project_name": "Novartis"
            }
        
    client = genai.Client(api_key=api_key)
    model_id = "gemini-2.5-flash"
    
    prompts = {
        "project": """
            You are a professional BioPharma BD assistant. Extract BD project information from the user's communication record.
            You MUST return a single valid JSON object matching this exact schema, with no extra text:
            {
              "company": "Company Name",
              "pipeline": "Pipeline or Asset Name",
              "stage": "Initial Contact",
              "nextFollowUp": "YYYY-MM-DD",
              "tasks": [
                { "type": "meeting", "desc": "Specific to-do description", "date": "Date or TBD", "status": "pending" }
              ]
            }
        """,
        "contact": """
            You are a professional BioPharma BD assistant. Extract executive contact info and career history from communication records or business cards.
            You MUST return a single valid JSON object matching this exact schema, with no extra text:
            {
              "name": "Full Name",
              "currentCompany": "Current Company",
              "currentTitle": "Current Title",
              "functionArea": "Functional Area (e.g. Oncology, BD, CMC)",
              "location": "City",
              "email": "Email (if available)",
              "linkedin": "LinkedIn URL (if available)",
              "phone": "Phone (if available)",
              "profile": "Short bio (under 20 words)",
              "careerHistory": [
                { "company": "Company", "title": "Title", "dateRange": "20XX-20XX", "isCurrent": true }
              ]
            }
        """,
        "meeting_note": """
            You are a professional BioPharma BD assistant. Extract key takeaways from meeting summaries or communication records.
            Since these notes must be linked to a BD project, try to guess which company or asset this note relates to (suspected_project_name).
            You MUST return a single valid JSON object matching this exact schema, with no extra text:
            {
              "type": "meeting/email/call",
              "title": "Short note title",
              "date": "YYYY-MM-DD (meeting date)",
              "desc": "Core conclusion or progress (under 50 words)",
              "suspected_project_name": "Most likely company name or asset name (for project matching)"
            }
        """
    }
    
    system_instruction = prompts.get(target_type, prompts["project"])
    prompt = f"{system_instruction}\n\nUser Input:\n{text}"
    
    try:
        response = client.models.generate_content(
            model=model_id,
            contents=prompt,
            config={
                "response_mime_type": "application/json"
            }
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"Error during AI extraction ({target_type}): {e}")
        raise

def generate_company_intelligence(company_name: str) -> dict:
    import datetime
    api_key = os.getenv("GEMINI_API_KEY")
    
    # We provide a highly customized mock if no API key is present
    normalized = company_name.lower().strip()
    
    if not api_key:
        print(f"Warning: GEMINI_API_KEY not set. Returning mock intelligence for {company_name}.")
        mock_data = {
            "company_name": company_name,
            "focus_areas": ["Oncology (ADC, Radiopharma)", "Immunology", "Rare Diseases"],
            "bd_strategy": "Aggressively pursuing late-stage ADC assets and combination therapies. Actively seeking to replenish patent-cliff losses with multi-billion dollar bolt-on acquisitions. Prefers worldwide rights.",
            "patent_cliffs": [
                "Key Blockbuster (Immunology) facing LOE in 2028 (-$6B impact)",
                "Solid tumor franchise core patent expires 2030"
            ],
            "recent_deals": [
                {"date": "2023-11", "target": "Seagen", "deal_type": "Acquisition", "value": "$43B"},
                {"date": "2024-03", "target": "ProFound Tx", "deal_type": "Licensing", "value": "$1.2B Biobucks"}
            ],
            "last_updated": datetime.datetime.now().strftime('%Y-%m-%d')
        }
        
        if 'merck' in normalized:
            mock_data["focus_areas"] = ["Oncology (I-O Combos)", "Vaccines", "Cardiometabolic"]
            mock_data["bd_strategy"] = "Heavily reliant on Keytruda. Frantically looking for combo partners or novel I-O mechanisms (e.g., TIGIT, LAG-3) to extend Keytruda's lifecycle. High threshold for early-stage risk."
            mock_data["patent_cliffs"] = ["Keytruda (Pembrolizumab) US LOE 2028 (massive revenue cliff)"]
            mock_data["recent_deals"] = [
                {"date": "2023-04", "target": "Prometheus Biosciences", "deal_type": "Acquisition", "value": "$10.8B"},
                {"date": "2024-01", "target": "Harpoon Therapeutics", "deal_type": "Acquisition", "value": "$680M"}
            ]
        elif 'novartis' in normalized:
            mock_data["focus_areas"] = ["Radioligand Therapy (RLT)", "Cardiovascular", "Neuroscience", "Immunology"]
            mock_data["bd_strategy"] = "Pure-play innovative medicines post-Sandoz spin-off. Heavy emphasis on platform technologies (RLT, RNA, Cell/Gene). Aggressive in mid-size acquisitions."
            mock_data["patent_cliffs"] = ["Entresto LOE 2025", "Tasigna LOE 2023"]
            mock_data["recent_deals"] = [
                {"date": "2024-02", "target": "MorphoSys", "deal_type": "Acquisition", "value": "$2.9B"},
                {"date": "2023-06", "target": "Chinook Therapeutics", "deal_type": "Acquisition", "value": "$3.2B"}
            ]

        return mock_data

    # If API key is present, call the real model:
    client = genai.Client(api_key=api_key)
    model_id = "gemini-2.5-flash"
    
    system_instruction = f"""
    You are an expert BioPharma BD Strategy Analyst.
    Generate a competitive intelligence report for the company: "{company_name}".
    You must output a strictly valid JSON object matching this schema exactly without markdown formatting:
    {{
        "company_name": "{company_name}",
        "focus_areas": ["Therapeutic Area 1", "Area 2"],
        "bd_strategy": "2-3 sentences describing their current licensing/M&A appetite and preferences.",
        "patent_cliffs": ["Drug A (LOE 20XX)", "Drug B"],
        "recent_deals": [
            {{"date": "YYYY-MM", "target": "Target Company", "deal_type": "Acquisition/Licensing", "value": "$XB/$XM"}}
        ],
        "last_updated": "{datetime.datetime.now().strftime('%Y-%m-%d')}"
    }}
    """
    
    try:
        response = client.models.generate_content(
            model=model_id,
            contents=system_instruction,
            config={
                "response_mime_type": "application/json"
            }
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"Error during intelligence generation: {e}")
        raise
