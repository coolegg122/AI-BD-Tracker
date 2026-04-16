-- =============================================================
-- AI-BD Tracker — Iteration 1: Asset & Deal Refactoring
-- =============================================================

-- 1. Rename Projects to Deals
ALTER TABLE IF EXISTS projects RENAME TO deals;

-- 2. Rename Project History to Deal History
ALTER TABLE IF EXISTS project_history RENAME TO deal_history;

-- 3. Rename Foreign Key Columns
-- child table: tasks
ALTER TABLE IF EXISTS tasks RENAME COLUMN project_id TO deal_id;
-- child table: attachments
ALTER TABLE IF EXISTS attachments RENAME COLUMN project_id TO deal_id;
-- child table: deal_history (formerly project_history)
ALTER TABLE IF EXISTS deal_history RENAME COLUMN project_id TO deal_id;

-- 4. Create Assets Table
CREATE TABLE IF NOT EXISTS assets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    company_id INTEGER REFERENCES company_intelligence(id) ON DELETE SET NULL,
    type VARCHAR(255), -- Small Molecule, Antibody, ADC, etc.
    indication VARCHAR(255),
    phase VARCHAR(255), -- Discovery, Preclinical, Phase I, etc.
    moa TEXT, -- Mechanism of Action
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create Deal-Assets Junction Table (Many-to-Many)
CREATE TABLE IF NOT EXISTS deal_assets (
    deal_id INTEGER REFERENCES deals(id) ON DELETE CASCADE,
    asset_id INTEGER REFERENCES assets(id) ON DELETE CASCADE,
    PRIMARY KEY (deal_id, asset_id)
);

-- 6. Update Indexes (Optional but recommended for performance)
DROP INDEX IF EXISTS idx_projects_company;
DROP INDEX IF EXISTS idx_projects_owner;
DROP INDEX IF EXISTS idx_tasks_project;

CREATE INDEX IF NOT EXISTS idx_deals_company ON deals(company);
CREATE INDEX IF NOT EXISTS idx_deals_owner ON deals(owner_id);
CREATE INDEX IF NOT EXISTS idx_tasks_deal ON tasks(deal_id);
CREATE INDEX IF NOT EXISTS idx_assets_company ON assets(company_id);
CREATE INDEX IF NOT EXISTS idx_deal_assets_deal ON deal_assets(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_assets_asset ON deal_assets(asset_id);
