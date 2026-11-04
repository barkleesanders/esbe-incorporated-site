#!/usr/bin/env python3
"""Apply the Chrome WebMCP origin-trial token to the shipped bundle (index.js).

Deterministic, assertion-guarded string surgery, in the same idiom as
patch_webmcp.py. Input is the CURRENT shipped bundle — the 2026-11-03
live baseline plus patch_webmcp.py's output (220,293 chars, sha256
61b2886e...; see WEBMCP.md) — NOT the raw baseline. The transform inserts
the origin-trial meta tag as the first element of <head> on all 5 pages
(/, /donate, /community, /privacy, /terms):

  <meta http-equiv="origin-trial" content="TOKEN">

immediately after each page's <head> tag. Nothing else changes: the
output is the input plus exactly 5 insertions of 252 chars each
(+1,260 chars total).

Registration: Chrome Origin Trials, feature "WebMCP", origin
https://esbeincorporated.org, registration id 2832042885988220929,
Chrome 149-162, token expiry 1806364800 (2027-03-29 per the portal).
The token's signed payload is asserted below against those facts, so a
wrong or swapped token refuses to patch.

Run: python3 patch_ot.py index.js > index.patched.js  (or in place with -i)
Re-running it on the shipped bundle reproduces the OT bundle byte-for-byte.
It refuses (AssertionError) if any anchor count differs from the shipped
bundle's, or if the token is already present.
"""
import base64
import json
import sys

TOKEN = "Ao5nDCDm2tvUfzXnC/aV33kcMX+6hDKLhD8R9Ct87pY2EtvcO9hXQne2NtkkFZM/hEeii6M4k7HWt+62WnZoCw8AAABUeyJvcmlnaW4iOiJodHRwczovL2VzYmVpbmNvcnBvcmF0ZWQub3JnOjQ0MyIsImZlYXR1cmUiOiJXZWJNQ1AiLCJleHBpcnkiOjE4MDYzNjQ4MDB9"
META = f'<meta http-equiv="origin-trial" content="{TOKEN}">'
INSERT = "\n    " + META

HEAD = "<head>"
HEAD_CONTEXT = '<head>\n    <!-- Google tag (gtag.js) - GA4 ESBE Incorporated -->'


def check_token():
    raw = base64.b64decode(TOKEN)
    payload = json.loads(raw[raw.find(b"{"):])
    assert payload["origin"] == "https://esbeincorporated.org:443", payload
    assert payload["feature"] == "WebMCP", payload
    assert payload["expiry"] == 1806364800, payload


def apply(src: str) -> str:
    check_token()
    # Input guards: this transform is defined against the shipped
    # (post-patch_webmcp.py) bundle only. Anything else — stop.
    assert "origin-trial" not in src, "already patched: origin-trial meta present"
    assert 'app.post("/api/webmcp-beacon"' in src, "input is not the shipped bundle: beacon route missing"
    assert src.count("<head>") == 5, f"expected 5 page <head> tags, found {src.count('<head>')}"
    assert src.count(HEAD_CONTEXT) == 5, f"expected 5 GA4-anchored heads, found {src.count(HEAD_CONTEXT)}"

    out = src.replace(HEAD, HEAD + INSERT)
    assert out.count(META) == 5, "origin-trial meta must land on all 5 pages"
    assert out.count(HEAD + INSERT) == 5, "meta must sit immediately after every <head>"
    assert out.count("<!-- Google tag (gtag.js) - GA4 ESBE Incorporated -->") == 5, "page heads must survive the transform"
    assert len(out) - len(src) == 5 * len(INSERT), "delta must be exactly the 5 meta insertions"
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
