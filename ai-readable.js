// ai-readable.js — AI-readable layer for esbeincorporated.org (ScrollLaunch §§1–8).
// Single source of truth: SITE + PAGES below are transcribed verbatim from the
// live page templates in index.js (routes /, /donate, /community). No invented
// facts. This file is inlined into index.js by patch_ai_readable.py between
// AI-READABLE markers; it is also importable standalone for tests.
// Keep robots.txt, llms.txt and ai.txt in sync — all three are generated here.

const DETERMINATION_LETTER =
  typeof determinationLetter !== "undefined"
    ? determinationLetter
    : "https://apps.irs.gov/pub/epostcard/dl/FinalLetter_87-1218291_ESBEINCORPORATED_05012026_v1.0.pdf";
const DISCLOSURE =
  typeof disclosure !== "undefined"
    ? disclosure
    : "ESBE Incorporated is a 501(c)(3) nonprofit organization, EIN 87-1218291. AIVA Claims is a charitable program of ESBE Incorporated. ESBE Tech is a separate for-profit technology company. ESBE Incorporated is not affiliated with or endorsed by the U.S. Department of Veterans Affairs.";

export const SITE = {
  name: "ESBE Incorporated",
  url: "https://esbeincorporated.org",
  description:
    "ESBE Incorporated is a 501(c)(3) nonprofit advancing veteran support and public-interest access to government-facing services.",
  email: "help@esbeincorporated.org",
  phone: "(802) 715-3723",
  taxId: "87-1218291",
  determinationLetter: DETERMINATION_LETTER,
  disclosure: DISCLOSURE,
};

const L = (text, url) => ({ text, url });

