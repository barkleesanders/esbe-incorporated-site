/**
 * Unit suite for the esbe-mcp Worker — mirrors AIVA's muse-connector tests
 * (tests/muse-connector-worker.test.ts in AIVA-Frontend): TOOL_NAMES pinned,
 * tools/list schema validity, per-tool outputs asserted against the real
 * generated content module, and the protocol negatives tested, not assumed.
 */
import { describe, expect, it, vi } from "vitest";
import { PAGES, SITE } from "../content.generated";
import { SERVER_INFO, TOOL_NAMES } from "../server";
import worker from "../worker";

const ENDPOINT = "https://esbeincorporated.org/mcp";
const PROTOCOL_VERSION = "2025-06-18";

interface JsonRpcEnvelope {
  jsonrpc: "2.0";
  id?: string | number | null;
  result?: Record<string, unknown>;
  error?: { code: number; message: string };
}

function environment(success = true) {
  return {
    MCP_RATE_LIMITER: {
      limit: vi.fn().mockResolvedValue({ success }),
    },
  };
}

function rpcRequest(body: unknown, headers: Record<string, string> = {}) {
  return new Request(ENDPOINT, {
    method: "POST",
    headers: {
      "CF-Connecting-IP": "192.0.2.1",
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      ...headers,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

/** The SDK's stateless serving answers as JSON or as one SSE message event. */
async function rpcResult(response: Response): Promise<JsonRpcEnvelope> {
  const text = await response.text();
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.startsWith("text/event-stream")) {
    const data = text
      .split("\n")
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trim());
    expect(data.length).toBeGreaterThan(0);
    return JSON.parse(data[data.length - 1]) as JsonRpcEnvelope;
  }
  return JSON.parse(text) as JsonRpcEnvelope;
}

async function callTool(name: string) {
  const response = await worker.fetch(
    rpcRequest({
      jsonrpc: "2.0",
      id: 7,
      method: "tools/call",
      params: { name, arguments: {} },
    }),
    environment(),
  );
  expect(response.status).toBe(200);
  const envelope = await rpcResult(response);
  expect(envelope.error).toBeUndefined();
  return envelope.result?.structuredContent as Record<string, any>;
}

describe("server identity and tool catalog", () => {
  it("pins TOOL_NAMES to exactly the five tools, in order", () => {
    expect(TOOL_NAMES).toEqual([
      "get_org_info",
      "list_services",
      "get_donate_info",
      "get_community_info",
      "get_contact",
    ]);
    expect(SERVER_INFO).toEqual({ name: "esbe-incorporated", version: "1.0.0" });
  });

  it("initialize returns the server identity and protocol version", async () => {
    const response = await worker.fetch(
      rpcRequest({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: PROTOCOL_VERSION,
          capabilities: {},
          clientInfo: { name: "test", version: "0.0.0" },
        },
      }),
      environment(),
    );
    expect(response.status).toBe(200);
    const envelope = await rpcResult(response);
    const result = envelope.result as any;
    expect(result.serverInfo).toEqual({
      name: "esbe-incorporated",
      version: "1.0.0",
    });
    expect(result.protocolVersion).toBe(PROTOCOL_VERSION);
  });

  it("tools/list returns the five tools with valid object input schemas", async () => {
    const response = await worker.fetch(
      rpcRequest({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} }),
      environment(),
    );
    expect(response.status).toBe(200);
    const envelope = await rpcResult(response);
    const tools = (envelope.result as any).tools as any[];
    expect(tools.map((t) => t.name)).toEqual([...TOOL_NAMES]);
    for (const tool of tools) {
      expect(tool.inputSchema.type).toBe("object");
      expect(typeof tool.description).toBe("string");
      expect(tool.description.length).toBeGreaterThan(20);
    }
  });
});

