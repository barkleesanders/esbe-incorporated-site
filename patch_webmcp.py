#!/usr/bin/env python3
"""Apply the WebMCP change to the recovered live bundle (index.js).

Deterministic, assertion-guarded string surgery on the exact bundle bytes
that production runs (2026-11-03 live baseline: index.js 218,597 bytes,
sha256 3853fef721de..., recovered via the Cloudflare API; see README
"2026-11-03 — live-bytes baseline" and WEBMCP.md):
  1. Every page (/, /donate, /community, /privacy, /terms) loads the
     legacy registrar tag
       <script type="module" src="/webmcp.js"></script>
     (source form escapes the closing tag as <\\/script>). The tools
     file is inserted immediately before it on all 5 pages:
       <script type="module" src="/webmcp-tools.js"></script>
     In the same change, public/webmcp.js is replaced by the canonical
     fleet registrar and public/webmcp-tools.js is added as a new asset,
     so the legacy in-bundle wiring keeps working with the new files.
  2. A POST /api/webmcp-beacon route (the WebMCP usage beacon: field
     whitelist, <=2 KB body, always 204, stores server timestamp +
     whitelisted payload + User-Agent in D1 binding WEBMCP_DB, table
     webmcp_events — argument KEY names only, never values) is inserted
     immediately before the ASSETS catch-all route.

Run: python3 patch_webmcp.py index.js > index.patched.js  (or in place with -i)
Re-running it on the baseline reproduces the deployed bundle byte-for-byte.
It refuses (AssertionError) if any anchor count differs from the baseline's.
"""
import sys

TAG_OLD = r'<script type="module" src="/webmcp.js"><\/script>'
TAG_NEW = r'<script type="module" src="/webmcp-tools.js"><\/script>' + "\n    " + TAG_OLD

CATCHALL = 'app.get("*", (c) => c.env.ASSETS.fetch(c.req.raw));'

BEACON_ROUTE = r'''// ----- WebMCP usage beacon (added by patch_webmcp.py; see WEBMCP.md) -----
// POST /api/webmcp-beacon: anonymous register/execute pings from the page's
// WebMCP registrar. Whitelisted fields only, argument KEY names never
// values, always 204 — the beacon never fails the page.
app.post("/api/webmcp-beacon", async (c) => {
  try {
    const rawBody = await c.req.text();
    if (rawBody.length <= 2048 && c.env.WEBMCP_DB) {
      const data = JSON.parse(rawBody);
      const event = data.event;
      if (event === "register" || event === "execute") {
        const capStr = (v, n) => (typeof v === "string" ? v.slice(0, n) : null);
        const capList = (v, items, n) => Array.isArray(v) ? v.filter((x) => typeof x === "string").slice(0, items).map((x) => x.slice(0, n)) : [];
        await c.env.WEBMCP_DB.prepare("INSERT INTO webmcp_events (ts, event, tool, tools, arg_keys, path, user_agent) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)").bind(new Date().toISOString(), event, event === "execute" ? capStr(data.tool, 128) : null, event === "register" ? JSON.stringify(capList(data.tools, 32, 128)) : null, event === "execute" ? JSON.stringify(capList(data.argKeys, 16, 64)) : null, capStr(data.path, 256), capStr(c.req.header("user-agent"), 256)).run();
      }
    }
  } catch (e) {
    // Dropped silently by design — the beacon never fails the page.
  }
  return c.body(null, 204);
});
'''


def apply(src: str) -> str:
    # Baseline guards: this transform is defined against the 2026-11-03
    # live baseline only. Anything else is a different bundle — stop.
    assert "webmcp-tools" not in src, "already patched: webmcp-tools present"
    assert "webmcp-beacon" not in src, "already patched: webmcp-beacon present"
    assert src.count(TAG_OLD) == 5, f"expected 5 legacy registrar tags, found {src.count(TAG_OLD)}"
    assert src.count(CATCHALL) == 1, f"expected 1 ASSETS catch-all, found {src.count(CATCHALL)}"

    out = src.replace(TAG_OLD, TAG_NEW)
    assert out.count(TAG_OLD) == 5, "registrar tags must survive the transform"
    assert out.count(r'<script type="module" src="/webmcp-tools.js"><\/script>') == 5, "tools tag must land on all 5 pages"

    out = out.replace(CATCHALL, BEACON_ROUTE + CATCHALL)
    assert out.count('app.post("/api/webmcp-beacon"') == 1, "beacon route must land exactly once"
    assert out.count(CATCHALL) == 1, "catch-all must survive the transform"
    return out


def main(argv):
    args = [a for a in argv[1:] if a != "-i"]
    inplace = "-i" in argv
    if len(args) != 1:
        print(__doc__)
        return 2
    path = args[0]
    with open(path, encoding="utf-8") as f:
        src = f.read()
    out = apply(src)
    if inplace:
        with open(path, "w", encoding="utf-8") as f:
            f.write(out)
        print(f"patched in place: {path} ({len(src)} -> {len(out)} chars)", file=sys.stderr)
    else:
        sys.stdout.write(out)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
