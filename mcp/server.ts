/**
 * The esbe-incorporated MCP server: five PUBLIC, read-only tools.
 *
 * WHY A SEPARATE MODULE FROM worker.ts. workerd rejects any non-handler named
 * export from a Worker entry module — the entry may export only
 * `default { fetch }`. Tests need the tool names and the server factory, so
 * they live here and worker.ts imports them.
 *
 * WHERE EVERY FACT COMES FROM. Each tool reads ONLY ./content.generated.ts,
 * which mcp/build-content.mjs generates from ../ai-readable.js — the SITE +
 * PAGES registry transcribed verbatim from the live page templates in
 * index.js. Nothing here authors a new claim about ESBE Incorporated: the MCP
 * surface re-publishes copy already served on esbeincorporated.org, so
 * correcting the site (and regenerating) corrects the server. The freshness
 * test in tests/mcp-content.test.mjs fails if the generated copy goes stale.
 *
 * RESTRAINT IS A REQUIREMENT (design §1/§6). This is an information surface,
 * not a fundraising channel: tools return the site's published words, add no
 * solicitation language, handle no donation, and get_org_info always carries
 * the VA non-affiliation disclosure as its own field alongside the facts it
 * qualifies. Claim-specific questions are routed to AIVA Claims' own MCP
 * server (https://aivaclaims.com/mcp), never re-implemented here.
 */
import { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod";
import {
  PAGES,
  SITE,
  type ContentLink,
  type PageEntry,
  type PageSection,
} from "./content.generated";

export const SITE_URL = SITE.url;
export const MCP_ENDPOINT = `${SITE_URL}/mcp`;
export const SERVER_INFO = { name: "esbe-incorporated", version: "1.0.0" } as const;

/** Exactly the tools registered below, in registration order. */
export const TOOL_NAMES = [
  "get_org_info",
  "list_services",
  "get_donate_info",
  "get_community_info",
  "get_contact",
] as const;

export const TOOL_DESCRIPTIONS: Record<(typeof TOOL_NAMES)[number], string> = {
  get_org_info:
    "Returns ESBE Incorporated's identity, About and mission, and its published Transparency facts (organization, federal tax ID 87-1218291, 501(c)(3) status, public purpose, program and government relationships), the transparency links (IRS determination letter, IRS Tax Exempt Organization Search), and the site's VA non-affiliation disclosure verbatim as its own field. Use this when someone asks whether ESBE is a real nonprofit or what it is. No input.",
  list_services:
    "Returns what ESBE Incorporated does, in the site's own words: AIVA Claims (veteran support) with its four published steps and a pointer that claim-specific help lives at aivaclaims.com and its MCP server; Public-interest services; and Selected civic projects, each with its link and its published live/prototype label verbatim. No input.",
  get_donate_info:
    "Returns the donate page's own content — What your gift does and its Transparency section — plus the two published giving links (Every.org one-time, Every.org monthly). Links and facts only: no amounts beyond the page's copy, and this server never accepts or handles a donation. No input.",
  get_community_info:
    "Returns the community page's sections — About this work, Why it matters, and Community resources for ESBE Incorporated's Treasure Island community work — in the site's own words. No input.",
  get_contact:
    "Returns exactly what the site's Contact section publishes: email help@esbeincorporated.org, phone (802) 715-3723, and the transparency-request mailto link. Nothing more — no unpublished contact details exist on this server. No input.",
};

const SERVER_INSTRUCTIONS = [
  "ESBE Incorporated (esbeincorporated.org) is a 501(c)(3) nonprofit organization, EIN 87-1218291. AIVA Claims is a charitable program of ESBE Incorporated that helps veterans prepare VA disability claims for free.",
  "Every tool returns content already published on esbeincorporated.org, generated from the same registry as the site's pages. Quote it faithfully; do not add claims, solicitation language, or donation amounts the site does not publish.",
  "ESBE Incorporated is not affiliated with or endorsed by the U.S. Department of Veterans Affairs. For claim-specific help, direct veterans to AIVA Claims at https://aivaclaims.com and its MCP server at https://aivaclaims.com/mcp — this server describes the program but does not re-implement its tools.",
].join(" ");

// ---- registry lookups (the generated module is the only content source) ----

function pageByPath(pathname: string): PageEntry {
  const page = PAGES.find((p) => p.path === pathname);
  if (!page) throw new Error(`generated content is missing page ${pathname}`);
  return page;
}

function sectionByHeading(page: PageEntry, heading: string): PageSection {
  const section = page.sections.find((s) => s.heading === heading);
  if (!section)
    throw new Error(`generated content is missing section "${heading}" on ${page.path}`);
  return section;
}

const LinkSchema = z.object({ text: z.string(), url: z.string() });

const SectionSchema = z.object({
  heading: z.string(),
  paragraphs: z.array(z.string()),
  bullets: z.array(z.string()),
  facts: z.record(z.string(), z.string()),
  links: z.array(LinkSchema),
});

type SectionOut = z.infer<typeof SectionSchema>;

/** Normalizes a registry section to the full output shape (empty ≠ absent). */
function sectionOut(section: PageSection): SectionOut {
  return {
    heading: section.heading,
    paragraphs: section.paragraphs ?? [],
    bullets: section.bullets ?? [],
    facts: Object.fromEntries(section.facts ?? []),
    links: (section.links ?? []).map((l: ContentLink) => ({ ...l })),
  };
}

const READ_ONLY = {
  readOnlyHint: true,
  idempotentHint: true,
  openWorldHint: false,
} as const;

function textResult<T extends Record<string, unknown>>(structured: T) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(structured) }],
    structuredContent: structured,
  };
}

