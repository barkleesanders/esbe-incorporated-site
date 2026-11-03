# ESBE Incorporated MCP Worker (`esbeincorporated.org/mcp`)

A separate Cloudflare Worker (`esbe-mcp`) serving a public, read-only
[Model Context Protocol](https://modelcontextprotocol.io/) server for ESBE
Incorporated, a 501(c)(3) nonprofit — organization and transparency facts,
the AIVA Claims veteran-support program, donation information, Treasure
Island community work, and published contact details, all re-published from
the site's own content registry. Design: `design-esbe-mcp.md` (fleet pattern:
AIVA-Frontend's `workers/muse-connector`).

| Route | Answer |
|---|---|
| `GET`/`HEAD` `/mcp`, `/mcp/` | `200 text/html` documentation page — 200 regardless of any `Authorization` header (connector-vault probes send a bare Bearer and store nothing on non-2xx). This page carries the documentation function in v1; there is no `/developers` page (design §8, Open Decision #2). |
| `GET /mcp/health` | `200 {"ok":true,"server":"esbe-incorporated","version":"1.0.0","tools":5}` |
| `GET /.well-known/mcp.json` | `200` discovery document. **Deviation (design §3):** this Worker, not the site Worker, serves it — via an exact zone route — so the recovered site bundle is never touched for it. |
| `POST /mcp` | MCP Streamable HTTP, stateless: JSON-RPC 2.0, protocol `2025-06-18`, one fresh server per request via `createMcpHandler` (`@modelcontextprotocol/server`). |
| `OPTIONS *` | CORS preflight, any origin, no credentials. |

Guards on `POST`, in order: `Content-Type: application/json` (else 415) →
rate limit per `CF-Connecting-IP` via the `MCP_RATE_LIMITER` binding,
60/min, dedicated namespace `2026102601`, **fail-closed 503** if the binding
is missing or throws → body capped at 64 KiB while streaming (413, before
parsing) → JSON parse errors answered as JSON-RPC `-32700`. All responses
are `Cache-Control: no-store`. No authentication: every tool returns content
already published on esbeincorporated.org, and the Worker has no
D1/R2/KV/secret bindings.

## Tools (all read-only, no input)

| Tool | Source (in `../ai-readable.js`) |
|---|---|
| `get_org_info` | `SITE` + home *About* / *Our mission* / *Transparency*; disclosure verbatim as its own field |
| `list_services` | home *AIVA Claims (veteran support)* (incl. its four steps + pointer to aivaclaims.com and its MCP), *Public-interest services*, *Selected civic projects* |
| `get_donate_info` | `/donate` *What your gift does* + *Transparency*, and only the two published Every.org giving links |
| `get_community_info` | `/community` sections |
| `get_contact` | exactly the published email, phone, and transparency-request mailto |

## Content discipline

Tools import **only** `content.generated.ts`, which `build-content.mjs`
generates from `../ai-readable.js` and which is committed. Never edit the
generated file by hand:

```sh
npm run build-content   # regenerate after editing ../ai-readable.js
npm run check-content   # freshness check (also tests/mcp-content.test.mjs at repo root)
```

## Run and test locally

```sh
npm install
npm test                # vitest: catalog pinning, per-tool fixtures, protocol negatives
npm run typecheck
npm run dry-run         # wrangler deploy --dry-run (bundle check; deploys nothing)
```

Deployment is **not** part of this directory's day-to-day: the Worker ships
via the repo's /ship flow from the merged baseline branch, together with the
zone BIC exemption extension for `/mcp*` and `/.well-known/mcp.json`
(snapshot-first; see the PR body).
