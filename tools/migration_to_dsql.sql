-- AWS DSQL Migration Script
-- PostgreSQL-based schema without Foreign Keys
-- Migration from DynamoDB to AWS DSQL

-- Drop tables if they exist
DROP TABLE IF EXISTS event_check_in;
DROP TABLE IF EXISTS event_registration;
DROP TABLE IF EXISTS event;
DROP TABLE IF EXISTS event_organization;

-- Event Organization Table
CREATE TABLE event_organization (
    organization_code VARCHAR(100) PRIMARY KEY,
    organization_name VARCHAR(255) NOT NULL,
    logo_url TEXT NOT NULL,
    event_version TEXT NOT NULL,  -- Comma-separated list (AWS DSQL doesn't support array columns)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_organization_name ON event_organization(organization_name);

-- Event Table
CREATE TABLE event (
    event_code VARCHAR(100) PRIMARY KEY,
    event_date_time TIMESTAMP NOT NULL,
    description TEXT NULL,
    event_name VARCHAR(255) NOT NULL,
    qr_url TEXT NULL,
    code_expired_at TIMESTAMP NOT NULL,
    event_version VARCHAR(50) NOT NULL,
    organization_code VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
);

-- Indexes for Event table
CREATE INDEX idx_event_date_time ON event(event_date_time);
CREATE INDEX idx_event_organization_code ON event(organization_code);
CREATE INDEX idx_event_code_expired_at ON event(code_expired_at);

-- Event Registration Table
CREATE TABLE event_registration (
    event_code VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (event_code, phone)
);

-- Indexes for Event Registration table
CREATE INDEX idx_registration_phone ON event_registration(phone);

-- Event Check-In Table
-- Denormalized organization_code for statistics (event_name via JOIN)
CREATE TABLE event_check_in (
    phone VARCHAR(20) NOT NULL,
    event_code VARCHAR(100) NOT NULL,
    name VARCHAR(255),
    checked_at TIMESTAMP NOT NULL,
    event_version VARCHAR(50) NOT NULL,
    -- Denormalized field for organization-level statistics
    organization_code VARCHAR(100) NOT NULL,
    PRIMARY KEY (phone, event_code)
);

-- Indexes for Event Check-In table (optimized for statistics)
CREATE INDEX idx_checkin_event_code ON event_check_in(event_code);
CREATE INDEX idx_checkin_checked_at ON event_check_in(checked_at);
CREATE INDEX idx_checkin_organization_code ON event_check_in(organization_code);
CREATE INDEX idx_checkin_org_version ON event_check_in(organization_code, event_version);

-- Comments for documentation
COMMENT ON TABLE event_organization IS 'Stores organization information';
COMMENT ON TABLE event IS 'Stores event information';
COMMENT ON TABLE event_registration IS 'Stores event registration records';
COMMENT ON TABLE event_check_in IS 'Stores event check-in records';

COMMENT ON COLUMN event.qr_url IS 'CloudFront URL for QR code';
COMMENT ON COLUMN event.code_expired_at IS 'Expiration time for event code';
COMMENT ON COLUMN event_organization.event_version IS 'Comma-separated list of event versions (e.g., "v1,v2,v3"). Use string_to_array(event_version, '','') to query as array';
