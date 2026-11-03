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

Lineage note (2026-11-03) — supersedes the 2026-10-23 note above: on
2026-11-03 Barklee Sanders explicitly overrode the do-not-force-merge
instruction. The two histories were joined into `main` with a
`git merge -s ours --allow-unrelated-histories` of the old `main`
(3f7282b) into the live bundle lineage tip
(`feat/ads-conversion-tag-2026-10-30`, d576928). The join is
tree-neutral — the resulting tree is identical to the bundle lineage
tip — and no code was deployed; production already ran this tree.
`main` once again tracks the live bundle lineage. The 2026-10-23 note
above is retained as superseded history.

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

## 2026-10-27 — GA4 conversion events actually fire

GA4 property 559498667 (tag G-YLVSKGE4LT) had recorded only page_view /
first_visit / session_start in its entire history (7 page views, verified
via the GA4 Data API on 2026-10-27): the custom events Google Ads imports
as conversions — `aiva_signup_click` (7855556310) and `donate_click`
(7855556313) in account 681-385-8588 — were defined in GA4/Ads but fired
nowhere in either this site or aivaclaims.com (whose own GA4 was removed
2026-05-04 in favour of self-hosted Traks), starving the Maximize
Conversions bidder.

- `public/ads.js` (loaded on /, /donate and /community) gains one delegated
  click listener: AIVA sign-up CTAs (`aivaclaims.com/sign-up`) fire
  `aiva_signup_click`; Every.org donate links and same-site `/donate`
  links fire `donate_click`. Params: `link_url`, `page_path`.
- `/community`'s template had no GA4 tag at all; it now carries the same
  gtag snippet as home and /donate (bundle total: 6 measurement-ID
  occurrences, 3 gtag/js loads).
- Coverage pinned by `tests/ga4-events.test.mjs` (`node --test`).
- Rollback: redeploy the previous Worker version at 100% (recorded in the
  deploy report for this change).

## 2026-10-27 — CSP was blocking every GA4 collect (follow-up to the events fix)

Browser-console evidence (clean Chrome profile, live site): gtag.js tried
to POST each hit to `analytics.google.com/g/collect`,
`www.google.com/g/collect` and `stats.g.doubleclick.net/g/collect`, and
every attempt failed with a CSP connect-src violation — the policy only
allowed `www.google-analytics.com`. That is why the property's whole
history held 7 page views (image-beacon fallbacks) and no custom events.
Fix: connect-src and img-src gain `region1.google-analytics.com`,
`analytics.google.com`, `www.google.com` and `stats.g.doubleclick.net`
(img-src also `www.googletagmanager.com`), pinned by a test in
`tests/ga4-events.test.mjs`. Rollback: redeploy the previous Worker
version at 100%.

## 2026-11-03 — live-bytes baseline (version 448bc7ec)

Production was re-bundled after the 2026-10-30 ads-tag deploy. The version
live at recovery time — version `448bc7ec-469e-4d06-943b-8f2a6969accb`
(#34, uploaded via the Cloudflare API and deployed 2026-10-31T06:18:04Z at
100% by deployment `84eeec1b-161f-4024-8aa1-1398d67b3abe`; it superseded
version d623780c the same night) — carries an `index.js` of 218,597 bytes
(sha256 `3853fef721def2a2bc95298c976cacb3fc09d6691ce5971e6132cdecb164fa9b`)
that matches no commit in this repo: the repo tip's `index.js` is the
earlier 190,777-byte build (sha256 f07e3a01...). The Traks parts
(`__traks_managed_entry.mjs`, `__traks_wrapper.mjs`) and every static asset
were verified byte-identical to the repo copies; `index.js` is the only
divergence.

This baseline adopts the recovered live `index.js` bytes, per this repo's
2026-10-15 / 2026-10-23 recovery precedent, so the WebMCP ship that follows
patches the bytes production actually runs — including the `/privacy` and
`/terms` Worker routes, which exist only in this build. No code changes in
this baseline; nothing was deployed.