// Content model: sections are {heading, paragraphs[], bullets[], facts[[k,v]]}
export const PAGES = [
  {
    path: "/",
    mdPath: "/index.md",
    title: "ESBE Incorporated | Veteran support and public-interest work",
    h1: "Public-interest work that helps people move forward",
    description: SITE.description,
    aiSummary:
      "ESBE Incorporated is a 501(c)(3) nonprofit (EIN 87-1218291) advancing veteran support — through its AIVA Claims program, which helps veterans prepare VA disability claims for free — and public-interest access to government-facing services.",
    lastUpdated: "2026-09-22",
    sections: [
      {
        heading: "About",
        paragraphs: [
          "ESBE Incorporated builds practical tools and clear information for veterans and people navigating government-facing services.",
          "AIVA Claims is a program of ESBE Incorporated. ESBE Tech provides separate technical infrastructure. ESBE is independent and does not speak for or act on behalf of any government agency.",
        ],
      },
      {
        heading: "Our mission",
        paragraphs: [
          "Public systems should be easier to use when the stakes are high.",
          "We make information easier to understand and help people prepare for the next right step. Our work supports veterans and strengthens public-interest access to government-facing services through clarity, privacy, and accessible technology.",
        ],
      },
      {
        heading: "AIVA Claims (veteran support)",
        paragraphs: [
          "Free, donor-funded help preparing your VA disability claim. You review, edit, and file everything yourself.",
        ],
        bullets: [
          "Create your free account",
          "Upload your records",
          "Review your draft claim package",
          "File it yourself with the VA",
        ],
      },
      {
        heading: "Public-interest services",
        paragraphs: [
          "Accessible technology and plain-language information that help people understand and use government-facing services.",
        ],
      },
      {
        heading: "Selected civic projects",
        paragraphs: [
          "These independent public projects make government-facing information and reporting paths more understandable. They do not represent or act for a government agency.",
        ],
        links: [
          L("Hospital Ledger — a public-good resource for exploring hospital price files published under federal transparency requirements (live)", "https://hospitalledger.com"),
          L("SF Permit Navigator — a plain-language permit-path prototype that identifies where an official city system is required (prototype)", "https://sf-permit-detector.barkleesanders.workers.dev"),
          L("ImproveBayArea — one public reporting form that routes Bay Area requests to the appropriate official 311 service (live)", "https://improvebayarea.com"),
          L("NPS Report — a public tool for reporting maintenance and safety concerns through National Park Service contact paths (live)", "https://nps-report.barkleesanders.workers.dev"),
          L("SF Income Verify — a privacy-first income-verification prototype for San Francisco affordable housing; not affiliated with MOHCD (prototype)", "https://sf-income-verify.barkleesanders.workers.dev/#how-it-works"),
          L("Treasure Island Power — a public outage tracker documenting Treasure Island power failures and related accountability work (live)", "https://www.treasureislandsfpoweroutages.com"),
          L("ESBE Tech — independent infrastructure projects by Barklee Sanders", "https://esbe.tech"),
        ],
      },
      {
        heading: "Transparency",
        facts: [
          ["Organization", "ESBE Incorporated"],
          ["Federal tax ID", "87-1218291"],
          ["Federal status", "501(c)(3) nonprofit organization"],
          ["Public purpose", "Veteran support and public-interest access to government-facing services."],
          ["Program relationship", "AIVA Claims is a program of ESBE Incorporated."],
          ["Government relationship", "Independent nonprofit; not a government agency."],
        ],
        links: [
          L("Read the IRS determination letter", DETERMINATION_LETTER),
          L("Search the IRS Tax Exempt Organization Search", "https://apps.irs.gov/app/eos/"),
          L("Request governance or filing information", "mailto:help@esbeincorporated.org?subject=ESBE%20Incorporated%20transparency%20request"),
        ],
      },
      {
        heading: "Contact",
        paragraphs: [
          "For public inquiries, governance requests, and nonprofit correspondence, reach us by email or phone.",
          "Email: help@esbeincorporated.org · Phone: (802) 715-3723",
          DISCLOSURE,
        ],
      },
    ],
    related: [
      L("Community — Treasure Island community work", "https://esbeincorporated.org/community"),
      L("Donate to ESBE Incorporated", "https://esbeincorporated.org/donate"),
      L("AIVA Claims — create your free account", "https://aivaclaims.com/sign-up?utm_source=esbeincorporated.org&utm_medium=nonprofit_site&utm_campaign=programs_cta"),
    ],
  },
  {
    path: "/donate",
    mdPath: "/donate.md",
    title: "Donate | ESBE Incorporated",
    h1: "Free help for veterans, funded by people who give",
    description:
      "Donate to ESBE Incorporated, a 501(c)(3) nonprofit. Your gift funds free VA claims help for veterans through AIVA Claims.",
    aiSummary:
      "Donate to ESBE Incorporated, a 501(c)(3) nonprofit. Your gift funds free VA claims help for veterans through AIVA Claims.",
    lastUpdated: "2026-10-15",
    sections: [
      {
        heading: "What your gift does",
        paragraphs: [
          "AIVA Claims — ESBE's veteran support program — helps veterans understand and prepare VA disability claims at no cost to them. Donations pay for that work: the tools, the technology, and the time, so veterans never have to.",
          "Giving is processed securely by Every.org. ESBE Incorporated is an independent nonprofit and is not affiliated with the U.S. Department of Veterans Affairs.",
          "AIVA Claims: free, donor-funded help preparing VA disability claims. Veterans review, edit, and file everything themselves — your gift keeps it that way.",
          "No cost to veterans · 501(c)(3) nonprofit, EIN 87-1218291 · CA Charity Registration CT0403243 · Not affiliated with the U.S. Department of Veterans Affairs",
        ],
        links: [
          L("Donate now (Every.org, one-time)", "https://www.every.org/esbe-incorporated?frequency=once#/donate/pay"),
          L("Give monthly (Every.org)", "https://www.every.org/esbe-incorporated?frequency=monthly#/donate/pay"),
        ],
      },
      {
        heading: "Transparency",
        facts: [
          ["Organization", "ESBE Incorporated"],
          ["Federal tax ID", "87-1218291"],
          ["Federal status", "501(c)(3) nonprofit organization"],
          ["CA charity registration", "CT0403243"],
          ["Giving processed by", "Every.org"],
          ["Program relationship", "AIVA Claims is a program of ESBE Incorporated."],
        ],
        links: [
          L("Read the IRS determination letter", DETERMINATION_LETTER),
          L("Search the IRS Tax Exempt Organization Search", "https://apps.irs.gov/app/eos/"),
          L("Ask about sponsorships and grants", "mailto:help@esbeincorporated.org?subject=ESBE%20Incorporated%20sponsorship%20or%20grant%20inquiry"),
        ],
      },
    ],
    related: [L("ESBE Incorporated home", "https://esbeincorporated.org/")],
  },
  {
    path: "/community",
    mdPath: "/community.md",
    title: "Treasure Island Community Work | ESBE Incorporated",
    h1: "Dependable power is a community issue on Treasure Island",
    description:
      "ESBE Incorporated's community work on Treasure Island: public documentation of power outages and plain-language paths to official reporting channels for residents.",
    aiSummary:
      "ESBE Incorporated's community work on Treasure Island: public documentation of power outages and plain-language paths to official reporting channels for residents.",
    lastUpdated: "2026-10-24",
    sections: [
      {
        heading: "About this work",
        paragraphs: [
          "ESBE Incorporated supports public documentation and accountability work for Treasure Island residents. The goal is practical: make outage information easier to find, understand, and act on for the people who live on the island.",
          "ESBE Incorporated is an independent nonprofit. It is not a government agency and does not speak for the City and County of San Francisco, the San Francisco Public Utilities Commission, or the Treasure Island Development Authority.",
        ],
      },
      {
        heading: "Why it matters",
        paragraphs: [
          "An island community feels every outage.",
          "When the power fails, households, small businesses, and neighbors who rely on electricity are affected together. A clear public record of what happened, and a clear path to the right official channel, helps residents ask for reliable service with facts in hand.",
        ],
      },
      {
        heading: "Community resources",
        paragraphs: [
          "Treasure Island Power: a public outage tracker documenting Treasure Island power failures and related accountability work. Its records are community-compiled and are not a live power feed. It is an independent public project and is not affiliated with SFPUC or TIDA.",
          "For an emergency, call 911.",
        ],
        links: [
          L("Treasure Island Power — the public record of outages and related accountability work for Treasure Island", "https://www.treasureislandsfpoweroutages.com"),
          L("Report an outage — through Improve Bay Area or San Francisco 311", "https://www.treasureislandsfpoweroutages.com/report"),
          L("Resident resources — emergency alerts, claim forms, advocacy tools, and press coverage for Treasure Island residents", "https://www.treasureislandsfpoweroutages.com/resources"),
          L("Record requests — public records requests filed in the Treasure Island and Yerba Buena Island grid investigation", "https://www.treasureislandsfpoweroutages.com/records"),
          L("Infrastructure map — an interactive map of Treasure Island grid infrastructure and outage history", "https://www.treasureislandsfpoweroutages.com/map"),
          L("Power quality log — voltage sags, swells, transients, and interruptions recorded by a power-quality meter on Treasure Island", "https://www.treasureislandsfpoweroutages.com/power-quality"),
        ],
      },
      {
        heading: "Transparency",
        facts: [
          ["Organization", "ESBE Incorporated"],
          ["Federal tax ID", "87-1218291"],
          ["Federal status", "501(c)(3) nonprofit organization"],
          ["Government relationship", "Independent nonprofit; not a government agency."],
        ],
        links: [
          L("Read the IRS determination letter", DETERMINATION_LETTER),
          L("Contact us about this work", "mailto:help@esbeincorporated.org?subject=ESBE%20Incorporated%20community%20inquiry"),
        ],
      },
    ],
    related: [
      L("ESBE Incorporated home", "https://esbeincorporated.org/"),
      L("Support ESBE's work — donate", "https://esbeincorporated.org/donate"),
    ],
  },
];

