#!/usr/bin/env node
// webmcp-harness.mjs — execution proof for this site's WebMCP tools without a WebMCP browser.
// Loads public/webmcp-tools.js + public/webmcp.js in a Node VM with a fake
// document.modelContext that captures registerTool() calls, then executes every
// Answer tool once with the WEBMCP.md sample inputs. fetch() is bound to --base
// (default: the live site, https://esbeincorporated.org per wrangler.jsonc
// routes) so tools exercise the real /api/md/* + /llms-full.txt surfaces.
// Usage: node tools/webmcp-harness.mjs [--base https://esbeincorporated.org] [--dir public]
// Exit 0 = at least 1 tool registered and every Answer tool returned content (not {error}).
// Note: the registrar usage beacon fires for real during this run (register +
// one execute ping per Answer tool) against --base; failures are swallowed by
// the registrar, and once /api/webmcp-beacon is deployed the pings double as
// the beacon round-trip proof (read back per WEBMCP.md).
import { readFileSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const base = opt("--base", "https://esbeincorporated.org").replace(/\/$/, "");
const dir = opt("--dir", "public");

const registered = [];
const sandbox = {
  console,
  fetch: (u, init) => fetch(new URL(u, base + "/").href, init),
  location: { assign: (p) => { sandbox.__navigated = p; } },
  addEventListener: () => {},
};
sandbox.window = sandbox;
sandbox.document = { modelContext: { registerTool: async (tool) => { registered.push(tool); } } };
sandbox.navigator = {};
vm.createContext(sandbox);

for (const f of ["webmcp-tools.js", "webmcp.js"]) {
  vm.runInContext(readFileSync(join(dir, f), "utf8"), sandbox, { filename: f });
}
await new Promise((r) => setTimeout(r, 50)); // registrar registers inside Promise.resolve().then()

if (!registered.length) { console.log("harness: FAIL — 0 tools registered"); process.exit(1); }
console.log("harness: " + registered.length + " tools registered: " + registered.map((t) => t.name).join(", "));

const samples = {
  get_page_guide: {},
  search_site: { query: "veteran", limit: 3 },
  get_page: { path: "/privacy" },
};
let fail = 0;
let executed = 0;
for (const t of registered) {
  if (t.webmcpClass !== "answer") { console.log("harness: skip " + t.name + " (class=" + (t.webmcpClass || "?") + ")"); continue; }
  const out = await t.execute(samples[t.name] ?? {});
  const ok = out && Array.isArray(out.content) && out.content[0]?.text?.length > 0;
  executed++;
  console.log("harness: " + t.name + " -> " + (ok ? "ok" : "FAIL") + (ok ? " (" + out.content[0].text.length + " chars: " + out.content[0].text.slice(0, 110).replace(/\s+/g, " ") + "…)" : " " + JSON.stringify(out)));
  if (!ok) fail++;
}
await new Promise((r) => setTimeout(r, 300)); // let fire-and-forget beacon pings flush before exit
console.log(fail ? "harness: FAIL (" + fail + " answer tools)" : "harness: PASS (" + executed + " answer tools executed)");
process.exit(fail ? 1 : 0);
