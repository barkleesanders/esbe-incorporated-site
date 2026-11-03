# WebMCP — esbeincorporated.org

Tier: **2** (public content site) — Phase 1.4w minimum is >=1 Answer tool
on the homepage; this site ships the fleet standard pattern: Answer tools
+ a navigate Action + the anonymous usage beacon. Status: **live**
(deployed with the WebMCP change on the bundle lineage; verification
evidence in the PR that merged it and in the ship report).

## Baseline provenance (read this before trusting any other branch)

Production does NOT run any tree committed before 2026-11-03. The live
Worker bundle was recovered via the Cloudflare API script download on
2026-11-03 (repo precedent: the 2026-10-15 and 2026-10-23 baselines):

- Deployed version at recovery: `448bc7ec-469e-4d06-943b-8f2a6969accb`
  (#34), deployed 2026-10-31T06:18:04Z at 100% (deployment
  `84eeec1b-161f-4024-8aa1-1398d67b3abe`). It superseded version d623780c
  (#33, deployed 2026-10-31T03:48:56Z) the same night.
- Recovered `index.js`: 218,597 bytes, sha256
  `3853fef721def2a2bc95298c976cacb3fc09d6691ce5971e6132cdecb164fa9b`.
- Traks parts and all static assets verified byte-identical to the repo
  copies at recovery time; `index.js` was the only divergence.
- The baseline commit (PR #7) adopted those exact bytes on this lineage.
  Any future ship must diff against that baseline (or a newer recovered
  one), never against the older 190,777-byte build.

## How it is wired

- `public/webmcp.js` — the canonical fleet registrar (byte-identical to
  the /ship skill template, sha256 02004d5c...), replacing the legacy
  registrar of the same name. It registers `window.WEBMCP_TOOLS` with
  `document.modelContext` where available and no-ops elsewhere.
- `public/webmcp-tools.js` — this site's tool definitions (below). Tools
  read the site's own agent-readable surfaces — `/api/md/_catalog`,
  `/api/md/<path>`, `/llms-full.txt` — never a parallel copy of content.
- Every page template (/, /donate, /community, /privacy, /terms) loads
  `/webmcp-tools.js` then `/webmcp.js`, both as `type="module"` scripts,
  inserted by `patch_webmcp.py` immediately before the registrar tag the
  pages already carried. `patch_webmcp.py` is the deterministic,
  assertion-guarded transform (baseline -> shipped bundle) in this
  repo's `patch_*.py` idiom; re-running it on the baseline reproduces
  the shipped `index.js` byte-for-byte.
- The same patch inserts the beacon route (below) into `index.js`
  immediately before the ASSETS catch-all.

## Tool inventory

| Tool | Class | What it does | Sample input |
|---|---|---|---|
| `get_page_guide` | Answer | Lists the 5 public pages with title, description, URL, last-updated, from `/api/md/_catalog` | `{}` |
| `search_site` | Answer | Full-text search over all 5 pages via `/llms-full.txt`; excerpts attributed per page | `{"query": "veteran", "limit": 3}` |
| `get_page` | Answer | One page as markdown from `/api/md/<path>` (9000-char cap) | `{"path": "/privacy"}` |
| `navigate_to_page` | Action | `location.assign` to an allowlisted public path (/, /donate, /community, /privacy, /terms) | `{"page": "donate"}` |

No Sensitive tools. Donating happens on the site's own /donate page and
its Every.org handoff, never through a tool.

## Usage beacon

- Client: the canonical registrar fires one `register` ping after
  registration settles and one `execute` ping per tool call (argument
  KEY names only, never values) to `POST /api/webmcp-beacon`, because
  `public/webmcp-tools.js` sets `window.WEBMCP_BEACON_URL`.
- Server: the route added by `patch_webmcp.py` whitelists fields
  (`event`, `tool`, `tools`, `argKeys`, `path`), caps the body at
  2,048 bytes, always returns 204 (including on bad input), and stores
  server timestamp + payload + User-Agent.
- Store: D1 database `esbe-webmcp`
  (`c8a7886b-4759-4926-8023-9de752e483fd`), binding `WEBMCP_DB`, table
  `webmcp_events` (schema: `migrations/0001_webmcp_events.sql`, applied
  to the remote database 2026-11-03).
- Read back:

  ```
  wrangler d1 execute esbe-webmcp --remote --command "SELECT event, COUNT(*) AS n FROM webmcp_events GROUP BY event"
  wrangler d1 execute esbe-webmcp --remote --command "SELECT id, ts, event, tool, tools, arg_keys, path, user_agent FROM webmcp_events ORDER BY id DESC LIMIT 10"
  ```

## Verification

- `node tools/webmcp-check.mjs --source . --require 2` — verdict=ok
  (tools=4 answer=3 action=1 sensitive=0). Post-deploy:
  `--live https://esbeincorporated.org` — see the merging PR / ship
  report for the live verdict line.
- Execution proof: `node tools/webmcp-harness.mjs --base
  https://esbeincorporated.org --dir public` (or `--dir` at downloaded
  served copies) — registers all 4 tools in a fake modelContext and
  executes every Answer tool once with the sample inputs above; the
  run's beacon pings double as the beacon round-trip (read back per
  above).

## Chrome origin trial

**Enrolled** (2026-11-03). Registration:

- Portal: Chrome Origin Trials, feature **WebMCP**
- Origin: `https://esbeincorporated.org`
- Registration id: `2832042885988220929`
- Chrome range: 149-162
- Expiry: 2027-03-29 per the portal (token payload `expiry` = 1806364800)

The token is embedded as the first element of `<head>` on all 5 pages
(/, /donate, /community, /privacy, /terms) by `patch_ot.py` — the
deterministic, assertion-guarded sibling of `patch_webmcp.py`, defined
against the shipped (post-WebMCP) bundle: its output is that bundle
plus exactly the 5 meta insertions (+1,260 chars), proven by diff
before deploy. The token's signed payload (origin + feature +
expiry) is asserted inside `patch_ot.py`, so a wrong token refuses
to patch. The www host is served by the same Worker with identical
pages, so the meta ships there too, but the registration's signed
origin is the apex origin above.

## Known drift (baseline adoption fallout — not caused by WebMCP)

`node --test tests/` on the baseline (and therefore on this change,
identically) fails 5 of 13 tests; the pre-baseline lineage tip failed 1.
The test suite was written against the 3-page era bundle and the
standalone `ai-readable.js` source: the live 5-page bundle added the
/privacy and /terms Worker routes (and their markdown renderers, which
exist only inside the bundle), GA4 tag counts grew from 3 pages to 5,
and the Oct-30 ads build changed `ads.js` patterns the GA4 test pins.
The WebMCP change introduces zero new failures (same 5 before and
after; every asserted count is unchanged by the patch). Follow-up: a
source-recovery pass that ports the live bundle's PAGES registry back
into `ai-readable.js` and re-pins the counts — the same endgame as the
laptop-source reconciliation.
