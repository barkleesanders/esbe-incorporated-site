# WebMCP — esbeincorporated.org

Tier: **2** (public content site) — Phase 1.4w minimum: >=1 Answer tool on
the homepage. This site ships the fleet standard pattern anyway: Answer
tools + a navigate Action + the anonymous usage beacon.

## Baseline provenance (read this before trusting any other branch)

Production does NOT run any tree committed before 2026-11-03. The live
Worker bundle was recovered via the Cloudflare API script download on
2026-11-03 (repo precedent: the 2026-10-15 and 2026-10-23 baselines):

- Deployed version: `448bc7ec-469e-4d06-943b-8f2a6969accb` (#34), deployed
  2026-10-31T06:18:04Z at 100% (deployment
  `84eeec1b-161f-4024-8aa1-1398d67b3abe`). It superseded version d623780c
  (#33, deployed 2026-10-31T03:48:56Z) the same night.
- Recovered `index.js`: 218,597 bytes, sha256
  `3853fef721def2a2bc95298c976cacb3fc09d6691ce5971e6132cdecb164fa9b`.
- Traks parts and all static assets verified byte-identical to the repo
  copies at recovery time; `index.js` was the only divergence.
- The baseline commit on this lineage adopts those exact bytes. Any future
  ship must diff against THIS baseline (or a newer recovered one), never
  against the older 190,777-byte build.

## Status

WebMCP tools + beacon: **shipping in the follow-up change on this
lineage** (this file is completed by that change with the tool inventory,
beacon store + read-back commands, and verification evidence).

Chrome origin trial: **not enrolled** (fleet enrollment is tracked
separately; no token is embedded yet).
