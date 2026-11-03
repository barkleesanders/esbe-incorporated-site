// webmcp-tools.js — ESBE Incorporated (esbeincorporated.org) WebMCP tool definitions.
// Loaded immediately before /webmcp.js (the canonical registrar) on every page.
// Tools read the site's own agent-readable surfaces — the page catalog at
// /api/md/_catalog, the per-page markdown at /api/md/<path>, and the
// concatenated full text at /llms-full.txt — the same content the pages
// render, never a parallel copy. See WEBMCP.md.
window.WEBMCP_BEACON_URL = "/api/webmcp-beacon";

var ESBE_PAGES = ["/", "/donate", "/community", "/privacy", "/terms"];

function esbeTextResult(text) {
  return { content: [{ type: "text", text: text }] };
}

async function esbeFetchText(path) {
  const r = await fetch(path);
  if (!r.ok) throw new Error("fetch " + path + " -> " + r.status);
  return await r.text();
}

window.WEBMCP_TOOLS = [
  {
    name: "get_page_guide",
    description: "List ESBE Incorporated's public pages (home, donate, community, privacy, terms) with each page's title, description, URL, and last-updated date, from the site's own page catalog.",
    webmcpClass: "answer",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    execute: async () => {
      try {
        const data = JSON.parse(await esbeFetchText("/api/md/_catalog"));
        const pages = (Array.isArray(data.routes) ? data.routes : []).map(function (r) {
          return {
            path: r.path,
            title: r.title,
            description: r.description,
            url: "https://esbeincorporated.org" + r.path,
            last_updated: r.lastUpdated,
            markdown: r.markdown,
          };
        });
        return esbeTextResult(JSON.stringify({ site: data.site || "ESBE Incorporated", pages: pages }, null, 2));
      } catch (e) { return { error: "page catalog unavailable" }; }
    },
  },
  {
    name: "search_site",
    description: "Search the full text of ESBE Incorporated's public pages (home, donate, community, privacy, terms) and return matching excerpts with the page each came from.",
    webmcpClass: "answer",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search terms; every term must appear on a matching page" },
        limit: { type: "number", description: "Maximum excerpts to return (1-10, default 5)" },
      },
      required: ["query"],
    },
    execute: async ({ query, limit }) => {
      try {
        const q = String(query || "").trim().toLowerCase();
        if (!q) return { error: "query is required" };
        let n = Math.floor(Number(limit) || 5);
        if (n < 1) n = 1;
        if (n > 10) n = 10;
        const terms = q.split(/\s+/).filter(function (t) { return t.length > 0; });
        const full = await esbeFetchText("/llms-full.txt");
        const chunks = full.split("<!-- source: ");
        const results = [];
        for (let i = 1; i < chunks.length && results.length < n; i++) {
          const seg = chunks[i];
          const endMark = seg.indexOf(" -->");
          if (endMark === -1) continue;
          const url = seg.slice(0, endMark).trim();
          const body = seg.slice(endMark + 4);
          const lower = body.toLowerCase();
          let all = true;
          for (const t of terms) { if (lower.indexOf(t) === -1) { all = false; break; } }
          if (!all) continue;
          const pos = lower.indexOf(terms[0]);
          const start = Math.max(0, pos - 160);
          const excerpt = body.slice(start, pos + 320).replace(/\s+/g, " ").trim();
          results.push({ page: url, excerpt: excerpt });
        }
        return esbeTextResult(JSON.stringify({ query: q, results: results }, null, 2));
      } catch (e) { return { error: "site search unavailable" }; }
    },
  },
  {
    name: "get_page",
    description: "Read one of ESBE Incorporated's public pages as markdown: /, /donate, /community, /privacy, or /terms. Returns the same markdown the site serves to agents at its .md URLs.",
    webmcpClass: "answer",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Page path: /, /donate, /community, /privacy, or /terms" },
      },
      required: ["path"],
    },
    execute: async ({ path }) => {
      try {
        const p = String(path || "/").trim();
        if (ESBE_PAGES.indexOf(p) === -1) return { error: "path must be one of: " + ESBE_PAGES.join(", ") };
        const md = await esbeFetchText("/api/md" + (p === "/" ? "/index" : p));
        const MAX = 9000;
        return esbeTextResult(md.length > MAX ? md.slice(0, MAX) + "\n\n[truncated at " + MAX + " chars]" : md);
      } catch (e) { return { error: "page unavailable" }; }
    },
  },
  {
    name: "navigate_to_page",
    description: "Navigate the visitor's browser to one of ESBE Incorporated's public pages: home (/), donate (/donate), community (/community), privacy (/privacy), or terms (/terms). Only these internal paths are used.",
    webmcpClass: "action",
    inputSchema: {
      type: "object",
      properties: {
        page: { type: "string", description: "Page key or path: home, donate, community, privacy, terms — or the exact path like /donate" },
      },
      required: ["page"],
    },
    execute: async ({ page }) => {
      const keys = { home: "/", donate: "/donate", community: "/community", privacy: "/privacy", terms: "/terms" };
      const key = String(page || "").trim().toLowerCase().replace(/^\//, "");
      const path = keys[key] || (ESBE_PAGES.indexOf("/" + key) !== -1 ? "/" + key : null);
      if (!path) return { error: "page must be one of: home, donate, community, privacy, terms" };
      window.location.assign(path);
      return esbeTextResult("Navigating to " + path);
    },
  },
];
