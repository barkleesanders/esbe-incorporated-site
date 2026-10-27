/**
 * esbe-mcp — the public, read-only MCP (Model Context Protocol) server at
 * https://esbeincorporated.org/mcp for ESBE Incorporated, a 501(c)(3)
 * nonprofit.
 *
 * WHY A SEPARATE WORKER (design §3). index.js is a ~190 KB recovered bundle
 * served through a Traks-managed entry; inlining an SDK-grade Streamable HTTP
 * endpoint into it would put the whole nonprofit site in the blast radius of
 * its most complex surface. A separate Worker — the fleet pattern AIVA's
 * muse-connector established — is bound by zone routes more specific than the
 * site Worker's catch-all (see wrangler.jsonc), deploys and rolls back
 * independently, and never touches the recovered bundle.
 *
 * ROUTES
 *   GET|HEAD /mcp, /mcp/   200 text/html — the human-readable documentation
 *                          page. It is BOTH the documentation URL for any
 *                          connector directory AND the 2xx target for
 *                          credential-vault probes, which send a bare
 *                          `Authorization: Bearer <key>` and store nothing on
 *                          a non-2xx — so GET returns 200 regardless of any
 *                          Authorization header (there is no v1 auth to check).
 *   GET      /mcp/health   200 application/json
 *                          {ok:true, server:"esbe-incorporated",
 *                           version:"1.0.0", tools:5}
 *   GET      /.well-known/mcp.json
 *                          200 application/json — the MCP discovery document.
 *                          DEVIATION (design §3, sanctioned): per the fleet
 *                          pattern the SITE Worker serves this file; here the
 *                          MCP Worker does, via an additional exact zone
 *                          route, because the only alternative is surgery on
 *                          the recovered bundle to save a distinction no
 *                          client can observe.
 *   POST     /mcp          the MCP Streamable HTTP endpoint (JSON-RPC 2.0,
 *                          stateless: a fresh McpServer per request).
 *   OPTIONS  *             CORS preflight.
 *   anything else          404 / 405 with Allow.
 *
 * SECURITY POSTURE
 *   - No authentication in v1: every tool returns content already published
 *     on esbeincorporated.org; nothing reads or writes personal or donor
 *     data, and the Worker has no D1/R2/KV/secret bindings.
 *   - Rate-limited per CF-Connecting-IP through the MCP_RATE_LIMITER binding
 *     (dedicated namespace, see wrangler.jsonc), FAIL-CLOSED (503) when the
 *     binding is missing or throws, so a mis-configured deploy can never
 *     serve unlimited.
 *   - Content-Type must be application/json (415), body capped at 64 KiB
 *     (413) BEFORE parsing, JSON parse errors answered as JSON-RPC -32700.
 *   - CORS is `*` with credentials never allowed or reflected; every
 *     response is Cache-Control: no-store. Structured logs at the seams;
 *     never a request body or header.
 */
import { createMcpHandler } from "@modelcontextprotocol/server";
import { SITE } from "./content.generated";
import {
  createEsbeMcpServer,
  MCP_ENDPOINT,
  SERVER_INFO,
  TOOL_DESCRIPTIONS,
  TOOL_NAMES,
} from "./server";

