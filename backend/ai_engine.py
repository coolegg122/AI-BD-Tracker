import os
import json
import datetime
from google import genai
from dotenv import load_dotenv

load_dotenv()

def extract_universal(text: str, target_type: str = "deal") -> dict:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print(f"Warning: GEMINI_API_KEY not set. Returning mock data for {target_type}.")
        if target_type == "deal":
            return {
                "company": "Mocked BioPharma Inc.",
                "pipeline": "Auto-Generated Mock Pipeline Phase I",
                "stage": "Due Diligence",
                "nextFollowUp": "2026-11-01",
                "deals_assets": [{"name": "MOCK-101", "type": "ADC", "indication": "Oncology"}],
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
                "suspected_deal_name": "Novartis"
            }
        
    client = genai.Client(api_key=api_key)
    model_id = os.getenv("GEMINI_MODEL_ID", "gemini-3-flash-preview")
    
    prompts = {
        "deal": """
            You are a professional BioPharma BD assistant. Your goal is to extract Deal (transactional) and Asset (scientific) info.
            
            ### DEAL vs ASSET:
            - **Deal**: The transaction status, stage (Ph1, Ph2), company name, follow-ups, and tasks.
            - **Asset**: The specific molecule or technology (e.g. "Claudin18.2 ADC").
            
            ### CATEGORIZATION RULES:
            1. **Scientific**: Target, MoA, Modality, pre-clinical data.
            2. **Clinical**: Phase, Indication, Trial IDs, Enrollment.
            3. **Financial**: Deal terms, Market size, Competitors.
            4. **Legal**: Patent status, LOE, Territory rights.
            
            You MUST return a single valid JSON object:
            {
              "company": "Company Name",
              "pipeline": "Deal Name (e.g. Oncology Collaboration)",
              "stage": "Clinical Stage (e.g. Phase I)",
              "nextFollowUp": "YYYY-MM-DD",
              "assets": [
                { "name": "Asset Name", "type": "Modality (mAb, ADC)", "indication": "Main Indication", "phase": "Clinical Phase", "moa": "MoA details" }
              ],
              "tasks": [
                { "type": "meeting/email/follow_up", "desc": "Specific to-do", "date": "YYYY-MM-DD or TBD", "status": "pending" }
              ],
              "attachments": [
                { "name": "File Name", "file_type": "PDF/PPT/Image", "category": "Scientific/Legal/Financial/Other", "url": "", "uploaded_at": "2026-03-31" }
              ],
              "primary_contact": {
                "name": "Full Name",
                "email": "Email",
                "currentTitle": "Title",
                "location": "City/Country"
              },
              "details": {
                "Scientific": {}, "Clinical": {}, "Financial": {}, "Legal": {}
              }
            }
        """,
        "contact": """
            You are a professional BioPharma BD assistant. Extract executive contact info and career history.
            
            You MUST return a JSON object:
            {
              "name": "Full Name",
              "currentCompany": "Current Company",
              "currentTitle": "Current Title",
              "functionArea": "Functional Area",
              "location": "City/Country",
              "email": "Primary Email",
              "linkedin": "LinkedIn URL",
              "phone": "Phone Number",
              "profile": "Short bio",
              "details": {},
              "careerHistory": [
                { "company": "Company", "title": "Title", "dateRange": "20XX-20XX", "isCurrent": true }
              ]
            }
        """,
        "meeting_note": """
            You are a professional BioPharma BD assistant. Extract key takeaways.
            
            You MUST return a JSON object:
            {
              "type": "meeting/email/group_call",
              "title": "Short note title",
              "date": "YYYY-MM-DD",
              "desc": "Summary",
              "suspected_deal_name": "Company or asset name",
              "details": {
                "attendees": [
                    { "name": "Name", "title": "Title", "functionArea": "Function", "company": "Company" }
                ],
                "decisions_made": [],
                "sentiment": "Neutral/Positive/Negative",
                "unresolved_issues": []
              }
            }
        """,
        "mixed": """
            You are an advanced BioPharma BD Intelligence Analyst. 
            Extract multiple entities (Deal, Assets, Contacts, Event).
            
            You MUST return a JSON object:
            {
              "update_deal": {
                "company": "Company Name",
                "pipeline": "Deal Name",
                "stage": "Stage",
                "assets": [ { "name": "Asset Name", "type": "", "indication": "", "phase": "" } ],
                "details": { "Scientific": {}, "Clinical": {}, "Financial": {}, "Legal": {} }
              },
              "upsert_contacts": [
                { "name": "Full Name", "currentCompany": "Company", "currentTitle": "Title", "email": "Email" }
              ],
              "add_timeline_event": {
                "type": "meeting/call/email",
                "title": "Title",
                "date": "YYYY-MM-DD",
                "desc": "Summary",
                "details": { "attendees": [] }
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

def extract_mixed(text: str) -> dict:
    """Universal extractor for mixed Project, Contact, and Event data."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        # Provide a rich mock for testing without API Key
        return {
            "update_project": {
                "company": "AeroGen Therapeutics",
                "pipeline": "Project Zephyr (Phase 1)",
                "stage": "Phase I",
                "details": { "Clinical": { "phase": "Phase 1", "status": "Recruiting" } }
            },
            "upsert_contacts": [
                { "name": "Dr. Elena Rodriguez", "currentCompany": "AeroGen Therapeutics", "currentTitle": "VP, Clinical Operations", "functionArea": "Clinical" },
                { "name": "Markus Theron", "currentCompany": "AeroGen Therapeutics", "currentTitle": "Head of Search & Evaluation", "functionArea": "BD" }
            ],
            "add_timeline_event": {
                "type": "meeting",
                "title": "Project Zephyr - Scientific Diligence",
                "date": datetime.datetime.now().strftime("%Y-%m-%d"),
                "desc": "Discussion on Phase 1 endpoints and enrollment.",
                "details": { "attendees": [ "Dr. Elena Rodriguez", "Markus Theron" ] }
            }
        }

    client = genai.Client(api_key=api_key)
    model_id = os.getenv("GEMINI_MODEL_ID", "gemini-3-flash-preview")
    
    system_instruction = """
        You are an advanced BioPharma BD Intelligence Analyst. 
        Your goal is to parse a complex, mixed input (like an email or call transcript) and extract MULTIPLE entities in a single JSON structure.
        
        ### ENTITIES TO EXTRACT:
        1. **Project Update**: Any information regarding a deal, asset, or pipeline.
        2. **Contacts**: Any people mentioned with their titles, companies, and roles.
        3. **Timeline Event**: The core event described by the input (e.g. the meeting itself, the email date).
        
        ### RULES:
        - If a person is mentioned, extract them into the `upsert_contacts` list.
        - If a project/deal is discussed, extract details into the `update_project` object.
        - Summarize the overall interaction into the `add_timeline_event` object.
        
        You MUST return a single valid JSON object matching this exact schema:
        {
          "update_project": {
            "company": "Company Name",
            "pipeline": "Pipeline/Asset Name",
            "stage": "Clinical Stage",
            "details": { "Scientific": {}, "Clinical": {}, "Financial": {}, "Legal": {} }
          },
          "upsert_contacts": [
            {
              "name": "Full Name",
              "currentCompany": "Company",
              "currentTitle": "Title",
              "functionArea": "Function (BD/Clinical/Legal)",
              "email": "Email if found",
              "profile": "Short bio",
              "careerHistory": []
            }
          ],
          "add_timeline_event": {
            "type": "meeting/call/email",
            "title": "Title of the interaction",
            "date": "YYYY-MM-DD",
            "desc": "Short summary",
            "details": {
              "attendees": [
                { "name": "Name", "title": "Title", "functionArea": "Function", "company": "Company" }
              ],
              "minutes": "Key takeaways"
            }
          }
        }
    """
    prompt = f"{system_instruction}\n\nUser Input:\n{text}"
    
    try:
        response = client.models.generate_content(
            model=model_id,
            contents=prompt,
            config={"response_mime_type": "application/json"}
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"Error during Mixed AI extraction: {e}")
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
    model_id = os.getenv("GEMINI_MODEL_ID", "gemini-3-flash-preview")
    
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
    model_id = os.getenv("GEMINI_MODEL_ID", "gemini-3-flash-preview")
    
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
    model_id = os.getenv("GEMINI_MODEL_ID", "gemini-3-flash-preview")
    
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
