import os
import sys
from dotenv import load_dotenv

sys.path.append('backend')
load_dotenv()

from ai_engine import extract_universal, generate_company_intelligence

print("=== Test 1: Project Extraction ===")
text = "We had a great call with Vertex Pharmaceuticals today. They are interested in our ADC platform for their CF lung franchise. Next follow up is scheduled for April 15th to discuss CDAs."
try:
    result = extract_universal(text, "project")
    print(f"  Company: {result.get('company')}")
    print(f"  Pipeline: {result.get('pipeline')}")
    print(f"  Stage: {result.get('stage')}")
    print(f"  Next Follow-up: {result.get('nextFollowUp')}")
    print(f"  Details: {result.get('details')}")
    print(f"  Tasks: {result.get('tasks')}")
    print("  [PASS]")
except Exception as e:
    print(f"  [FAIL] {e}")

print("\n=== Test 2: Company Intelligence ===")
try:
    intel = generate_company_intelligence("AstraZeneca")
    print(f"  Company: {intel.get('company_name')}")
    print(f"  Focus Areas: {intel.get('focus_areas')}")
    print(f"  BD Strategy: {intel.get('bd_strategy','')[:120]}...")
    print(f"  Recent Deals: {intel.get('recent_deals')}")
    print("  [PASS]")
except Exception as e:
    print(f"  [FAIL] {e}")
