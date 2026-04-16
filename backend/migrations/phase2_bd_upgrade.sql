-- Phase 2: Professional BD Workstation Migration
-- This script adds the underlying tables for Deal Economics, Legal Agreements, and Due Diligence.

-- 1. Deal Economics (Valuation & Financials)
CREATE TABLE IF NOT EXISTS deal_economics (
    id SERIAL PRIMARY KEY,
    deal_id INTEGER NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    upfront VARCHAR,
    milestones TEXT,
    royalties VARCHAR,
    total_deal_value VARCHAR,
    pos INTEGER DEFAULT 0,
    currency VARCHAR DEFAULT 'USD',
    UNIQUE(deal_id)
);

-- 2. Legal Agreements (Lifecycle Tracking)
CREATE TABLE IF NOT EXISTS legal_agreements (
    id SERIAL PRIMARY KEY,
    deal_id INTEGER NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    agreement_type VARCHAR NOT NULL, -- NDA, Term Sheet, Definitive, etc.
    status VARCHAR DEFAULT 'In Review', -- In Review, Negotiating, Signed, Expired
    effective_date VARCHAR,
    expiration_date VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Due Diligence Tracker (Risk & VDR)
CREATE TABLE IF NOT EXISTS due_diligence_tracker (
    id SERIAL PRIMARY KEY,
    deal_id INTEGER NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    vdr_link VARCHAR,
    status VARCHAR DEFAULT 'Pending', -- Pending, Active, Clean, Flagged
    key_risks JSONB DEFAULT '[]'::jsonb,
    UNIQUE(deal_id)
);
