import os
import json
import google.generativeai as genai

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
        
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    prompts = {
        "project": """
            你是一个专业的医药BD助手。请从用户输入的沟通记录中提取项目信息并进行数据脱敏。
            必须只返回一个符合以下结构的JSON对象，绝对不要有任何markdown包裹：
            {
              "company": "公司名称",
              "pipeline": "管线或资产名称",
              "stage": "Initial Contact",
              "nextFollowUp": "YYYY-MM-DD",
              "tasks": [
                { "type": "meeting", "desc": "具体的待办事项描述", "date": "日期或 TBD", "status": "pending" }
              ]
            }
        """,
        "contact": """
            你是一个专业的医药BD助手。请从沟通记录或名片信息中提取高管联系人及其履历。
            必须只返回一个符合以下结构的JSON对象，绝对不要有任何markdown包裹：
            {
              "name": "姓名",
              "currentCompany": "当前所属公司",
              "currentTitle": "当前职位",
              "functionArea": "职能领域 (e.g. Oncology, BD, CMC)",
              "location": "城市",
              "email": "邮箱 (若有)",
              "linkedin": "领英链接 (若有)",
              "phone": "电话 (若有)",
              "profile": "个人简介 (20字以内)",
              "careerHistory": [
                { "company": "公司名", "title": "职位", "dateRange": "20XX-20XX", "isCurrent": true/false }
              ]
            }
        """,
        "meeting_note": """
            你是一个专业的医药BD助手。请从会议摘要或沟通记录中提取核心Takeaways。
            由于这些纪要必须关联到一个BD项目，请尝试基于上下文猜测该纪要对应哪家公司或哪项资产（suspected_project_name）。
            必须只返回一个符合以下结构的JSON对象，绝对不要有任何markdown包裹：
            {
              "type": "meeting/email/call",
              "title": "简短的纪要标题",
              "date": "YYYY-MM-DD (会议日期)",
              "desc": "核心结论或进展 (50字以内)",
              "suspected_project_name": "最可能的公司名称或资产名称 (用于匹配关联项目)"
            }
        """
    }
    
    system_instruction = prompts.get(target_type, prompts["project"])
    prompt = f"{system_instruction}\n\nUser Input:\n{text}"
    
    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json"
            )
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"Error during AI extraction ({target_type}): {e}")
        raise

def generate_company_intelligence(company_name: str) -> dict:
    import datetime
    api_key = os.getenv("GEMINI_API_KEY")
    
    # We provide a highly customized mock if no API key is present,
    # or to guarantee speed and quality for demo purposes on these top-tier companies.
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
        
        # Give Merck & Novartis specific mock data if requested
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

    # If API key is present, actually call the model:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-1.5-flash')
    
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
        response = model.generate_content(
            system_instruction,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json"
            )
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"Error during intelligence generation: {e}")
        raise
