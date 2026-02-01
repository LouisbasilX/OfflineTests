-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- Teacher profiles (permanent)
CREATE TABLE teacher_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) UNIQUE,
    full_name TEXT NOT NULL,
    institution TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tests table (will expire)
CREATE TABLE tests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    test_code CHAR(6) UNIQUE NOT NULL,
    encrypted_test_data JSONB NOT NULL,
    teacher_id UUID REFERENCES teacher_profiles(id) ON DELETE CASCADE,
    duration_minutes INTEGER NOT NULL,
    start_test_time TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    allow_corrections BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::JSONB
);

-- Submissions
CREATE TABLE submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    encrypted_submission_data JSONB NOT NULL,
    time_logs JSONB NOT NULL,
    is_suspicious BOOLEAN DEFAULT FALSE,
    score INTEGER,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

-- Corrections
CREATE TABLE corrections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
    encrypted_correction_data JSONB NOT NULL,
    teacher_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

-- Indexes
CREATE INDEX idx_tests_expires_at ON tests(expires_at);
CREATE INDEX idx_tests_test_code ON tests(test_code);
CREATE INDEX idx_submissions_expires_at ON submissions(expires_at);
CREATE INDEX idx_submissions_test_id ON submissions(test_id);
CREATE INDEX idx_corrections_expires_at ON corrections(expires_at);