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