// Public Worker routes that are intentionally NOT markdown pages, with reasons.
export const SKIPS = {
  "/og.png": "image asset generated by the Worker; not a content page",
  "/security.txt": "302 redirect to /.well-known/security.txt (a static asset); not a content page",
};

// ---- format helpers (spec §1) ----
const esc = (s) => String(s).replace(/\|/g, "\\|");
export function renderPage(page) {
  const out = [];
  out.push(`# ${page.h1}`, "", `> ${page.description}`, "");
  out.push(`Canonical: ${SITE.url}${page.path === "/" ? "/" : page.path}`, "");
  out.push(`Last updated: ${page.lastUpdated}`, "");
  for (const s of page.sections) {
    out.push(`## ${s.heading}`, "");
    for (const p of s.paragraphs || []) out.push(p, "");
    if (s.bullets?.length) {
      for (const b of s.bullets) out.push(`- ${b}`);
      out.push("");
    }
    if (s.facts?.length) {
      out.push("| | |", "| --- | --- |");
      for (const [k, v] of s.facts) out.push(`| ${esc(k)} | ${esc(v)} |`);
      out.push("");
    }
    if (s.links?.length) {
      for (const l of s.links) out.push(`- [${l.text}](${l.url})`);
      out.push("");
    }
  }
  if (page.related?.length) {
    out.push("## Related", "");
    for (const l of page.related) out.push(`- [${l.text}](${l.url})`);
    out.push("");
  }
  return out.join("\n");
}

