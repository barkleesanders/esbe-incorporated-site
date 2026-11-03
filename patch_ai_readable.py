#!/usr/bin/env python3
"""Deterministic, assertion-guarded transform that adds the AI-readable
layer (ScrollLaunch spec SS1-8) to the recovered live bundle in index.js.

Source of truth: ai-readable.js in this repo (SITE config, page content
transcribed from the live templates, renderer registry, llms/ai/robots
generators, q-aware negotiation). This script inlines it between
AI-READABLE markers and adds three minimal head-signal edits (ai-summary
meta + markdown alternate link per page, WebSite JSON-LD on the homepage)
plus a Link describedby header via middleware. No HTML body, styling or
behaviour changes. Refuses to run twice.
"""
import pathlib, sys

root = pathlib.Path(__file__).parent
idx_path = root / "index.js"
src = idx_path.read_text()
ai = (root / "ai-readable.js").read_text()

def inline_source(text):
    # Strip ESM export keywords for inlining into the bundle module scope.
    lines = []
    for line in text.splitlines():
        if line.startswith("export "):
            line = line[len("export "):]
        lines.append(line)
    return "\n".join(lines)

if "--refresh" in sys.argv:
    # Regeneration mode: the bundle is already patched, and ai-readable.js
    # has changed (e.g. the MCP registry lines). Replace ONLY the block
    # between the AI-READABLE markers with the freshly inlined source, using
    # the exact transform above; everything outside the markers is asserted
    # untouched by construction (prefix/suffix are carried over verbatim).
    begin_marker = "/* === AI-READABLE BEGIN (generated from ai-readable.js by patch_ai_readable.py) === */"
    end_marker = "/* === AI-READABLE END === */"
    assert src.count(begin_marker) == 1, "refresh: expected exactly one BEGIN marker"
    assert src.count(end_marker) == 1, "refresh: expected exactly one END marker"
    b = src.index(begin_marker) + len(begin_marker)
    e = src.index(end_marker)
    assert b < e, "refresh: markers out of order"
    refreshed = src[:b] + "\n" + inline_source(ai) + "\n" + src[e:]
    idx_path.write_text(refreshed)
    print(f"refreshed ai-readable block in index.js: {len(refreshed)} bytes")
    sys.exit(0)

if "AI-READABLE BEGIN" in src:
    sys.exit("already patched: AI-READABLE markers present (use --refresh to regenerate the block from ai-readable.js)")

def must_replace(text, old, new, count=1):
    found = text.count(old)
    assert found == count, f"anchor count {found} != {count} for: {old[:80]!r}"
    return text.replace(old, new)

# Strip ESM export keywords for inlining into the bundle module scope.
inlined_lines = []
for line in ai.splitlines():
    if line.startswith("export "):
        line = line[len("export "):]
    inlined_lines.append(line)
inlined = "\n".join(inlined_lines)

glue_and_block = """
/* === AI-READABLE BEGIN (generated from ai-readable.js by patch_ai_readable.py) === */
""" + inlined + """
/* === AI-READABLE END === */
app.use("*", async (c, next) => {
  const aiRes = handleAiReadable(c.req.raw);
  if (aiRes) return aiRes;
  await next();
  c.header("Link", AI_LINK_HEADER, { append: true });
});
"""

anchor_mw = '  c.header("Cross-Origin-Resource-Policy", "same-origin");\n});'
src = must_replace(src, anchor_mw, anchor_mw + glue_and_block)

# --- Head signals: home ---
src = must_replace(
    src,
    "<title>ESBE Incorporated | Veteran support and public-interest work</title>",
    "<title>ESBE Incorporated | Veteran support and public-interest work</title>\n"
    '    <meta name="ai-summary" content="ESBE Incorporated is a 501(c)(3) nonprofit (EIN 87-1218291) advancing veteran support \u2014 through its AIVA Claims program, which helps veterans prepare VA disability claims for free \u2014 and public-interest access to government-facing services." />\n'
    '    <link rel="alternate" type="text/markdown" href="https://esbeincorporated.org/index.md" />',
)
home_ld_anchor = '"contactType":"public inquiries and governance requests","email":"help@esbeincorporated.org","url":"https://esbeincorporated.org/#contact"}],"sameAs":["${determinationLetter}"]}<\\/script>'
website_ld = (
    '\\n    <script type="application/ld+json">{"@context":"https://schema.org","@type":"WebSite",'
    '"name":"ESBE Incorporated","url":"https://esbeincorporated.org/",'
    '"publisher":{"@type":"NGO","name":"ESBE Incorporated","url":"https://esbeincorporated.org/"}}<\\/script>'
)
src = must_replace(src, home_ld_anchor, home_ld_anchor + website_ld)

# --- Head signals: donate ---
src = must_replace(
    src,
    "<title>Donate | ESBE Incorporated</title>",
    "<title>Donate | ESBE Incorporated</title>\n"
    '    <meta name="ai-summary" content="Donate to ESBE Incorporated, a 501(c)(3) nonprofit. Your gift funds free VA claims help for veterans through AIVA Claims." />\n'
    '    <link rel="alternate" type="text/markdown" href="https://esbeincorporated.org/donate.md" />',
)

# --- Head signals: community ---
src = must_replace(
    src,
    "<title>Treasure Island Community Work | ESBE Incorporated</title>",
    "<title>Treasure Island Community Work | ESBE Incorporated</title>\n"
    '    <meta name="ai-summary" content="ESBE Incorporated\'s community work on Treasure Island: public documentation of power outages and plain-language paths to official reporting channels for residents." />\n'
    '    <link rel="alternate" type="text/markdown" href="https://esbeincorporated.org/community.md" />',
)

for needle in ["AI-READABLE BEGIN", "handleAiReadable", 'name="ai-summary"', '"@type":"WebSite"', 'rel="alternate" type="text/markdown"']:
    assert needle in src, f"missing after patch: {needle}"
assert src.count('name="ai-summary"') == 3
assert src.count('rel="alternate" type="text/markdown"') == 3

idx_path.write_text(src)
print(f"patched index.js: {len(src)} bytes")
