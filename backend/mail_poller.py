import os
import email
import imaplib
from email.header import decode_header
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

ZOHO_EMAIL = os.getenv("ZOHO_EMAIL")
ZOHO_PASSWORD = os.getenv("ZOHO_PASSWORD")
ZOHO_IMAP_SERVER = os.getenv("ZOHO_IMAP_SERVER", "imap.zoho.com")
ZOHO_IMAP_PORT = int(os.getenv("ZOHO_IMAP_PORT", "993"))


def _decode_header(value: str) -> str:
    """Decode email header encoding (e.g. UTF-8, Base64)."""
    parts = decode_header(value or "")
    decoded = []
    for part, enc in parts:
        if isinstance(part, bytes):
            decoded.append(part.decode(enc or "utf-8", errors="replace"))
        else:
            decoded.append(str(part))
    return " ".join(decoded)


def sync_zoho_inbox(db, ai_extract_fn) -> dict:
    """
    Connects to Zoho Mail via IMAP, fetches unread emails,
    runs AI extraction, and saves to the PendingIngestion table.
    Returns a summary dict with counts.
    """
    if not ZOHO_EMAIL or not ZOHO_PASSWORD:
        return {"error": "Zoho credentials not configured in .env"}

    import models

    synced = 0
    skipped = 0
    errors = []

    try:
        # Connect and Login
        mail = imaplib.IMAP4_SSL(ZOHO_IMAP_SERVER, ZOHO_IMAP_PORT)
        mail.login(ZOHO_EMAIL, ZOHO_PASSWORD)
        mail.select("inbox")

        # Search for UNSEEN (unread) emails
        status, messages = mail.search(None, "UNSEEN")
        if status != "OK" or not messages[0]:
            mail.logout()
            return {"synced": 0, "skipped": 0, "message": "No new emails found."}

        mail_ids = messages[0].split()

        for mail_id in mail_ids:
            try:
                # Fetch full email
                status, data = mail.fetch(mail_id, "(RFC822)")
                raw_email = data[0][1]
                msg = email.message_from_bytes(raw_email)

                # Parse metadata
                subject = _decode_header(msg.get("Subject", "No Subject"))
                sender = _decode_header(msg.get("From", "unknown@unknown.com"))
                # Extract plain email address from "Name <email>" format
                if "<" in sender and ">" in sender:
                    sender_email = sender.split("<")[1].split(">")[0].strip()
                else:
                    sender_email = sender.strip()

                # Extract body and attachment names
                plain_body = ""
                attachment_names = []

                if msg.is_multipart():
                    for part in msg.walk():
                        content_type = part.get_content_type()
                        disposition = str(part.get("Content-Disposition", ""))

                        if "attachment" in disposition:
                            filename = _decode_header(part.get_filename() or "")
                            if filename:
                                attachment_names.append(filename)
                        elif content_type == "text/plain" and not plain_body:
                            payload = part.get_payload(decode=True)
                            if payload:
                                plain_body = payload.decode(
                                    part.get_content_charset() or "utf-8",
                                    errors="replace"
                                )
                else:
                    payload = msg.get_payload(decode=True)
                    if payload:
                        plain_body = payload.decode(
                            msg.get_content_charset() or "utf-8",
                            errors="replace"
                        )

                if not plain_body.strip():
                    skipped += 1
                    continue

                # Run AI extraction
                try:
                    ai_payload = ai_extract_fn(plain_body, "project")
                except Exception as ai_err:
                    ai_payload = {}
                    errors.append(f"AI extraction failed for '{subject}': {ai_err}")

                # Save to PendingIngestion
                db_pending = models.PendingIngestion(
                    source_type="email",
                    sender_email=sender_email,
                    subject=subject,
                    raw_content=plain_body[:4000],  # Truncate to 4k chars
                    attachments=attachment_names,
                    ai_extracted_payload=ai_payload,
                    entity_type="project",
                    status="pending",
                    created_at=datetime.now().strftime("%Y-%m-%d %H:%M")
                )
                db.add(db_pending)
                db.commit()
                synced += 1

            except Exception as msg_err:
                errors.append(str(msg_err))
                skipped += 1
                continue

        mail.close()
        mail.logout()

    except imaplib.IMAP4.error as e:
        return {"error": f"IMAP login failed: {str(e)}. Check credentials or App Password."}
    except Exception as e:
        return {"error": f"Connection error: {str(e)}"}

    return {
        "synced": synced,
        "skipped": skipped,
        "errors": errors,
        "message": f"Synced {synced} new email(s) to inbox."
    }
