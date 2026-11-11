#!/usr/bin/env python3
"""Add the fleet wide-event logger to the shipped bundle (index.js).

Deterministic, assertion-guarded string surgery, in the same idiom as
patch_ot.py / patch_webmcp.py. Input is the CURRENT shipped bundle —
the live baseline of 2026-11-10 (223,320 bytes, sha256 6bc76248...,
byte-identical to the deployed index.js part of version e79a525f,
verified via the Cloudflare API) — NOT any earlier build.

The transform wraps the bundle's Hono app exactly once, at its single
export anchor:

  var index_default = app;

becomes: the app is kept as `wide_app`, an emitWideEvent helper is
defined, and `index_default` becomes a thin { fetch } object that
times the app's fetch, captures its status, rethrows on error, and
emits exactly one JSON http_request log line from a finally
(pathname only — no query string, headers beyond a truncated
user-agent, or bodies). The Traks parts are untouched: the managed
entry wraps this module's default export, and its wrap() adopts any
object with a fetch function, so the wide event fires inside the
Traks wrapper for every non-Traks request.

Run: python3 patch_wide_event.py index.js > index.patched.js
     (or in place with -i)
Re-running it on the shipped bundle reproduces the patched bundle
byte-for-byte. It refuses (AssertionError) if the anchor count
differs, if a wide event is already present, or if the delta is not
exactly the defined insertion.
"""
import sys

ANCHOR = "var index_default = app;\n"

REPLACEMENT = """var wide_app = app;
function emitWideEvent(req, status, start, errorName) {
  const cf = req.cf || {};
  const event = {
    event: "http_request",
    ts: new Date().toISOString(),
    request_id: req.headers.get("cf-ray") || "",
    method: req.method,
    path: new URL(req.url).pathname,
    status,
    outcome: status >= 500 ? "error" : status >= 400 ? "client_error" : "ok",
    duration_ms: Math.round(Date.now() - start),
    colo: cf.colo || "",
    country: cf.country || "",
    user_agent: (req.headers.get("user-agent") || "").slice(0, 128)
  };
  if (errorName) event.error = errorName;
  console.log(JSON.stringify(event));
}
var index_default = {
  async fetch(req, env, ctx) {
    const start = Date.now();
    let status = 500;
    let errorName;
    try {
      const res = await wide_app.fetch(req, env, ctx);
      status = res.status;
      return res;
    } catch (err) {
      errorName = err && err.name ? err.name : "Error";
      throw err;
    } finally {
      emitWideEvent(req, status, start, errorName);
    }
  }
};
"""


def apply(src: str) -> str:
    # Input guards: this transform is defined against the shipped
    # 2026-11-10 live baseline only. Anything else — stop.
    assert "http_request" not in src, "already patched: http_request present"
    assert "emitWideEvent" not in src, "already patched: emitWideEvent present"
    assert src.count(ANCHOR) == 1, f"expected exactly 1 export anchor, found {src.count(ANCHOR)}"
    assert src.count("index_default as default") == 1, "export statement must appear exactly once"

    out = src.replace(ANCHOR, REPLACEMENT)
    assert out.count('"http_request"') == 1, "wide event must be defined exactly once"
    assert out.count("var index_default = {") == 1, "wrapper must be defined exactly once"
    assert out.count("index_default as default") == 1, "export statement must survive"
    assert out.count("var wide_app = app;") == 1, "app capture must appear exactly once"
    assert len(out) - len(src) == len(REPLACEMENT) - len(ANCHOR), "delta must be exactly the defined insertion"
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