describe("tool outputs (fixtures = the real generated content)", () => {
  it("get_org_info carries the EIN, the transparency facts, and the disclosure verbatim as its own field", async () => {
    const out = await callTool("get_org_info");
    expect(out.name).toBe(SITE.name);
    expect(out.transparency.facts["Federal tax ID"]).toBe("87-1218291");
    expect(out.transparency.facts["Federal status"]).toContain("501(c)(3)");
    expect(out.disclosure).toBe(SITE.disclosure);
    expect(out.disclosure).toContain("87-1218291");
    expect(out.disclosure).toContain(
      "not affiliated with or endorsed by the U.S. Department of Veterans Affairs",
    );
    const urls = out.transparency.links.map((l: any) => l.url);
    expect(urls).toContain(SITE.determinationLetter);
    expect(urls).toContain("https://apps.irs.gov/app/eos/");
    expect(out.about.heading).toBe("About");
    expect(out.mission.heading).toBe("Our mission");
  });

  it("list_services returns AIVA's four published steps, the claim-help pointer, and verbatim live/prototype labels", async () => {
    const out = await callTool("list_services");
    expect(out.aivaClaimSteps).toEqual([
      "Create your free account",
      "Upload your records",
      "Review your draft claim package",
      "File it yourself with the VA",
    ]);
    expect(out.claimHelp).toEqual({
      website: "https://aivaclaims.com",
      mcpEndpoint: "https://aivaclaims.com/mcp",
    });
    expect(out.publicInterestServices.heading).toBe("Public-interest services");
    const labels = out.selectedCivicProjects.links.map((l: any) => l.text);
    expect(labels.some((t: string) => t.includes("(live)"))).toBe(true);
    expect(labels.some((t: string) => t.includes("(prototype)"))).toBe(true);
    expect(out.selectedCivicProjects.links.length).toBe(7);
  });

  it("get_donate_info returns only the two published Every.org giving links", async () => {
    const out = await callTool("get_donate_info");
    expect(out.givingLinks).toEqual([
      {
        text: "Donate now (Every.org, one-time)",
        url: "https://www.every.org/esbe-incorporated?frequency=once#/donate/pay",
      },
      {
        text: "Give monthly (Every.org)",
        url: "https://www.every.org/esbe-incorporated?frequency=monthly#/donate/pay",
      },
    ]);
    // The DISTINCT Every.org URLs anywhere in the output are exactly the two
    // published ones (they legitimately appear in both the section's links
    // and givingLinks — what must never appear is a THIRD, unpublished one).
    const distinctEveryOrgUrls = new Set(
      JSON.stringify(out).match(/https:\/\/www\.every\.org[^"\\]*/g) ?? [],
    );
    expect(distinctEveryOrgUrls).toEqual(
      new Set([
        "https://www.every.org/esbe-incorporated?frequency=once#/donate/pay",
        "https://www.every.org/esbe-incorporated?frequency=monthly#/donate/pay",
      ]),
    );
    expect(out.whatYourGiftDoes.heading).toBe("What your gift does");
    expect(out.transparency.facts["Federal tax ID"]).toBe("87-1218291");
  });

  it("get_community_info returns the community page's sections", async () => {
    const out = await callTool("get_community_info");
    expect(out.sections.map((s: any) => s.heading)).toEqual([
      "About this work",
      "Why it matters",
      "Community resources",
      "Transparency",
    ]);
  });

  it("get_contact returns exactly the published email, phone, and transparency mailto", async () => {
    const out = await callTool("get_contact");
    expect(out).toEqual({
      email: "help@esbeincorporated.org",
      phone: "(802) 715-3723",
      transparencyRequest:
        "mailto:help@esbeincorporated.org?subject=ESBE%20Incorporated%20transparency%20request",
    });
    expect(out.email).toBe(SITE.email);
    expect(out.phone).toBe(SITE.phone);
  });

  it("generated content still carries all three pages the tools read", () => {
    expect(PAGES.map((p) => p.path)).toEqual(["/", "/donate", "/community"]);
  });
});

describe("human and discovery surfaces", () => {
  it("GET /mcp with a bogus Bearer returns the 200 docs page", async () => {
    const response = await worker.fetch(
      new Request(ENDPOINT, {
        headers: { Authorization: "Bearer bogus" },
      }),
      {},
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/html");
    expect(response.headers.get("cache-control")).toBe("no-store");
    const html = await response.text();
    expect(html).toContain(
      "<title>ESBE Incorporated MCP Server | esbeincorporated.org/mcp</title>",
    );
    for (const name of TOOL_NAMES) expect(html).toContain(`<code>${name}</code>`);
  });

  it("GET /mcp/health returns the fleet health shape", async () => {
    const response = await worker.fetch(
      new Request(`${ENDPOINT}/health`),
      {},
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      ok: true,
      server: "esbe-incorporated",
      version: "1.0.0",
      tools: 5,
    });
  });

  it("GET /.well-known/mcp.json serves the PR #300-shaped discovery document, no-store", async () => {
    const response = await worker.fetch(
      new Request("https://esbeincorporated.org/.well-known/mcp.json"),
      {},
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    const doc = (await response.json()) as any;
    expect(doc.name).toBe(SITE.name);
    expect(doc.endpoint).toBe(ENDPOINT);
    expect(doc.transport).toBe("streamable-http");
    expect(doc.mcp_version).toBe(PROTOCOL_VERSION);
    expect(doc.server).toEqual({ name: "esbe-incorporated", version: "1.0.0" });
    expect(doc.endpoints).toEqual([
      {
        url: ENDPOINT,
        transport: "streamable-http",
        capabilities: ["tools"],
        auth: { type: "none" },
      },
    ]);
    expect(doc.documentation).toBe(ENDPOINT);
    expect(typeof doc.description).toBe("string");
    expect(typeof doc.icon).toBe("string");
  });

  it("OPTIONS answers preflight; unknown paths 404; wrong method 405 with Allow", async () => {
    const preflight = await worker.fetch(
      new Request(ENDPOINT, { method: "OPTIONS" }),
      {},
    );
    expect(preflight.status).toBe(204);
    expect(preflight.headers.get("access-control-allow-origin")).toBe("*");

    const missing = await worker.fetch(
      new Request("https://esbeincorporated.org/nope"),
      {},
    );
    expect(missing.status).toBe(404);

    const wrong = await worker.fetch(
      new Request(ENDPOINT, { method: "PUT" }),
      {},
    );
    expect(wrong.status).toBe(405);
    expect(wrong.headers.get("allow")).toBe("GET, HEAD, POST, OPTIONS");
  });
});

describe("protocol negatives", () => {
  it("malformed JSON → JSON-RPC -32700", async () => {
    const response = await worker.fetch(
      rpcRequest("{not json"),
      environment(),
    );
    expect(response.status).toBe(400);
    const envelope = (await response.json()) as JsonRpcEnvelope;
    expect(envelope.error?.code).toBe(-32700);
  });

  it("wrong Content-Type → 415", async () => {
    const response = await worker.fetch(
      rpcRequest("{}", { "Content-Type": "text/plain" }),
      environment(),
    );
    expect(response.status).toBe(415);
  });

  it("oversized body → 413 before parsing", async () => {
    const big = JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/list",
      params: {},
      pad: "x".repeat(70 * 1024),
    });
    const response = await worker.fetch(rpcRequest(big), environment());
    expect(response.status).toBe(413);
  });

  it("limiter binding removed → 503 (fails closed, never unlimited)", async () => {
    const response = await worker.fetch(
      rpcRequest({ jsonrpc: "2.0", id: 1, method: "tools/list", params: {} }),
      {},
    );
    expect(response.status).toBe(503);
  });

  it("limiter reporting over-limit → 429 with Retry-After", async () => {
    const response = await worker.fetch(
      rpcRequest({ jsonrpc: "2.0", id: 1, method: "tools/list", params: {} }),
      environment(false),
    );
    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("60");
  });
});
