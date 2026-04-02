import os
import json
from google import genai
from dotenv import load_dotenv

load_dotenv()

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
    model_id = "gemini-3-flash-preview"
    
    prompts = {
        "project": """
            You are a professional BioPharma BD assistant. Your goal is to extract ALL relevant BD information into a highly structured format.
            
            ### CATEGORIZATION RULES:
            1. **Scientific**: Target (e.g. Claudin18.2), MoA (e.g. ADC, RLT), Modality (e.g. Small Molecule, mAb), pre-clinical data summaries.
            2. **Clinical**: Phase (Ph1, Ph2, etc.), Indication (e.g. mCRPC, NSCLC), Trial IDs (NCT numbers), Enrollment status, Primary Endpoints.
            3. **Financial/Commercial**: Deal terms (upfront, milestones, royalties), Market size, Competitors mentioned, Funding status.
            4. **Legal**: Patent status, LOE (Loss of Exclusivity) dates, Territory rights (Global, Ex-China, etc.).
            
            ### DYNAMIC CATEGORY CREATION:
            If you find CRITICAL information that doesn't fit the above 4 buckets (e.g. Manufacturing, Ethics, Supply Chain, ESG), you MUST create a NEW top-level key in the "details" object with a descriptive name.
            
            ### DOCUMENT DETECTION:
            Look for mentions of shared documents or files. For each file mentioned, add it to the "suggested_attachments" list in details.
            
            You MUST return a single valid JSON object matching this exact schema:
            {
              "company": "Company Name",
              "pipeline": "Pipeline or Asset Name",
              "stage": "Clinical Stage (e.g. Phase I, Phase II, Pre-clinical, Marketed)",
              "nextFollowUp": "YYYY-MM-DD",
              "tasks": [
                { "type": "meeting/email/follow_up", "desc": "Specific to-do", "date": "YYYY-MM-DD or TBD", "status": "pending" }
              ],
              "attachments": [
                { "name": "File Name (e.g. ClinicalSummary.pdf)", "file_type": "PDF/PPT/Image", "category": "Scientific/Legal/Financial/Other", "url": "", "uploaded_at": "2026-03-31" }
              ],
              "primary_contact": {
                "name": "Full Name (Optional)",
                "email": "Primary Email (Optional)",
                "currentTitle": "Title at their company",
                "location": "City/Country"
              },
              "details": {
                "Scientific": { "target": "", "moa": "", "modality": "" },
                "Clinical": { "phase": "", "indication": "", "trial_id": "" },
                "Financial": { "deal_value": "" },
                "Legal": { "patent": "" },
                "Any_Custom_Category": { "key": "value" }
              }
            }
        """,
        "contact": """
            You are a professional BioPharma BD assistant. Extract executive contact info and career history.
            Look for all communication channels (email, phone, linkedin) and functional expertise.
            
            You MUST return a single valid JSON object matching this exact schema:
            {
              "name": "Full Name",
              "currentCompany": "Current Company",
              "currentTitle": "Current Title",
              "functionArea": "Functional Area (e.g. Oncology, BD, CMC)",
              "location": "City/Country",
              "email": "Primary Email",
              "linkedin": "LinkedIn URL",
              "phone": "Phone Number",
              "profile": "Short bio (under 20 words)",
              "details": {
                "extra_emails": ["secondary@email.com"],
                "associated_drugs": ["Drug A"],
                "education": "University/Degree",
                "languages": ["English", "Chinese"]
              },
              "careerHistory": [
                { "company": "Company", "title": "Title", "dateRange": "20XX-20XX", "isCurrent": true }
              ]
            }
        """,
        "meeting_note": """
            You are a professional BioPharma BD assistant. Extract key takeaways.
            Summarize core conclusions, next steps, and "vibe" of the discussion.
            
            You MUST return a single valid JSON object matching this exact schema:
            {
              "type": "meeting/email/call",
              "title": "Short note title",
              "date": "YYYY-MM-DD",
              "desc": "Core conclusion or progress (under 50 words)",
              "suspected_project_name": "Company or asset name for matching",
              "details": {
                "attendees": ["Person A", "Person B"],
                "decisions_made": ["Decision 1"],
                "sentiment": "Neutral/Positive/Negative",
                "unresolved_issues": ["Issue A"]
              }
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
    model_id = "gemini-3-flash-preview"
    
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

def generate_negotiation_prep(context: dict) -> dict:
    """
    Synthesize project history, contacts, and company intelligence into a strategic briefing.
    context: {
        "project": {...},
        "history": [...],
        "contacts": [...],
        "intelligence": {...}
    }
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        # Mocking for local dev without key
        return {
            "executive_summary": "AI Strategist not configured (No API Key). Use this for testing UI layout.",
            "contact_profiling": "Proceed with caution. Contacts seem focused on oncology.",
            "product_catalyst_alignment": "Strong alignment with BDX-401 for Pfizer's ADC needs.",
            "negotiation_levers": "They have a looming patent cliff in 2028; our asset is Phase II ready.",
            "suggested_agenda": ["Intro", "Scientific Review", "Term Sheet Discussion"],
            "cheat_sheet": [
                {"question": "How does your asset compare to Seagen?", "suggested_response": "We have superior safety data in Ph1."}
            ]
        }
    
    client = genai.Client(api_key=api_key)
    # Use 3.1 Pro for supreme reasoning across complex BD data
    model_id = "gemini-3.1-pro-preview" 
    
    system_instruction = """
    You are a Senior BioPharma BD Negotiation Strategist. 
    Analyze the provided context (Project, Communication History, Key Contacts, and Company Intel) to generate a high-level strategic briefing.
    
    ### GOAL:
    Equip the user with the most important insights to win the next negotiation or meeting.
    
    ### OUTPUT FORMAT (JSON):
    {
      "executive_summary": "1-2 paragraph strategic overview.",
      "contact_profiling": "Psychological/Strategic advice on specific contacts provided.",
      "product_catalyst_alignment": "How our pipeline fits their specific needs/cliffs.",
      "negotiation_levers": "Summary of our strengths (Levers) vs weaknesses.",
      "suggested_agenda": ["Agenda Item 1", "Agenda Item 2"],
      "cheat_sheet": [
        { "question": "Anticipated tough question", "suggested_response": "The best way to answer given the context" }
      ]
    }
    """
    
    prompt = f"{system_instruction}\n\nCONTEXT DATA:\n{json.dumps(context, indent=2)}"
    
    try:
        response = client.models.generate_content(
            model=model_id,
            contents=prompt,
            config={"response_mime_type": "application/json"}
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"Error during negotiation prep generation (Pro): {e}")
        # Fallback to flash if pro fails or unavailable
        try:
           response = client.models.generate_content(model="gemini-3-flash-preview", contents=prompt, config={"response_mime_type": "application/json"})
           return json.loads(response.text)
        except Exception as flash_e:
           print(f"Error during negotiation prep generation (Flash): {flash_e}")
           raise

def chat_with_strategist(project_context: dict, prep_data: dict, user_message: str, chat_history: list = None) -> str:
    """Conversational interface with the AI Strategist."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return "I am an AI Mock Strategist. I can't think deeply without an API key, but I'm here to listen!"
    
    client = genai.Client(api_key=api_key)
    model_id = "gemini-3.1-pro-preview"
    
    history_context = ""
    if chat_history:
        for msg in chat_history:
            history_context += f"{msg['role'].upper()}: {msg['content']}\n"
            
    system_instruction = f"""
    You are the AI BD Strategist. You have just produced the following Briefing for this project:
    {json.dumps(prep_data, indent=2)}
    
    Project Context Details:
    {json.dumps(project_context, indent=2)}
    
    Answer the user's specific questions about this negotiation. Be professional, strategic, and concise.
    """
    
    prompt = f"{system_instruction}\n\nConversation History:\n{history_context}\nUSER: {user_message}"
    
    try:
        response = client.models.generate_content(model=model_id, contents=prompt)
        return response.text
    except Exception as e:
        error_msg = str(e).lower()
        print(f"Error during strategist chat: {e}")
        if "401" in error_msg or "apikey" in error_msg or "test_key" in api_key:
            return "Strategist connection interrupted. Please ensure a valid GEMINI_API_KEY is configured in your .env file."
        if "429" in error_msg:
            return "Our strategic engine is currently over capacity. High-priority pipeline analysis requires a few minutes to cool down."
        return "Sorry, I had a strategic malfunction. Please try again."