// ---- registry (spec §1/§7): one step to add a page = add a PAGES entry ----
export const registry = new Map(PAGES.map((p) => [p.path, p]));
export function listMarkdownRoutes() {
  return PAGES.map((p) => ({
    path: p.path,
    markdown: p.mdPath,
    api: `/api/md${p.path === "/" ? "/index" : p.path}`,
    title: p.title,
    description: p.description,
    lastUpdated: p.lastUpdated,
    tokens: Math.ceil(renderPage(p).length / 4),
  }));
}

// ---- http helpers (spec §1 headers) ----
export const AI_LINK_HEADER =
  `<${SITE.url}/llms.txt>; rel="describedby"; type="text/plain", ` +
  `<${SITE.url}/llms-full.txt>; rel="describedby"; type="text/plain", ` +
  `<${SITE.url}/ai.txt>; rel="describedby"; type="text/plain"`;
const approxTokens = (body) => Math.ceil(body.length / 4);
export function markdownResponse(body, { status = 200, canonical = null, lastModified = null } = {}) {
  const headers = {
    "Content-Type": "text/markdown; charset=utf-8",
    "X-Markdown-Tokens": String(approxTokens(body)),
    "X-Robots-Tag": "noindex, follow",
    "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    Vary: "Accept",
    "Access-Control-Allow-Origin": "*",
  };
  if (canonical) {
    headers["Content-Location"] = canonical;
    headers["Link"] = `<${canonical}>; rel="canonical"`;
  }
  if (lastModified) headers["Last-Modified"] = new Date(`${lastModified}T00:00:00Z`).toUTCString();
  return new Response(status === 200 || status === 404 ? body : body, { status, headers });
}
export function plainResponse(body, cache = "public, s-maxage=3600, stale-while-revalidate=86400") {
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": cache,
      "Access-Control-Allow-Origin": "*",
      "X-Robots-Tag": "noindex, follow",
    },
  });
}
export function markdown404(pathname) {
  const body = `# Not Found\n\n> No page exists at ${pathname} on ${SITE.name}.\n\nCanonical: ${SITE.url}/\n\n## Related\n\n- [ESBE Incorporated home](${SITE.url}/)\n`;
  return markdownResponse(body, { status: 404, canonical: `${SITE.url}/` });
}