interface RateLimiterBinding {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

interface EsbeMcpEnv {
  MCP_RATE_LIMITER?: RateLimiterBinding;
}

const MAX_BODY_BYTES = 64 * 1024;
const RATE_LIMIT_PER_MINUTE = 60; // keep in sync with wrangler.jsonc
const MCP_PROTOCOL_VERSION = "2025-06-18";
const ALLOW_HEADER = "GET, HEAD, POST, OPTIONS";

/**
 * One handler for the Worker's lifetime; the FACTORY runs once per request,
 * so each caller gets its own McpServer and no state crosses requests.
 * keepAliveMs: 0 — every response here is a single immediate result.
 */
const mcpHandler = createMcpHandler(() => createEsbeMcpServer(), {
  keepAliveMs: 0,
  maxRequestBodySize: MAX_BODY_BYTES,
  onerror: (error) => {
    console.error(
      JSON.stringify({ event: "mcp_handler_error", message: error.message }),
    );
  },
});

/**
 * The discovery document (AIVA PR #300 shape), built from the generated
 * content module and the server's own identity so its facts mirror the
 * server's initialize response — which stays authoritative.
 */
function buildDiscoveryDocument() {
  return {
    name: SITE.name,
    description:
      "Public, read-only Model Context Protocol server for ESBE Incorporated, a 501(c)(3) nonprofit: organization and transparency facts (including EIN 87-1218291 and the VA non-affiliation disclosure), its AIVA Claims veteran-support program and civic projects, donation information, community work, and published contact details. No authentication is required: every tool returns content already published on esbeincorporated.org.",
    icon: `${SITE.url}/favicon.svg`,
    endpoint: MCP_ENDPOINT,
    transport: "streamable-http",
    mcp_version: MCP_PROTOCOL_VERSION,
    server: { name: SERVER_INFO.name, version: SERVER_INFO.version },
    endpoints: [
      {
        url: MCP_ENDPOINT,
        transport: "streamable-http",
        capabilities: ["tools"],
        auth: { type: "none" },
      },
    ],
    documentation: MCP_ENDPOINT,
  };
}

function standardHeaders(contentType: string): Headers {
  return new Headers({
    "Content-Type": contentType,
    "Cache-Control": "no-store",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
    "X-Content-Type-Options": "nosniff",
  });
}

function corsHeaders(headers: Headers): Headers {
  // Any origin, no credentials: this endpoint sets no cookies and reads no
  // Authorization value, so the wildcard is honest about that.
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", ALLOW_HEADER);
  headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Mcp-Session-Id, Mcp-Protocol-Version",
  );
  headers.set("Access-Control-Expose-Headers", "Mcp-Session-Id");
  headers.set("Access-Control-Max-Age", "86400");
  return headers;
}

function htmlHeaders(): Headers {
  const headers = corsHeaders(standardHeaders("text/html; charset=utf-8"));
  headers.set(
    "Content-Security-Policy",
    "default-src 'none'; style-src 'unsafe-inline'; img-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
  );
  headers.set("X-Frame-Options", "DENY");
  return headers;
}

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return Response.json(body, {
    status,
    headers: corsHeaders(standardHeaders("application/json; charset=utf-8")),
  });
}

/** A JSON-RPC 2.0 error envelope for failures we detect before the SDK runs. */
function jsonRpcError(
  code: number,
  message: string,
  status: number,
  id: string | number | null = null,
): Response {
  return jsonResponse({ jsonrpc: "2.0", id, error: { code, message } }, status);
}

