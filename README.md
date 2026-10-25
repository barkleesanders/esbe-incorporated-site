# esbe-incorporated-site — live bundle recovery repo

This repo holds the **exact Worker bundle bytes production runs** for
https://esbeincorporated.org (Cloudflare Worker `esbe-incorporated-site`),
recovered 2026-10-15 via the Cloudflare API script download, because the
canonical TypeScript checkout (on Barklee's laptop) was unreachable that
night and a /donate page had to ship.

- `index.js` — the deployable bundle. Baseline commit = the bytes of the
  version live at recovery time (version e9dbca3c-0d4e-450e-b7ea-54b291580190,
  deployment 24055b51-355f-4d2e-b517-815ba2bd297c).
- `patch_donate.py` — deterministic, assertion-guarded transform that adds
  the /donate route + homepage Donate nav link. Re-running it on the
  baseline reproduces the deployed bundle byte-for-byte.
- Deploy = Cloudflare versions API upload of `index.js` (main_module
  `index.js`, compatibility_date 2026-09-22, ASSETS binding), then a 100%
  deployment. Assets (styles.css, ads.js, etc.) are served from the
  Worker's existing ASSETS binding and are not in this repo.

When the laptop TS source resurfaces, port the /donate route back into it
and retire this bundle repo.

## 2026-10-23 — og:image PNG fix (version 5cc0443b)

Production was re-bundled after the 2026-10-15 recovery (GA4 tag from
`patch_ga4.py` baked in, plus a Traks analytics wrapper installed as the
Worker entry: `__traks_managed_entry.mjs` imports `./index.js`). The old
repo baseline therefore no longer matched live bytes. This commit is the
new baseline: the exact bytes of version
`5cc0443b-a80a-4d1f-a62a-a586779e6f26`, recovered via the Cloudflare API
script download and transformed by `patch_ogpng.py`:

- og:image + twitter:image (homepage and /donate) now point at /og.png
  (SVG share images are not rendered by FB/X/LinkedIn crawlers), with
  og:image:type=image/png added.
- `public/og.png` is a 1200x630 raster of `public/og.svg` rendered in
  Chrome (headline 76px -> 70px so line 2 fits inside the card border);
  it is served both as a static asset and by an embedded /og.png route.
- `patch_ga4.py` is superseded by this baseline (GA4 is baked in).
- Deploy: staged wrangler `--no-bundle` with main =
  `__traks_managed_entry.mjs` and an ESModule rule covering all three
  parts; every pre-existing asset was hash-verified byte-identical to
  live before deploying. Rollback: redeploy version
  `06508dda-654d-4f1d-a3be-b0eaa5c83717` at 100%.
- `traks/` holds byte copies of the two Traks-managed parts for
  recovery reference; Traks tooling owns their contents.

Lineage note (2026-10-23): this recovery line (local snapshot commits ->
branch `og-png-fix-2026-10-23`) shares no history with `origin/main`,
which holds a single 2026-10-06 "7-page rebuild" source commit
(3f7282b). The branch is kept as the deploy record for the live bundle;
do not force-merge the two histories.

## 2026-10-24 — /community restored

`/community` ("Treasure Island Community Work | ESBE Incorporated") was live
2026-10-06 and lost in a later redeploy. No Wayback Machine capture of the path
exists (CDX API: zero rows for `esbeincorporated.org/community*`), so the copy
was written fresh from facts already on the site (homepage "Treasure Island
Power" civic project) plus the outage resource's own pages. No statistics, no
photo gallery (nothing recoverable).

- Route `/community` added to `index.js`; homepage nav gains "Community";
  `public/sitemap.xml` gains `/community`.
- `wrangler.jsonc` now declares `workers_dev: false` / `preview_urls: false`
  (matches live state; the surface guard requires them).
- Built on the live baseline (`be532dd`, version 5cc0443b). Deploy as in the
  2026-10-23 note: staged `--no-bundle`, main `__traks_managed_entry.mjs`
  with `traks/` parts copied byte-for-byte next to `index.js`.
