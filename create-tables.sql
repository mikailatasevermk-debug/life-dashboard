-- Create all tables for Life Dashboard
-- Run this in your Supabase SQL Editor

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    image TEXT,
    email_verified TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Accounts table for NextAuth
CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    provider TEXT NOT NULL,
    provider_account_id TEXT NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at INTEGER,
    token_type TEXT,
    scope TEXT,
    id_token TEXT,
    session_state TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(provider, provider_account_id)
);

-- Sessions table for NextAuth
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    session_token TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL,
    expires TIMESTAMP WITH TIME ZONE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Spaces table
CREATE TABLE IF NOT EXISTS spaces (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    type TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    icon TEXT,
    description TEXT,
    "order" INTEGER DEFAULT 0
);

-- Insert the 7 life spaces
INSERT INTO spaces (type, name, color, icon, description, "order") VALUES
('PROJECTS', 'Projects / Business', '#E63946', 'briefcase', 'Your creative ventures and business ideas', 1),
('FAMILY', 'Family', '#06D6A0', 'users', 'Memories and moments with loved ones', 2),
('HOME', 'Home / Dreams', '#118AB2', 'home', 'Your sanctuary and future aspirations', 3),
('LOVE', 'Love with Wife', '#FF8FA3', 'heart', 'Cherished moments and expressions of love', 4),
('BUYING', 'Conscious Buying', '#FFD166', 'shopping-bag', 'Mindful purchases and wishlist', 5),
('CAREER', 'Work / Career', '#5F6C7B', 'building-2', 'Professional growth and achievements', 6),
('FAITH', 'Religion / Faith', '#6A4C93', 'church', 'Spiritual journey and reflections', 7)
ON CONFLICT (type) DO NOTHING;

-- Notes table  
CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL,
    space_type TEXT NOT NULL,
    title TEXT,
    content JSONB DEFAULT '{}',
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (space_type) REFERENCES spaces(type)
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_notes_user_space ON notes(user_id, space_type);

-- Verification tokens for NextAuth
CREATE TABLE IF NOT EXISTS verification_tokens (
    identifier TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires TIMESTAMP WITH TIME ZONE NOT NULL,
    UNIQUE(identifier, token)
);