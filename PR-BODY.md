## AI agents can now actually read esbeincorporated.org

**Problem.** A live audit on 2026-10-26 found esbeincorporated.org had no AI-readable layer at all: `/llms.txt`, `/llms-full.txt`, `/ai.txt` and every `.md` URL returned 404, `Accept: text/markdown` was ignored, `robots.txt` was a 73-byte bare minimum with no AI-bot rules, and the homepage had no `ai-summary`, no markdown alternate link, and no `WebSite` JSON-LD node. Answer engines and agents could only scrape the HTML.

**What this adds** (ScrollLaunch AI-readable spec §§1–8, adapted to this site's real routes):

- **Markdown version of every public page** — `/`, `/donate`, `/community` (the site's only public HTML routes) via three access routes: `.md` suffix (`/index.md`, `/donate.md`, `/community.md`), q-aware `Accept: text/markdown` negotiation (`*/*` and missing Accept always return HTML), and `/api/md/<path>` plus `/api/md/_catalog`. One handler, one renderer registry (`ai-readable.js`) fed by content transcribed from the live page templates — no HTML scraping, no invented facts. Full spec headers: `text/markdown`, `X-Markdown-Tokens`, `X-Robots-Tag: noindex, follow`, `Content-Location` + canonical `Link`, `Vary: Accept`, `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400`, CORS `*`, HEAD/OPTIONS handled, markdown 404 bodies.
- **`/llms.txt`, `/llms-full.txt`, `/ai.txt`** generated at request time from the same registry/config, so they cannot go stale. llms-full uses `<!-- source: -->` separators; ai.txt carries [identity][permissions][restrictions][attribution][scope][contact]; keep-in-sync comments cross-link robots/llms/ai.txt.
- **`robots.txt`** — explicit Allow blocks for OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User; `/api/` disallowed for the generic agent; comments pointing to `/llms.txt` + `/ai.txt`; Sitemap line kept. **Training-crawler posture is deliberately unchanged** (no training bots named, no Content-Signal added) — that decision stays with the site owner.
- **Head signals** — `<meta name="ai-summary">` (hand-written for home, meta description for the other pages), absolute `<link rel="alternate" type="text/markdown">` on all three pages, a global `Link: … rel="describedby"` header advertising llms.txt / llms-full.txt / ai.txt, and a `WebSite` JSON-LD node added alongside the existing NGO/ContactPoint block on the homepage. No page's look or behaviour changes.
- **Route-coverage test** (`tests/ai-readable.test.mjs`, `node --test`): fails if any public Worker route lacks a renderer or an explicit skip-with-reason (skips: `/og.png` image, `/security.txt` redirect), if a sitemap URL lacks a renderer, or if negotiation/headers regress. `.md` URLs stay out of `sitemap.xml`.

**How it's built.** This repo holds the recovered live Worker bundle, so — following the repo's established `patch_*.py` pattern — the layer lives in a readable source file, `ai-readable.js`, and `patch_ai_readable.py` is the deterministic, assertion-guarded transform that inlines it into `index.js` between AI-READABLE markers and applies the three head edits. Re-running the patch on the baseline reproduces this diff.

**Lineage note.** This branch is based on `community-page-2026-10-24` (the current live baseline, which descends from the recovered-bytes branch `og-png-fix-2026-10-23` @ be532dd) because the two repo lineages share no history with `origin/main` — a PR against `main` is not possible and must never be force-merged. Verified before writing code: HEAD contains be532dd as an ancestor, the Traks managed entry is present, and GA4 (`G-YLVSKGE4LT`) is baked into the bundle.

**Verification (pre-merge, local harness driving the patched bundle — not deployed).** All §8-adapted checks pass: `.md` 200s with spec headers, negotiation incl. q-values and `*/*` → HTML, Link describedby + ai-summary + WebSite on HTML, catalog with exactly the 3 real routes, llms/llms-full/ai.txt/robots contents, markdown 404s for `/does-not-exist.md`, `/blog.md`, `/about.md` (not real routes), HEAD/OPTIONS, and untouched `/og.png` + `/security.txt` behaviour. Full output is in the build log referenced in chat.

**Skipped:** `/.well-known/mcp.json` (no MCP server exists — per spec §6 this is listed as skipped, not faked). Sitemap anchors (`/#mission` etc.) are sections of the homepage and are covered by its renderer.

**Not merged, not deployed** — the live Worker is untouched; merging/deploying is gated on the owner's review.

Created with Muse (Nova) in Muse