// ---- content negotiation (spec §1): q-aware; */* or missing Accept = HTML ----
export function wantsMarkdown(accept) {
  if (!accept) return false;
  let qMd = -1, qHtml = -1;
  for (const part of accept.split(",")) {
    const [type, ...params] = part.trim().split(";");
    let q = 1;
    for (const p of params) {
      const [k, v] = p.trim().split("=");
      if (k === "q") q = parseFloat(v);
    }
    const t = type.trim().toLowerCase();
    if (t === "text/markdown") qMd = Math.max(qMd, q);
    if (t === "text/html") qHtml = Math.max(qHtml, q);
    // */* deliberately ignored: it must always yield HTML.
  }
  return qMd >= 0 && qMd > qHtml;
}

// ---- llms.txt (spec §2, llmstxt.org) — keep in sync with robots.txt and ai.txt ----
export function buildLlms() {
  const lines = [
    `# ${SITE.name}`,
    "",
    `> ${SITE.description} Its program AIVA Claims helps veterans prepare VA disability claims for free, and its civic projects make government-facing information easier to find and use.`,
    "",
    `Key facts: 501(c)(3) nonprofit organization, EIN ${SITE.taxId}. AIVA Claims is a charitable program of ESBE Incorporated. Contact: ${SITE.email}. ESBE Incorporated is not affiliated with or endorsed by the U.S. Department of Veterans Affairs.`,
    "",
    "<!-- Keep in sync with /robots.txt and /ai.txt. -->",
    "",
    "## Core pages",
    "",
  ];
  for (const p of PAGES)
    lines.push(`- [${p.title}](${SITE.url}${p.mdPath}): ${p.description}`);
  lines.push(
    "",
    "## Machine-readable",
    "",
    `- [Full content](${SITE.url}/llms-full.txt): every page concatenated`,
    `- [Markdown catalog](${SITE.url}/api/md/_catalog)`,
    `- [Sitemap](${SITE.url}/sitemap.xml)`,
    `- [AI usage policy](${SITE.url}/ai.txt)`,
    `- [MCP server](${SITE.url}/mcp): public, read-only Model Context Protocol server — organization and transparency facts, programs, donation information, community work, and contact details as structured tools`,
    `- [MCP discovery](${SITE.url}/.well-known/mcp.json): discovery document for the MCP server`,
    ""
  );
  return lines.join("\n");
}

// ---- llms-full.txt (spec §3) ----
export function buildLlmsFull(now = new Date()) {
  const parts = [
    `# ${SITE.name} - full content`,
    "",
    `> ${SITE.description}`,
    "",
    `Generated: ${now.toISOString().slice(0, 10)}`,
    "",
  ];
  for (const p of PAGES) {
    parts.push("---", "", `<!-- source: ${SITE.url}${p.path === "/" ? "/" : p.path} -->`, "", renderPage(p), "");
  }
  const body = parts.join("\n");
  if (body.length > 500000) console.warn(`llms-full.txt is ${body.length} chars (>500k)`);
  return body;
}

// ---- ai.txt (spec §4) — keep in sync with robots.txt and llms.txt ----
export function buildAiTxt(now = new Date()) {
  return [
    "# ai.txt — ESBE Incorporated. Keep in sync with /robots.txt and /llms.txt.",
    "",
    "[identity]",
    `name: ${SITE.name}`,
    `url: ${SITE.url}/`,
    `description: ${SITE.description}`,
    `contact: ${SITE.email}`,
    `legal: 501(c)(3) nonprofit organization, EIN ${SITE.taxId}`,
    "",
    "[permissions]",
    "allowed: summarise, quote with attribution, cite, index for search and answers",
    "",
    "[restrictions]",
    "no fabricated quotes",
    "no fake reviews or ratings",
    "no presenting this content as the model's own work",
    "no training on user-generated private data",
    "",
    "[attribution]",
    `cite as: ${SITE.name} + the canonical HTML URL of the page used`,
    "",
    "[scope]",
    `included: /, /donate, /community, and their .md versions, /llms.txt, /llms-full.txt, /mcp, /.well-known/mcp.json`,
    "excluded: /api/ (machine endpoints; the markdown catalog at /api/md/_catalog is linked from /llms.txt for direct agent requests)",
    "note: this site has no admin, dashboard or auth pages",
    "",
    "[contact]",
    `email: ${SITE.email}`,
    `Last updated: ${now.toISOString().slice(0, 10)}`,
    "",
  ].join("\n");
}

