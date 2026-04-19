-- =============================================================
-- AI-BD Tracker — Comprehensive Migration Script (v1.1)
-- Re-aligns Supabase schema with current FastAPI models.
-- =============================================================

-- 1. Rename Tables
ALTER TABLE IF EXISTS projects RENAME TO deals;
ALTER TABLE IF EXISTS project_history RENAME TO deal_history;

-- 2. Rename Columns in existing tables
ALTER TABLE IF EXISTS tasks RENAME COLUMN project_id TO deal_id;
ALTER TABLE IF EXISTS attachments RENAME COLUMN project_id TO deal_id;
ALTER TABLE IF EXISTS deal_history RENAME COLUMN project_id TO deal_id;

-- 3. Add Missing Columns to 'deals' (formerly projects)
ALTER TABLE deals ADD COLUMN IF NOT EXISTS source_text TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS negotiation_prep JSONB DEFAULT '{}';
ALTER TABLE deals ADD COLUMN IF NOT EXISTS prep_updated_at VARCHAR(255);

-- 4. Add Missing Columns to 'users'
ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_prefs JSONB DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS theme VARCHAR(50) DEFAULT 'light';

-- 5. Add Missing Columns to 'contacts'
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS source_text TEXT;

-- 6. Create Assets Table
CREATE TABLE IF NOT EXISTS assets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    company_id INTEGER REFERENCES company_intelligence(id) ON DELETE SET NULL,
    type VARCHAR(255),
    indication VARCHAR(255),
    phase VARCHAR(255),
    moa TEXT,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create Deal-Assets Junction Table (Many-to-Many)
CREATE TABLE IF NOT EXISTS deal_assets (
    deal_id INTEGER REFERENCES deals(id) ON DELETE CASCADE,
    asset_id INTEGER REFERENCES assets(id) ON DELETE CASCADE,
    PRIMARY KEY (deal_id, asset_id)
);

-- 8. Create Phase 2 Tables: Economics, Legal, and DD
CREATE TABLE IF NOT EXISTS deal_economics (
    id SERIAL PRIMARY KEY,
    deal_id INTEGER REFERENCES deals(id) ON DELETE CASCADE UNIQUE,
    upfront VARCHAR(255),
    milestones TEXT,
    royalties VARCHAR(255),
    total_deal_value VARCHAR(255),
    pos INTEGER DEFAULT 0,
    currency VARCHAR(50) DEFAULT 'USD'
);

CREATE TABLE IF NOT EXISTS legal_agreements (
    id SERIAL PRIMARY KEY,
    deal_id INTEGER REFERENCES deals(id) ON DELETE CASCADE,
    agreement_type VARCHAR(255),
    status VARCHAR(255),
    effective_date VARCHAR(255),
    expiration_date VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS due_diligence (
    id SERIAL PRIMARY KEY,
    deal_id INTEGER REFERENCES deals(id) ON DELETE CASCADE UNIQUE,
    vdr_link VARCHAR(500),
    status VARCHAR(255) DEFAULT 'Not Started',
    key_risks JSONB DEFAULT '[]'
);

-- 9. Update Indexes
DROP INDEX IF EXISTS idx_projects_company;
DROP INDEX IF EXISTS idx_projects_owner;
DROP INDEX IF EXISTS idx_tasks_project;

CREATE INDEX IF NOT EXISTS idx_deals_company ON deals(company);
CREATE INDEX IF NOT EXISTS idx_deals_owner ON deals(owner_id);
CREATE INDEX IF NOT EXISTS idx_tasks_deal ON tasks(deal_id);
CREATE INDEX IF NOT EXISTS idx_assets_name ON assets(name);
CREATE INDEX IF NOT EXISTS idx_deal_assets_deal ON deal_assets(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_assets_asset ON deal_assets(asset_id);
CREATE INDEX IF NOT EXISTS idx_legal_agreements_deal ON legal_agreements(deal_id);
