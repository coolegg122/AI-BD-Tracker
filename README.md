# AI-BD Tracker 🚀

**Intelligent Pipeline & Intelligence Management for Pharmaceutical Business Development Teams.**

AI-BD Tracker is a professional-grade SaaS platform designed to replace fragmented spreadsheets and manual deal tracking in the biotech and pharmaceutical industry. It leverages **Google Gemini 3 Flash** to automate data ingestion, intelligence gathering, and pipeline visualization.

---

## 🏗️ Architecture & Tech Stack

The system follows a modern decoupled architecture optimized for speed, AI performance, and cloud-native deployment.

- **Frontend**: 
  - **Framework**: React 19 + Vite 8
  - **Styling**: Tailwind CSS 4 (Glassmorphism & Premium Dark/Light UI)
  - **Visualization**: Recharts (Project Funnels & Portfolio Momentum)
  - **Icons**: Lucide-React
  - **State**: Zustand
- **Backend**:
  - **Framework**: FastAPI (Asynchronous Python)
  - **ORM**: SQLAlchemy 2.0
  - **Database**: Supabase (Cloud PostgreSQL) + SQLite (Local Dev)
  - **AI Engine**: Google Gemini 3 Flash Preview (Official `google-genai` SDK)
- **Deployment**:
  - **Compute**: Vercel Serverless Functions
  - **Secrets**: Vercel Environment Variables
  - **Database**: Supabase IPv4 Transaction Pooler (Port 6543)

---

## 🌟 Key Features (v25.0)

### 1. 📊 Executive Dashboard
Real-time visual intelligence for BD leads.
- **Project Funnel**: Interactive chart showing deal distribution from "Initial Contact" to "Closing".
- **Portfolio Trend**: Area charts tracking AI ingestion counts and pipeline growth over the last 6 months.
- **Active Metrics**: Critical KPIs like "Follow-ups due this week" and "Stalled Projects".

### 2. 🏗️ High-Fidelity Kanban (Pipeline 360°)
A flexible deal board that adapts to your mental model.
- **Dual Perspectives**: Toggle between "Group by Asset" or "Group by Partner Company".
- **Intelligent Status**: Color-coded alerts for overdue tasks or stalled interactions.

### 3. 🧠 Smart Input & AI Review Inbox
The core engine that eliminates data entry.
- **Multi-Entity Extraction**: AI extracts Projects, Contacts, and Meeting Notes from raw text in one go.
- **Review Workflow**: Asynchronous ingestion via **Zoho Mail IMAP** or Webhooks. Data lands in a "Pending Inbox" for human-in-the-loop verification before entering the production database.
- **Smart Association**: AI detects which existing project a meeting note belongs to based on context.

### 4. 📂 Historical Footprints & Attachments
A deep-dive timeline view for every project.
- **Deep Downwards**: Expand timeline events to see full email bodies, meeting minutes, and attendees.
- **Real File Downloads**: Integrated anchor links for CDA PDFs, Meeting Transcripts, and Deck downloads.

### 5. 👥 Key Contacts CRM
Integrated networking management for industry executives.
- **Career Tracking**: Automated 1-to-N mapping of executive career histories.
- **Profile Enrichment**: Support for LinkedIn links, email, and "Met At" conference history.

### 6. 🌍 Conferences Hub
Specialized mode for major industry events (JPM, BIO, ASCO).
- **Countdown Engine**: Real-time counters and timezone conversions.
- **Conference Assets**: Dedicated storage for conference-specific intelligence.

---

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.11+
- Node.js 18+
- [Google Gemini API Key](https://aistudio.google.com/)
- Supabase Project (PostgreSQL)

### 2. Backend Setup
```bash
# Register venv
python -m venv .venv
source .venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Initial Migrations (Historical Footprints & Pending Inbox)
python scripts/migrate_history_table.py
python scripts/create_pending_table.py
python backend/migrate_add_details.py

# Run Server
uvicorn backend.main:app --reload
```

### 3. Frontend Setup
```bash
cd ai-bd-tracker
npm install
npm run dev
```
*Note: Ensure you access the frontend via `127.0.0.1:5173` to allow the Vite Proxy to forward `/api` requests to the backend.*

---

## 🔑 Environment Variables (.env)

Create a `.env` file in the root directory:

```env
# AI
GEMINI_API_KEY=your_key_here

# Database (Supabase Pooler)
DATABASE_URL=postgresql://postgres.[ID]:[PWD]@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?sslmode=require

# External Ingestion (Zoho IMAP)
ZOHO_EMAIL=bdtracker212@zohomail.com
ZOHO_PASSWORD=your_app_password
```

---

## 🔄 Synchronization SOP (Dual-Machine)

To maintain consistency between Windows and Mac Mini environments:
1. **Pull**: `git pull origin main` before starting.
2. **Work**: Document progress in `dev_log.md`.
3. **Push**: `git push origin main` using the format `SOP Sync: Phase [X] - [Desc]`.

---

## 📜 Development Status
✅ **Phase 25 (Unrestricted Data Strategy) is Live.**
The system now supports arbitrary JSON metadata storage for Projects and Contacts, allowing the AI to capture infinite business dimensions without database schema changes.

---
*Created by Antigravity AI Code Assistant for the AI-BD Tracker Project.*
