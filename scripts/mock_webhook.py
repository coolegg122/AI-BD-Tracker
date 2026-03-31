import requests
import json

url = "http://127.0.0.1:8000/api/v1/webhook/ingest"

payload = {
    "from": "partner@pfizer.com",
    "subject": "Fwd: Q3 Pipeline Readout and Deal Terms",
    "text": "Fwd: Hi Team,\n\nWe successfully completed the NDA review with Pfizer. They are interested in an early licensing deal for the CDK4/6 inhibitor asset. We agreed to share clinical data under CDA by next Friday.\n\nTakeaways:\n1. Prepare data room.\n2. Draft term sheet.\n\nBest,\nAlex",
    "attachments": [
        {"file_name": "Q3_Readout.pdf"},
        {"file_name": "Pfizer_Term_Sheet_Draft.docx"}
    ]
}

print(f"Sending mock email payload to {url}...")
try:
    response = requests.post(url, json=payload)
    print(f"Response ({response.status_code}):")
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"Error: Backend is probably not running. Please start the backend server. {e}")
