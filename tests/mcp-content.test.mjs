// Generation tests for the MCP content bridge (design §5/§7).
// Beside tests/ai-readable.test.mjs in pattern: node --test, no framework.
// Run: node --test tests/mcp-content.test.mjs
//
// The freshness test is the load-bearing one: mcp/content.generated.ts is a
// COMMITTED generated file, and if someone edits the site copy in
// ai-readable.js without regenerating, this test fails instead of the MCP
// silently serving stale nonprofit facts (EIN, status, disclosure).
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

test("freshness: content.generated.ts matches a fresh regeneration (empty diff)", () => {
  // --check regenerates in memory and exits 1 on any diff; it never writes.
  const out = execFileSync(
    process.execPath,
    [path.join(root, "mcp", "build-content.mjs"), "--check"],
    { encoding: "utf8" }
  );
  assert.match(out, /fresh/);
});

test("shape: generated module carries SITE identity fields and all three pages", async () => {
  const gen = await import(path.join(root, "mcp", "content.generated.ts"));
  const ai = await import(path.join(root, "ai-readable.js"));

  // Identity fields the five tools depend on.
  assert.equal(gen.SITE.name, "ESBE Incorporated");
  assert.equal(gen.SITE.url, "https://esbeincorporated.org");
  assert.equal(gen.SITE.taxId, "87-1218291");
  assert.equal(gen.SITE.email, "help@esbeincorporated.org");
  assert.equal(gen.SITE.phone, "(802) 715-3723");
  assert.match(gen.SITE.disclosure, /not affiliated with or endorsed by the U\.S\. Department of Veterans Affairs/);
  assert.ok(gen.SITE.determinationLetter.includes("87-1218291"));

  // All three pages, in registry order, with the sections the tools read.
  assert.deepEqual(
    gen.PAGES.map((p) => p.path),
    ["/", "/donate", "/community"]
  );
  const headings = Object.fromEntries(
    gen.PAGES.map((p) => [p.path, p.sections.map((s) => s.heading)])
  );
  for (const h of ["About", "Our mission", "AIVA Claims (veteran support)", "Public-interest services", "Selected civic projects", "Transparency", "Contact"])
    assert.ok(headings["/"].includes(h), `home page missing section ${h}`);
  for (const h of ["What your gift does", "Transparency"])
    assert.ok(headings["/donate"].includes(h), `donate page missing section ${h}`);
  for (const h of ["About this work", "Why it matters", "Community resources"])
    assert.ok(headings["/community"].includes(h), `community page missing section ${h}`);

  // The generated copy is the registry, not a paraphrase of it.
  assert.deepEqual(gen.SITE, ai.SITE);
  assert.deepEqual(JSON.parse(JSON.stringify(gen.PAGES)), JSON.parse(JSON.stringify(ai.PAGES)));
});
