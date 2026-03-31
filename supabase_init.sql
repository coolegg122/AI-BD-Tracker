-- Supabase Database Initialization Script
-- Run this in Supabase SQL Editor to create all tables

-- Users table
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

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    company VARCHAR(255),
    pipeline VARCHAR(255),
    stage VARCHAR(255) DEFAULT 'Initial Contact',
    lastContactDate VARCHAR(255),
    nextFollowUp VARCHAR(255),
    status VARCHAR(255) DEFAULT 'active',
    owner_id INTEGER REFERENCES users(id),
    details JSONB DEFAULT '{}'
);

-- Attachments table
CREATE TABLE IF NOT EXISTS attachments (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255),
    file_type VARCHAR(50),
    category VARCHAR(255),
    url VARCHAR(500),
    uploaded_at VARCHAR(255)
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    type VARCHAR(50),
    desc VARCHAR(500),
    date VARCHAR(255),
    status VARCHAR(50)
);

-- Project History table
CREATE TABLE IF NOT EXISTS project_history (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    type VARCHAR(50),
    title VARCHAR(255),
    date VARCHAR(255),
    desc VARCHAR(500),
    details JSONB DEFAULT '{}'
);

-- Catalysts table
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

-- Contacts table
CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    currentCompany VARCHAR(255),
    currentTitle VARCHAR(255),
    functionArea VARCHAR(255),
    photoUrl VARCHAR(500),
    location VARCHAR(255),
    email VARCHAR(255),
    linkedin VARCHAR(500),
    phone VARCHAR(50)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_projects_company ON projects(company);
CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_contacts_name ON contacts(name);
CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts(currentCompany);

-- Insert a default admin user (optional)
-- Password: admin123 (hashed with bcrypt)
-- You can change this after first login
INSERT INTO users (name, email, role, initials, hashed_password, is_active)
VALUES (
    'Admin',
    'admin@example.com',
    'Admin',
    'AD',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTt4LK9m.0K9O',
    1
) ON CONFLICT (email) DO NOTHING;