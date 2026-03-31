"""
Quick test script to verify Zoho IMAP connection and email parsing.
Runs standalone without needing the FastAPI server.
"""
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import email
import imaplib
from email.header import decode_header
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

ZOHO_EMAIL = os.getenv("ZOHO_EMAIL")
ZOHO_PASSWORD = os.getenv("ZOHO_PASSWORD")
ZOHO_IMAP_SERVER = os.getenv("ZOHO_IMAP_SERVER", "imap.zoho.com")
ZOHO_IMAP_PORT = int(os.getenv("ZOHO_IMAP_PORT", "993"))

def decode_hdr(value):
    parts = decode_header(value or "")
    decoded = []
    for part, enc in parts:
        if isinstance(part, bytes):
            decoded.append(part.decode(enc or "utf-8", errors="replace"))
        else:
            decoded.append(str(part))
    return " ".join(decoded)

print(f"Connecting to {ZOHO_IMAP_SERVER}:{ZOHO_IMAP_PORT} as {ZOHO_EMAIL}...")

try:
    mail = imaplib.IMAP4_SSL(ZOHO_IMAP_SERVER, ZOHO_IMAP_PORT)
    mail.login(ZOHO_EMAIL, ZOHO_PASSWORD)
    print("Login successful!")

    mail.select("inbox")
    status, messages = mail.search(None, "UNSEEN")
    mail_ids = messages[0].split() if messages[0] else []
    print(f"Found {len(mail_ids)} unread email(s).")

    for mail_id in mail_ids:
        status, data = mail.fetch(mail_id, "(RFC822)")
        raw_email = data[0][1]
        msg = email.message_from_bytes(raw_email)

        subject = decode_hdr(msg.get("Subject", "No Subject"))
        sender = msg.get("From", "unknown")
        print(f"\n--- Email ---")
        print(f"  From   : {sender}")
        print(f"  Subject: {subject}")

        plain_body = ""
        attachments = []
        if msg.is_multipart():
            for part in msg.walk():
                ct = part.get_content_type()
                disp = str(part.get("Content-Disposition", ""))
                if "attachment" in disp:
                    fname = decode_hdr(part.get_filename() or "")
                    if fname:
                        attachments.append(fname)
                elif ct == "text/plain" and not plain_body:
                    payload = part.get_payload(decode=True)
                    if payload:
                        plain_body = payload.decode(part.get_content_charset() or "utf-8", errors="replace")
        else:
            payload = msg.get_payload(decode=True)
            if payload:
                plain_body = payload.decode(msg.get_content_charset() or "utf-8", errors="replace")

        print(f"  Body   :\n{plain_body[:500]}")
        if attachments:
            print(f"  Attachments: {attachments}")

    mail.close()
    mail.logout()
    print("\nDone.")

except imaplib.IMAP4.error as e:
    print(f"IMAP Error: {e}")
except Exception as e:
    print(f"Error: {e}")
