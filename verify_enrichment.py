import sys
import os
import json

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from ai_engine import extract_universal

test_text = """
Meeting Minutes from Novartis Discussion (Clinical Phase 2 Expansion).
Attendees: Dr. Sarah Smith (Oncology Head), Mike Zhang (BD Director).

Summary: We discussed the HER2-targeted ADC project (VTX-804) for Gastric Cancer. 
Mechanism of action is a novel topoisomerase inhibitor payload.
Currently in Phase Ib expansion (NCT0555999), primary endpoint is ORR.
Financials: They are looking for $20M upfront and $200M in biobucks. 
Documents mentioned: 
- "VTX-804_Scientific_Report.pdf" (Scientific)
- "Ipsen_Novartis_Teaser.ppt" (Commercial)
- "Draft_NDA_Agreement.docx" (Legal)

Manufacturing is currently done in Singapore via a CMO.
"""

print("Running AI Extraction Test...")
result = extract_universal(test_text, target_type="project")
print(json.dumps(result, indent=2))
