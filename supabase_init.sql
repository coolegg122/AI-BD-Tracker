-- =============================================================
-- AI-BD Tracker — Supabase Database Initialization Script
-- Updated to match all models through v0.1.0 (see backend/models.py).
--
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor).
-- Safe to re-run: all statements use IF NOT EXISTS / ON CONFLICT DO NOTHING.
-- If production errors mention missing tables/columns, run only the missing
-- CREATE TABLE / ALTER sections; do not duplicate data-migrating steps blindly.
-- =============================================================

-- ---------------------------
-- USERS
-- ---------------------------
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    firebase_uid VARCHAR(255) UNIQUE,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(255),
    initials VARCHAR(50),
    hashed_password VARCHAR(255),
    is_active INTEGER DEFAULT 1
);

-- ---------------------------
-- PROJECTS
-- ---------------------------
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    company VARCHAR(255),
    pipeline VARCHAR(255),
    stage VARCHAR(255) DEFAULT 'Initial Contact',
    "lastContactDate" VARCHAR(255),
    "nextFollowUp" VARCHAR(255),
    status VARCHAR(255) DEFAULT 'active',
    owner_id INTEGER REFERENCES users(id),
    details JSONB DEFAULT '{}'
);

-- ---------------------------
-- ATTACHMENTS
-- ---------------------------
CREATE TABLE IF NOT EXISTS attachments (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255),
    file_type VARCHAR(50),
    category VARCHAR(255),
    url VARCHAR(500),
    uploaded_at VARCHAR(255)
);

-- ---------------------------
-- TASKS
-- ---------------------------
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    type VARCHAR(50),
    desc VARCHAR(500),
    date VARCHAR(255),
    status VARCHAR(50)
);

-- ---------------------------
-- PROJECT HISTORY
-- ---------------------------
CREATE TABLE IF NOT EXISTS project_history (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    type VARCHAR(50),
    title VARCHAR(255),
    date VARCHAR(255),
    desc VARCHAR(500),
    details JSONB DEFAULT '{}'
);

-- ---------------------------
-- CATALYSTS (competitor intelligence / schedule events)
-- ---------------------------
CREATE TABLE IF NOT EXISTS catalysts (
    id SERIAL PRIMARY KEY,
    competitor VARCHAR(255),
    asset VARCHAR(255),
    type VARCHAR(255),
    event VARCHAR(500),
    date VARCHAR(255),
    impact VARCHAR(50) DEFAULT 'Medium',
    color VARCHAR(50) DEFAULT 'blue'
);

-- ---------------------------
-- CONTACTS  (Phase 25: added profile, metAt, details)
-- ---------------------------
CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    "currentCompany" VARCHAR(255),
    "currentTitle" VARCHAR(255),
    "functionArea" VARCHAR(255),
    "photoUrl" VARCHAR(500),
    location VARCHAR(255),
    email VARCHAR(255),
    linkedin VARCHAR(500),
    phone VARCHAR(50),
    profile TEXT,
    "metAt" JSONB DEFAULT '[]',
    details JSONB DEFAULT '{}'
);

-- ---------------------------
-- CAREER HISTORIES  (was missing from old SQL)
-- ---------------------------
CREATE TABLE IF NOT EXISTS career_histories (
    id SERIAL PRIMARY KEY,
    contact_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
    company VARCHAR(255),
    title VARCHAR(255),
    "dateRange" VARCHAR(255),
    "isCurrent" INTEGER DEFAULT 0
);

-- ---------------------------
-- COMPANY INTELLIGENCE  (Phase 19+, was missing from old SQL)
-- ---------------------------
CREATE TABLE IF NOT EXISTS company_intelligence (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) UNIQUE NOT NULL,
    focus_areas JSONB DEFAULT '[]',
    bd_strategy TEXT,
    patent_cliffs JSONB DEFAULT '[]',
    recent_deals JSONB DEFAULT '[]',
    last_updated VARCHAR(255)
);

-- ---------------------------
-- PENDING INGESTION  (Phase 22+, was missing from old SQL)
-- ---------------------------
CREATE TABLE IF NOT EXISTS pending_ingestion (
    id SERIAL PRIMARY KEY,
    source_type VARCHAR(50) DEFAULT 'email',
    sender_email VARCHAR(255),
    subject VARCHAR(500),
    raw_content TEXT,
    attachments JSONB DEFAULT '[]',
    ai_extracted_payload JSONB DEFAULT '{}',
    entity_type VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending',
    created_at VARCHAR(255)
);

-- ---------------------------
-- SMART INPUT ARCHIVE  (v0.1.0+)
-- ---------------------------
CREATE TABLE IF NOT EXISTS smart_input_archive (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    raw_text TEXT,
    source_type VARCHAR(50), -- manual, email, zoho
    entities_summary JSONB DEFAULT '{}',
    created_at VARCHAR(50)
);

-- ---------------------------
-- INDEXES
-- ---------------------------
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_projects_company ON projects(company);
CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_contacts_name ON contacts(name);
CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts("currentCompany");
CREATE INDEX IF NOT EXISTS idx_career_histories_contact ON career_histories(contact_id);
CREATE INDEX IF NOT EXISTS idx_company_intelligence_name ON company_intelligence(company_name);
CREATE INDEX IF NOT EXISTS idx_pending_ingestion_sender ON pending_ingestion(sender_email);
CREATE INDEX IF NOT EXISTS idx_pending_ingestion_status ON pending_ingestion(status);
CREATE INDEX IF NOT EXISTS idx_smart_input_archive_user ON smart_input_archive(user_id);
CREATE INDEX IF NOT EXISTS idx_smart_input_archive_created ON smart_input_archive(created_at);

-- ---------------------------
-- DEFAULT ADMIN USER
-- Password: admin123 (bcrypt hash — change after first login via register page)
-- ---------------------------
INSERT INTO users (name, email, role, initials, hashed_password, is_active)
VALUES (
    'Admin',
    'admin@example.com',
    'Admin',
    'AD',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTt4LK9m.0K9O',
    1
) ON CONFLICT (email) DO NOTHING;