-- Additional indexes for performance
CREATE INDEX idx_tests_teacher_id ON tests(teacher_id);
CREATE INDEX idx_submissions_student_name ON submissions(student_name);
CREATE INDEX idx_submissions_submitted_at ON submissions(submitted_at);
CREATE INDEX idx_corrections_created_at ON corrections(created_at);

-- pg_cron jobs for auto-cleanup
SELECT cron.schedule(
    'delete-expired-tests',
    '*/5 * * * *',
    $$
    DELETE FROM tests 
    WHERE expires_at < NOW() 
    AND id NOT IN (SELECT DISTINCT test_id FROM submissions)
    $$
);

SELECT cron.schedule(
    'delete-expired-submissions',
    '*/15 * * * *',
    $$DELETE FROM submissions WHERE expires_at < NOW()$$
);

SELECT cron.schedule(
    'delete-expired-corrections',
    '*/15 * * * *',
    $$DELETE FROM corrections WHERE expires_at < NOW()$$
);

-- RLS Policies
ALTER TABLE teacher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE corrections ENABLE ROW LEVEL SECURITY;

CREATE POLICY teacher_own_tests ON tests
    FOR ALL USING (teacher_id = auth.uid());

CREATE POLICY teacher_view_submissions ON submissions
    FOR SELECT USING (
        test_id IN (SELECT id FROM tests WHERE teacher_id = auth.uid())
    );

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE tests;
ALTER PUBLICATION supabase_realtime ADD TABLE submissions;