// ---- robots.txt (spec §5) — keep in sync with llms.txt and ai.txt ----
// Training-crawler posture is intentionally unchanged from the live file:
// no training bots are named and no Content-Signal is added.
export function buildRobots() {
  const bots = ["OAI-SearchBot", "ChatGPT-User", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Perplexity-User"];
  const lines = [
    "# robots.txt for esbeincorporated.org",
    "# For AI agents: see /llms.txt and /ai.txt. Keep robots.txt, /llms.txt and /ai.txt in sync.",
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    "",
  ];
  for (const b of bots) lines.push(`User-agent: ${b}`, "Allow: /", "");
  lines.push(`Sitemap: ${SITE.url}/sitemap.xml`, "");
  return lines.join("\n");
}

// ---- single handler for every AI-readable path (spec §1) ----
// Returns a Response, or null to fall through to the normal HTML/app handling.
export function handleAiReadable(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method.toUpperCase();
  if (method === "OPTIONS" && (path.endsWith(".md") || path.startsWith("/api/md") || path === "/llms.txt" || path === "/llms-full.txt" || path === "/ai.txt")) {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
        "Access-Control-Allow-Headers": "Accept, Content-Type",
        Vary: "Accept",
      },
    });
  }
  if (method !== "GET" && method !== "HEAD") return null;
  const finish = (res) => {
    if (method !== "HEAD") return res;
    return new Response(null, { status: res.status, headers: res.headers });
  };

  if (path === "/llms.txt") return finish(plainResponse(buildLlms()));
  if (path === "/llms-full.txt")
    return finish(plainResponse(buildLlmsFull(), "public, s-maxage=86400, stale-while-revalidate=604800"));
  if (path === "/ai.txt") return finish(plainResponse(buildAiTxt()));
  if (path === "/robots.txt") return finish(plainResponse(buildRobots()));

  if (path === "/api/md/_catalog") {
    const body = JSON.stringify(
      { site: SITE.name, url: SITE.url, generatedFrom: "renderer registry", routes: listMarkdownRoutes() },
      null,
      2
    );
    return finish(
      new Response(body, {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
          "Access-Control-Allow-Origin": "*",
        },
      })
    );
  }
  if (path.startsWith("/api/md/")) {
    let sub = path.slice("/api/md".length) || "/";
    if (sub === "/index") sub = "/";
    const page = registry.get(sub);
    if (!page) return finish(markdown404(path));
    return finish(markdownResponse(renderPage(page), { canonical: `${SITE.url}${page.path === "/" ? "/" : page.path}`, lastModified: page.lastUpdated }));
  }
  if (path.endsWith(".md")) {
    let sub = path.slice(0, -3);
    if (sub === "/index" || sub === "") sub = "/";
    const page = registry.get(sub);
    if (!page) return finish(markdown404(path));
    return finish(markdownResponse(renderPage(page), { canonical: `${SITE.url}${page.path === "/" ? "/" : page.path}`, lastModified: page.lastUpdated }));
  }
  // Content negotiation on the allowlist of content routes only.
  const page = registry.get(path);
  if (page && wantsMarkdown(request.headers.get("Accept"))) {
    return finish(markdownResponse(renderPage(page), { canonical: `${SITE.url}${page.path === "/" ? "/" : page.path}`, lastModified: page.lastUpdated }));
  }
  return null;
}