function methodNotAllowed(): Response {
  const response = jsonResponse({ error: "Method not allowed" }, 405);
  response.headers.set("Allow", ALLOW_HEADER);
  return response;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const STYLES = `*{box-sizing:border-box;margin:0;padding:0}body{background:#10243e;color:#ffffff;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1.6;min-height:100vh;padding:1.5rem}main{margin:0 auto;max-width:64rem}h1{color:#9ec7ee;font-size:clamp(1.875rem,5vw,2.5rem);font-weight:700;letter-spacing:-.025em;margin-bottom:.75rem}h2{border-bottom:1px solid #2b5ea7;color:#ffffff;font-size:1.25rem;margin:2rem 0 1rem;padding-bottom:.5rem}h3{color:#9ec7ee;font-size:1.05rem;margin:1.25rem 0 .5rem}p,li{color:#d7e6f5}ul,ol{margin:.5rem 0 .5rem 1.5rem}li+li{margin-top:.375rem}a{color:#9ec7ee}code{background:#0a1a2e;border:1px solid #2b5ea7;border-radius:.25rem;color:#ffffff;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.9em;padding:.1rem .35rem}pre{background:#0a1a2e;border:1px solid #2b5ea7;border-radius:.5rem;color:#ffffff;font-size:.875rem;line-height:1.5;margin:.75rem 0;overflow-x:auto;padding:1rem}pre code{background:none;border:0;padding:0}.card{background:#17345a;border:1px solid #2b5ea7;border-radius:.75rem;margin-bottom:1rem;padding:1.25rem}.note{border:1px solid #e8b93c;border-radius:.5rem;margin:1rem 0;padding:1rem}.sub{color:#d7e6f5;max-width:52rem}@media(max-width:640px){body{padding:1rem}.card{padding:1rem}}`;

/**
 * The documentation page. The tool catalog renders from TOOL_NAMES +
 * TOOL_DESCRIPTIONS — the same constants server.ts registers — so the page
 * cannot list a tool the endpoint does not have.
 */
function renderDocsPage(): string {
  const toolCards = TOOL_NAMES.map(
    (name) =>
      `<article class="card"><h3><code>${escapeHtml(name)}</code></h3><p>${escapeHtml(TOOL_DESCRIPTIONS[name])}</p></article>`,
  ).join("");
  const exampleInit = JSON.stringify(
    {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: MCP_PROTOCOL_VERSION,
        capabilities: {},
        clientInfo: { name: "your-client", version: "1.0.0" },
      },
    },
    null,
    2,
  );
  const exampleCall = JSON.stringify(
    {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: { name: "get_org_info", arguments: {} },
    },
    null,
    2,
  );

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>ESBE Incorporated MCP Server | esbeincorporated.org/mcp</title>
  <meta name="description" content="Public, read-only Model Context Protocol server for ESBE Incorporated, a 501(c)(3) nonprofit: organization and transparency facts, the AIVA Claims veteran-support program, donation information, community work, and published contact details.">
  <meta name="robots" content="index,follow">
  <link rel="canonical" href="${MCP_ENDPOINT}">
  <style>${STYLES}</style>
</head>
<body>
  <main>
    <header>
      <h1>ESBE Incorporated MCP Server</h1>
      <p class="sub">A public, read-only <a href="https://modelcontextprotocol.io/" rel="noopener noreferrer">Model Context Protocol</a> server that lets AI assistants answer questions about ESBE Incorporated — a 501(c)(3) nonprofit, EIN ${SITE.taxId} — from the organization's own published words: its status, programs, giving paths, and disclosure language. Server name <code>${SERVER_INFO.name}</code>, version <code>${SERVER_INFO.version}</code>.</p>
    </header>

    <section aria-labelledby="endpoint-heading">
      <h2 id="endpoint-heading">Endpoint</h2>
      <div class="card">
        <p>MCP endpoint: <code>${MCP_ENDPOINT}</code></p>
        <p>Transport: MCP Streamable HTTP, stateless. Send JSON-RPC 2.0 requests with <code>POST</code>, <code>Content-Type: application/json</code>, and <code>Accept: application/json, text/event-stream</code>. Each request is served by a fresh server instance; no session is created and no <code>Mcp-Session-Id</code> is required. Protocol version <code>${MCP_PROTOCOL_VERSION}</code> is supported (older MCP revisions negotiate).</p>
        <p>Health check: <code>GET ${MCP_ENDPOINT}/health</code> returns <code>{"ok":true,"server":"${SERVER_INFO.name}","version":"${SERVER_INFO.version}","tools":${TOOL_NAMES.length}}</code>.</p>
        <p>Discovery: <code>GET ${SITE.url}/.well-known/mcp.json</code>.</p>
      </div>
      <div class="note">
        <p><strong>No authentication is required.</strong> Every tool returns content already published on esbeincorporated.org. No personal or donor data is read or written, and donations happen entirely at Every.org — this server never handles one. An <code>Authorization</code> header, if sent, is ignored.</p>
      </div>
    </section>

    <section aria-labelledby="tools-heading">
      <h2 id="tools-heading">Tools</h2>
      <p>All ${TOOL_NAMES.length} tools are read-only and deterministic. Each returns a <code>text</code> content block containing JSON, and the same object as <code>structuredContent</code>.</p>
      ${toolCards}
    </section>

    <section aria-labelledby="example-heading">
      <h2 id="example-heading">Example</h2>
      <p>Initialize:</p>
      <pre><code>POST ${MCP_ENDPOINT}
Content-Type: application/json
Accept: application/json, text/event-stream

${escapeHtml(exampleInit)}</code></pre>
      <p>Call a tool:</p>
      <pre><code>${escapeHtml(exampleCall)}</code></pre>
    </section>

    <section aria-labelledby="limits-heading">
      <h2 id="limits-heading">Rate limits</h2>
      <div class="card">
        <p>${RATE_LIMIT_PER_MINUTE} requests per minute per client IP address. Over the limit the server answers <code>429</code> with <code>Retry-After: 60</code>. Request bodies are limited to ${MAX_BODY_BYTES / 1024} KiB (<code>413</code>), and <code>Content-Type</code> must be <code>application/json</code> (<code>415</code>).</p>
      </div>
    </section>

    <section aria-labelledby="about-heading">
      <h2 id="about-heading">About ESBE Incorporated</h2>
      <ul>
        <li>Website: <a href="${SITE.url}">${SITE.url}</a></li>
        <li>Contact: <a href="mailto:${SITE.email}">${SITE.email}</a> · ${escapeHtml(SITE.phone)}</li>
        <li>AIVA Claims (claim-specific help): <a href="https://aivaclaims.com">aivaclaims.com</a> and its MCP server at <a href="https://aivaclaims.com/mcp">aivaclaims.com/mcp</a></li>
      </ul>
      <div class="note">
        <p>${escapeHtml(SITE.disclosure)}</p>
      </div>
    </section>
  </main>
</body>
</html>`;
}

class PayloadTooLargeError extends Error {}

/**
 * Reads the body into memory with a hard byte cap enforced while streaming,
 * so a client that lies about (or omits) Content-Length still cannot make
 * the Worker buffer more than MAX_BODY_BYTES.
 */
async function readLimitedBody(request: Request): Promise<string> {
  const declaredLength = Number(request.headers.get("Content-Length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    throw new PayloadTooLargeError();
  }
  if (!request.body) return "";

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > MAX_BODY_BYTES) {
      await reader.cancel();
      throw new PayloadTooLargeError();
    }
    chunks.push(value);
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(body);
}

function acceptsBothMcpMediaTypes(accept: string | null): boolean {
  if (!accept) return false;
  const lower = accept.toLowerCase();
  return (
    lower.includes("application/json") && lower.includes("text/event-stream")
  );
}

function requestIdOf(parsed: unknown): string | number | null {
  if (typeof parsed !== "object" || parsed === null || !("id" in parsed)) {
    return null;
  }
  const { id } = parsed;
  return typeof id === "string" || typeof id === "number" ? id : null;
}

function methodOf(parsed: unknown): string {
  if (typeof parsed !== "object" || parsed === null || !("method" in parsed)) {
    return "unknown";
  }
  return typeof parsed.method === "string" ? parsed.method : "unknown";
}

function toolNameOf(parsed: unknown): string | undefined {
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("params" in parsed) ||
    typeof parsed.params !== "object" ||
    parsed.params === null ||
    !("name" in parsed.params) ||
    typeof parsed.params.name !== "string"
  ) {
    return undefined;
  }
  return parsed.params.name;
}

async function handleMcpPost(
  request: Request,
  env: EsbeMcpEnv,
): Promise<Response> {
  if (
    !request.headers
      .get("Content-Type")
      ?.toLowerCase()
      .startsWith("application/json")
  ) {
    return jsonResponse(
      { error: "Content-Type must be application/json" },
      415,
    );
  }

  if (!env.MCP_RATE_LIMITER) {
    console.error(JSON.stringify({ event: "mcp_missing_rate_limit_binding" }));
    return jsonResponse(
      { error: "The MCP endpoint is temporarily unavailable" },
      503,
    );
  }

  const clientKey = request.headers.get("CF-Connecting-IP") ?? "unknown";
  try {
    const { success } = await env.MCP_RATE_LIMITER.limit({ key: clientKey });
    if (!success) {
      const response = jsonResponse(
        { error: "Too many requests. Please try again in a minute." },
        429,
      );
      response.headers.set("Retry-After", "60");
      return response;
    }
  } catch {
    console.error(JSON.stringify({ event: "mcp_rate_limit_failed" }));
    return jsonResponse(
      { error: "The MCP endpoint is temporarily unavailable" },
      503,
    );
  }

  let bodyText: string;
  try {
    bodyText = await readLimitedBody(request);
  } catch (error) {
    if (error instanceof PayloadTooLargeError) {
      return jsonResponse({ error: "Request body is too large" }, 413);
    }
    return jsonRpcError(-32700, "Parse error", 400);
  }

  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(bodyText);
  } catch {
    return jsonRpcError(-32700, "Parse error", 400);
  }

  const startedAt = Date.now();
  const method = methodOf(parsedBody);
  const tool = method === "tools/call" ? toolNameOf(parsedBody) : undefined;
  const headers = new Headers(request.headers);
  // The SDK answers 406 unless Accept names BOTH application/json and
  // text/event-stream. The spec requires clients to send both, but a
  // hand-written probe often sends one or none; being lenient costs nothing.
  if (!acceptsBothMcpMediaTypes(headers.get("Accept"))) {
    headers.set("Accept", "application/json, text/event-stream");
  }
  const bounded = new Request(request.url, {
    method: "POST",
    headers,
    body: bodyText,
  });

  let response: Response;
  try {
    response = await mcpHandler.fetch(bounded, { parsedBody });
  } catch (error) {
    console.error(
      JSON.stringify({
        event: "mcp_request_failed",
        method,
        tool,
        message: error instanceof Error ? error.message : "unknown",
      }),
    );
    return jsonRpcError(-32603, "Internal error", 500, requestIdOf(parsedBody));
  }

  console.log(
    JSON.stringify({
      event: tool ? "mcp_tool_call" : "mcp_request",
      method,
      tool,
      ok: response.ok,
      status: response.status,
      ms: Date.now() - startedAt,
    }),
  );

  const outHeaders = corsHeaders(new Headers(response.headers));
  outHeaders.set("Cache-Control", "no-store");
  outHeaders.set("X-Content-Type-Options", "nosniff");
  outHeaders.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: outHeaders,
  });
}

export default {
  async fetch(request: Request, env: EsbeMcpEnv): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(new Headers({ Allow: ALLOW_HEADER })),
      });
    }

    // Discovery file — served by THIS Worker per design §3's recorded
    // deviation (exact zone route in wrangler.jsonc).
    if (pathname === "/.well-known/mcp.json") {
      if (request.method !== "GET" && request.method !== "HEAD") {
        return methodNotAllowed();
      }
      const body = JSON.stringify(buildDiscoveryDocument(), null, 2);
      return new Response(request.method === "HEAD" ? null : body, {
        headers: corsHeaders(
          standardHeaders("application/json; charset=utf-8"),
        ),
      });
    }

    if (pathname === "/mcp/health") {
      if (request.method !== "GET" && request.method !== "HEAD") {
        return methodNotAllowed();
      }
      return jsonResponse({
        ok: true,
        server: SERVER_INFO.name,
        version: SERVER_INFO.version,
        tools: TOOL_NAMES.length,
      });
    }

    const isEndpoint = pathname === "/mcp" || pathname === "/mcp/";
    if (!isEndpoint) {
      return jsonResponse({ error: "Not found" }, 404);
    }

    if (request.method === "POST") return handleMcpPost(request, env);
    if (request.method === "GET" || request.method === "HEAD") {
      // 200 for every GET, Authorization header or not: vault probes send a
      // Bearer and need a 2xx, and the documentation is public.
      const html = renderDocsPage();
      return new Response(request.method === "HEAD" ? null : html, {
        headers: htmlHeaders(),
      });
    }
    return methodNotAllowed();
  },
};
