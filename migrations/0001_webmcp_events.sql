-- WebMCP usage beacon events (see WEBMCP.md). Anonymous register/execute
-- pings from /webmcp.js: tool names + argument KEY names only, never values.
-- Written by the Worker itself (POST /api/webmcp-beacon); read back with
-- wrangler d1 execute per WEBMCP.md.
CREATE TABLE IF NOT EXISTS webmcp_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT NOT NULL,
  event TEXT NOT NULL,
  tool TEXT,
  tools TEXT,
  arg_keys TEXT,
  path TEXT,
  user_agent TEXT
);
CREATE INDEX IF NOT EXISTS idx_webmcp_events_ts ON webmcp_events (ts);
