#!/usr/bin/env python3
"""Point ESBE share metadata at a PNG og image and serve it from the Worker.

Why: og:image was https://esbeincorporated.org/og.svg — Facebook/X/LinkedIn
crawlers generally do not render SVG share images, so link previews broke.
Fix (2026-10-23):
  1. og:image + twitter:image (homepage and /donate templates) -> /og.png,
     with og:image:type=image/png added after each og:image:height.
  2. A GET /og.png route serves the rasterized card (public/og.png, a
     1200x630 PNG rendered in Chrome from public/og.svg — headline reduced
     76px -> 70px so line 2 fits inside the card border), embedded as
     base64 so the deploy stays a script-only versions-API upload and the
     ASSETS manifest is untouched.

IMPORTANT: apply this to the CURRENT LIVE bundle bytes (recovered via the
Cloudflare API script download), not to an older repo snapshot — production
was re-bundled when the Traks wrapper was installed, so older baselines do
not match live bytes.

Run: python3 patch_ogpng.py <live-index.js> <og.png> > index.new.js
"""
import base64
import sys

src_path, png_path = sys.argv[1], sys.argv[2]
s = open(src_path, encoding="utf-8").read()

# 1) Repoint share-image URLs (og:image x2 + twitter:image x2).
old_url = "https://esbeincorporated.org/og.svg"
n = s.count(old_url)
assert n == 4, f"expected 4 og.svg URLs, found {n}"
s = s.replace(old_url, "https://esbeincorporated.org/og.png")

# 2) Declare the PNG type after each og:image:height (homepage + /donate).
old_h = '<meta property="og:image:height" content="630" />'
n = s.count(old_h)
assert n == 2, f"expected 2 og:image:height tags, found {n}"
s = s.replace(old_h, old_h + '\n    <meta property="og:image:type" content="image/png" />')

# 3) Serve /og.png from the Worker, ahead of the ASSETS catch-all.
b64 = base64.b64encode(open(png_path, "rb").read()).decode()
route = (
    "const OG_PNG_BYTES = Uint8Array.from(atob(\n"
    + " +\n".join(f'  "{b64[i:i + 100]}"' for i in range(0, len(b64), 100))
    + '\n), (ch) => ch.charCodeAt(0));\n'
    'app.get("/og.png", (c) => c.body(OG_PNG_BYTES, 200, { "Content-Type": "image/png", "Cache-Control": "public, max-age=31536000, immutable" }));\n'
)
anchor = 'app.get("/security.txt", (c) => c.redirect("/.well-known/security.txt", 302));'
assert s.count(anchor) == 1, "security.txt route anchor not found exactly once"
s = s.replace(anchor, route + anchor)

sys.stdout.write(s)
print("patch_ogpng: OK", file=sys.stderr)