const OrgInfoOutput = z.object({
  name: z.string(),
  url: z.string(),
  description: z.string(),
  about: SectionSchema,
  mission: SectionSchema,
  transparency: SectionSchema,
  // The disclosure is its OWN field by design (§2): an agent summarizing the
  // org gets the non-affiliation language in the same payload as the facts.
  disclosure: z.string(),
});

const ServicesOutput = z.object({
  aivaClaims: SectionSchema,
  aivaClaimSteps: z.array(z.string()),
  claimHelp: z.object({ website: z.string(), mcpEndpoint: z.string() }),
  publicInterestServices: SectionSchema,
  selectedCivicProjects: SectionSchema,
});

const DonateOutput = z.object({
  page: z.object({ title: z.string(), description: z.string() }),
  whatYourGiftDoes: SectionSchema,
  givingLinks: z.array(LinkSchema),
  transparency: SectionSchema,
});

const CommunityOutput = z.object({
  page: z.object({ title: z.string(), description: z.string() }),
  sections: z.array(SectionSchema),
});

const ContactOutput = z.object({
  email: z.string(),
  phone: z.string(),
  transparencyRequest: z.string(),
});

/**
 * Builds a fresh server per request (the handler in worker.ts calls this from
 * its factory), so no request state can leak between callers.
 */
export function createEsbeMcpServer(): McpServer {
  const server = new McpServer(SERVER_INFO, {
    instructions: SERVER_INSTRUCTIONS,
    maxToolInputElements: 64,
  });

  const home = pageByPath("/");
  const donate = pageByPath("/donate");
  const community = pageByPath("/community");

  // Source: SITE + PAGES["/"] sections About, Our mission, Transparency.
  server.registerTool(
    TOOL_NAMES[0],
    {
      title: "Get ESBE Incorporated's organization information",
      description: TOOL_DESCRIPTIONS.get_org_info,
      inputSchema: z.object({}),
      outputSchema: OrgInfoOutput,
      annotations: READ_ONLY,
    },
    async () =>
      textResult({
        name: SITE.name,
        url: SITE.url,
        description: SITE.description,
        about: sectionOut(sectionByHeading(home, "About")),
        mission: sectionOut(sectionByHeading(home, "Our mission")),
        transparency: sectionOut(sectionByHeading(home, "Transparency")),
        disclosure: SITE.disclosure,
      }),
  );

  // Source: PAGES["/"] sections AIVA Claims (veteran support),
  // Public-interest services, Selected civic projects.
  server.registerTool(
    TOOL_NAMES[1],
    {
      title: "List ESBE Incorporated's programs and services",
      description: TOOL_DESCRIPTIONS.list_services,
      inputSchema: z.object({}),
      outputSchema: ServicesOutput,
      annotations: READ_ONLY,
    },
    async () => {
      const aiva = sectionByHeading(home, "AIVA Claims (veteran support)");
      return textResult({
        aivaClaims: sectionOut(aiva),
        aivaClaimSteps: [...(aiva.bullets ?? [])],
        claimHelp: {
          website: "https://aivaclaims.com",
          mcpEndpoint: "https://aivaclaims.com/mcp",
        },
        publicInterestServices: sectionOut(
          sectionByHeading(home, "Public-interest services"),
        ),
        selectedCivicProjects: sectionOut(
          sectionByHeading(home, "Selected civic projects"),
        ),
      });
    },
  );

  // Source: PAGES["/donate"] — What your gift does + Transparency, and the
  // page's only giving links (the two Every.org links in that section).
  server.registerTool(
    TOOL_NAMES[2],
    {
      title: "Get donation information for ESBE Incorporated",
      description: TOOL_DESCRIPTIONS.get_donate_info,
      inputSchema: z.object({}),
      outputSchema: DonateOutput,
      annotations: READ_ONLY,
    },
    async () => {
      const gift = sectionByHeading(donate, "What your gift does");
      return textResult({
        page: { title: donate.title, description: donate.description },
        whatYourGiftDoes: sectionOut(gift),
        givingLinks: (gift.links ?? []).map((l) => ({ ...l })),
        transparency: sectionOut(sectionByHeading(donate, "Transparency")),
      });
    },
  );

  // Source: PAGES["/community"] — all of its sections, in page order.
  server.registerTool(
    TOOL_NAMES[3],
    {
      title: "Get ESBE Incorporated's Treasure Island community work",
      description: TOOL_DESCRIPTIONS.get_community_info,
      inputSchema: z.object({}),
      outputSchema: CommunityOutput,
      annotations: READ_ONLY,
    },
    async () =>
      textResult({
        page: { title: community.title, description: community.description },
        sections: community.sections.map(sectionOut),
      }),
  );

  // Source: SITE + PAGES["/"] section Contact and the Transparency section's
  // transparency-request mailto. Exactly the published email/phone — Open
  // Decision #3's recommendation, applied.
  server.registerTool(
    TOOL_NAMES[4],
    {
      title: "Get ESBE Incorporated's published contact details",
      description: TOOL_DESCRIPTIONS.get_contact,
      inputSchema: z.object({}),
      outputSchema: ContactOutput,
      annotations: READ_ONLY,
    },
    async () => {
      const transparency = sectionByHeading(home, "Transparency");
      const request = (transparency.links ?? []).find((l) =>
        l.url.startsWith("mailto:"),
      );
      if (!request)
        throw new Error("generated content is missing the transparency mailto");
      return textResult({
        email: SITE.email,
        phone: SITE.phone,
        transparencyRequest: request.url,
      });
    },
  );

  return server;
}
