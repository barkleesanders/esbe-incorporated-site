// Route-coverage + behaviour tests for the AI-readable layer (spec SS7/SS8).
// Run: node --test tests/ai-readable.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const ai = await import(path.join(root, "ai-readable.js"));
const bundle = fs.readFileSync(path.join(root, "index.js"), "utf8");

const NON_CONTENT = { "*": "ASSETS fallback catch-all; not a content route" };

test("coverage: every public Worker route has a renderer or an explicit skip", () => {
  const routes = [...bundle.matchAll(/app\.get\(\s*"([^"]+)"/g)].map((m) => m[1]);
  assert.ok(routes.length >= 4, `expected routes in bundle, got ${routes}`);
  for (const r of routes) {
    if (r in NON_CONTENT) continue;
    assert.ok(
      ai.registry.has(r) || r in ai.SKIPS,
      `public route ${r} has no markdown renderer and no skip-with-reason`
    );
  }
  for (const [r, reason] of Object.entries(ai.SKIPS))
    assert.ok(typeof reason === "string" && reason.length > 10, `skip ${r} needs a real reason`);
});

test("coverage: every sitemap URL (anchors stripped) has a renderer", () => {
  const sm = fs.readFileSync(path.join(root, "public/sitemap.xml"), "utf8");
  const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  assert.ok(locs.length >= 3);
  for (const loc of locs) {
    const p = new URL(loc).pathname;
    assert.ok(ai.registry.has(p), `sitemap path ${p} has no markdown renderer`);
    assert.ok(!loc.endsWith(".md"), "sitemap must not contain .md URLs");
  }
});

test("bundle is patched from this source (markers + head signals)", () => {
  assert.ok(bundle.includes("AI-READABLE BEGIN"));
  assert.equal((bundle.match(/name="ai-summary"/g) || []).length, 3);
  assert.equal((bundle.match(/rel="alternate" type="text\/markdown"/g) || []).length, 3);
  assert.ok(bundle.includes('"@type":"WebSite"'));
});

test("negotiation: q-aware, */* and missing Accept always HTML", () => {
  assert.equal(ai.wantsMarkdown(null), false);
  assert.equal(ai.wantsMarkdown("*/*"), false);
  assert.equal(ai.wantsMarkdown("text/html"), false);
  assert.equal(ai.wantsMarkdown("text/markdown"), true);
  assert.equal(ai.wantsMarkdown("text/html;q=0.5, text/markdown;q=0.9"), true);
  assert.equal(ai.wantsMarkdown("text/html;q=0.9, text/markdown;q=0.5"), false);
});

test("handler: .md, /api/md, catalog, llms, ai.txt, robots, 404s", async () => {
  const get = (p, headers = {}) =>
    ai.handleAiReadable(new Request(`https://esbeincorporated.org${p}`, { headers }));

  const home = get("/index.md");
  assert.equal(home.status, 200);
  assert.match(home.headers.get("Content-Type"), /text\/markdown/);
  assert.ok(home.headers.get("X-Markdown-Tokens"));
  assert.equal(home.headers.get("X-Robots-Tag"), "noindex, follow");
  assert.equal(home.headers.get("Access-Control-Allow-Origin"), "*");
  const homeBody = await home.text();
  assert.match(homeBody, /# Public-interest work that helps people move forward/);
  assert.match(homeBody, /Canonical: https:\/\/esbeincorporated\.org\//);

  assert.equal(get("/donate.md").status, 200);
  assert.equal(get("/community.md").status, 200);
  assert.equal(get("/api/md/donate").status, 200);
  assert.equal(get("/api/md/index").status, 200);

  const cat = get("/api/md/_catalog");
  assert.equal(cat.status, 200);
  const catJson = await cat.json();
  assert.deepEqual(
    catJson.routes.map((r) => r.path).sort(),
    ["/", "/community", "/donate"]
  );

  const missing = get("/does-not-exist.md");
  assert.equal(missing.status, 404);
  assert.match(await missing.text(), /# Not Found/);
  assert.equal(get("/blog.md").status, 404);
  assert.equal(get("/about.md").status, 404);
  assert.equal(get("/api/md/blog").status, 404);

  const llms = await get("/llms.txt").text();
  assert.match(llms, /# ESBE Incorporated/);
  assert.match(llms, /\/index\.md/);
  assert.match(llms, /keep in sync/i);

  const full = await get("/llms-full.txt").text();
  assert.match(full, /<!-- source: https:\/\/esbeincorporated\.org\/ -->/);
  assert.match(full, /<!-- source: https:\/\/esbeincorporated\.org\/donate -->/);
  assert.match(full, /<!-- source: https:\/\/esbeincorporated\.org\/community -->/);

  const aitxt = await get("/ai.txt").text();
  for (const s of ["[identity]", "[permissions]", "[restrictions]", "[attribution]", "[scope]", "[contact]"])
    assert.ok(aitxt.includes(s), `ai.txt missing ${s}`);

  const robots = await get("/robots.txt").text();
  for (const b of ["OAI-SearchBot", "ChatGPT-User", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Perplexity-User"])
    assert.ok(robots.includes(`User-agent: ${b}`), `robots missing ${b}`);
  assert.match(robots, /Sitemap: https:\/\/esbeincorporated\.org\/sitemap\.xml/);
  assert.match(robots, /\/llms\.txt/);

  const negotiated = get("/", { Accept: "text/markdown" });
  assert.equal(negotiated.status, 200);
  assert.match(negotiated.headers.get("Content-Type"), /text\/markdown/);
  assert.equal(get("/", { Accept: "*/*" }), null); // falls through to HTML
  assert.equal(get("/community", { Accept: "text/html" }), null);
});

test("public robots.txt file matches the generated robots", async () => {
  const file = fs.readFileSync(path.join(root, "public/robots.txt"), "utf8");
  assert.equal(file, ai.buildRobots());
});
