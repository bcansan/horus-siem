-- HORUS initial schema (minimal placeholder)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(64) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(32) NOT NULL DEFAULT 'admin'
);

CREATE TABLE IF NOT EXISTS api_keys (
  id SERIAL PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  key VARCHAR(128) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Extensions required
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Minimal events and alerts tables to support agent view stats
CREATE TABLE IF NOT EXISTS events (
  id VARCHAR(255) PRIMARY KEY,
  agent_id UUID,
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  agent_id UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Agents management
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name VARCHAR(255) UNIQUE NOT NULL,
  hostname VARCHAR(255) NOT NULL,
  ip_address INET,
  os_type VARCHAR(50),
  os_version VARCHAR(100),
  agent_version VARCHAR(50),
  status VARCHAR(20) DEFAULT 'online',
  last_heartbeat TIMESTAMP,
  first_seen TIMESTAMP DEFAULT NOW(),
  tags JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_metrics (
  id SERIAL PRIMARY KEY,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  cpu_usage FLOAT,
  memory_usage FLOAT,
  disk_usage FLOAT,
  events_sent_last_hour INTEGER,
  events_sent_total BIGINT,
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_hostname ON agents(hostname);
CREATE INDEX IF NOT EXISTS idx_agents_last_heartbeat ON agents(last_heartbeat);
CREATE INDEX IF NOT EXISTS idx_agent_metrics_agent_id ON agent_metrics(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_metrics_timestamp ON agent_metrics(timestamp);

-- Materialized view for agent stats
CREATE MATERIALIZED VIEW IF NOT EXISTS agent_stats AS
SELECT 
  a.id,
  a.agent_name,
  a.hostname,
  a.status,
  (SELECT COUNT(*) FROM events e WHERE e.agent_id = a.id AND e.timestamp > NOW() - INTERVAL '24 hours') AS total_events_24h,
  (SELECT COUNT(*) FROM alerts al WHERE al.agent_id = a.id AND al.created_at > NOW() - INTERVAL '24 hours') AS alerts_generated_24h,
  (SELECT MAX(e2.timestamp) FROM events e2 WHERE e2.agent_id = a.id) AS last_event_time
FROM agents a;

CREATE UNIQUE INDEX IF NOT EXISTS idx_agent_stats_id ON agent_stats(id);

-- Threat Intelligence tables
CREATE TABLE IF NOT EXISTS threat_iocs (
  id SERIAL PRIMARY KEY,
  ioc_type VARCHAR(50) NOT NULL,
  ioc_value VARCHAR(500) NOT NULL,
  threat_type VARCHAR(100),
  severity VARCHAR(20),
  confidence INTEGER,
  description TEXT,
  source VARCHAR(100),
  tags JSONB DEFAULT '[]',
  first_seen TIMESTAMP DEFAULT NOW(),
  last_seen TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS threat_matches (
  id SERIAL PRIMARY KEY,
  event_id VARCHAR(255),
  ioc_id INTEGER REFERENCES threat_iocs(id),
  agent_id UUID REFERENCES agents(id),
  matched_at TIMESTAMP DEFAULT NOW(),
  context JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS threat_feeds (
  id SERIAL PRIMARY KEY,
  feed_name VARCHAR(255) UNIQUE NOT NULL,
  feed_url TEXT,
  feed_type VARCHAR(50),
  enabled BOOLEAN DEFAULT true,
  last_updated TIMESTAMP,
  update_frequency_hours INTEGER DEFAULT 24,
  ioc_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_threat_iocs_type_value ON threat_iocs(ioc_type, ioc_value);
CREATE INDEX IF NOT EXISTS idx_threat_iocs_active ON threat_iocs(is_active);
CREATE INDEX IF NOT EXISTS idx_threat_iocs_severity ON threat_iocs(severity);
CREATE INDEX IF NOT EXISTS idx_threat_matches_event ON threat_matches(event_id);
CREATE INDEX IF NOT EXISTS idx_threat_matches_ioc ON threat_matches(ioc_id);
CREATE INDEX IF NOT EXISTS idx_threat_iocs_description_fts ON threat_iocs USING gin(to_tsvector('english', description));


