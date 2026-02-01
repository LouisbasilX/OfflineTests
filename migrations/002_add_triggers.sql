-- Triggers for expiration calculation
CREATE OR REPLACE FUNCTION set_test_expires_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.start_test_time IS NOT NULL THEN
        NEW.expires_at := NEW.start_test_time + 
                         (NEW.duration_minutes || ' minutes')::INTERVAL + 
                         '10 minutes'::INTERVAL;
    ELSE
        NEW.expires_at := NOW() + '24 hours'::INTERVAL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_test_expires_at
BEFORE INSERT OR UPDATE ON tests
FOR EACH ROW
EXECUTE FUNCTION set_test_expires_at();

-- Trigger for submissions expiration
CREATE OR REPLACE FUNCTION set_submission_expires_at()
RETURNS TRIGGER AS $$
DECLARE
    test_record RECORD;
BEGIN
    SELECT start_test_time, duration_minutes INTO test_record
    FROM tests WHERE id = NEW.test_id;
    
    IF test_record.start_test_time IS NOT NULL THEN
        NEW.expires_at := test_record.start_test_time + 
                         (test_record.duration_minutes || ' minutes')::INTERVAL + 
                         '3 hours'::INTERVAL;
    ELSE
        NEW.expires_at := NOW() + '3 hours'::INTERVAL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_submission_expires_at
BEFORE INSERT ON submissions
FOR EACH ROW
EXECUTE FUNCTION set_submission_expires_at();

-- Trigger for corrections expiration
CREATE OR REPLACE FUNCTION set_correction_expires_at()
RETURNS TRIGGER AS $$
DECLARE
    submission_expires TIMESTAMPTZ;
BEGIN
    SELECT expires_at INTO submission_expires
    FROM submissions WHERE id = NEW.submission_id;
    
    IF submission_expires IS NOT NULL THEN
        NEW.expires_at := submission_expires;
    ELSE
        NEW.expires_at := NOW() + '3 hours'::INTERVAL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_correction_expires_at
BEFORE INSERT ON corrections
FOR EACH ROW
EXECUTE FUNCTION set_correction_expires_at();