#!/usr/bin/env node
// build-content.mjs — generates mcp/content.generated.ts from ../ai-readable.js.
//
// The MCP Worker's tools may only re-publish the site's own content, and that
// content has exactly one human-edited source: the SITE + PAGES registry in
// ai-readable.js (itself transcribed verbatim from the live page templates in
// index.js). This script is the one bridge between them — generation, never
// hand-copying — and the generated file is committed. A freshness test
// (tests/mcp-content.test.mjs, plus `npm run check-content` here) regenerates
// and fails on any diff, so editing site copy without regenerating turns the
// suite red instead of letting the MCP silently serve stale nonprofit facts.
//
// Usage: node build-content.mjs [--check]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.join(here, "content.generated.ts");
const { SITE, PAGES } = await import(path.join(here, "..", "ai-readable.js"));

export function renderContentModule(site, pages) {
  return `// DO NOT EDIT — generated from ../ai-readable.js by mcp/build-content.mjs.
// Every string here is the site's own published copy, carried across so the
// MCP tools and the HTML pages can never disagree. Regenerate with:
//   node mcp/build-content.mjs

export interface SiteInfo {
  name: string;
  url: string;
  description: string;
  email: string;
  phone: string;
  taxId: string;
  determinationLetter: string;
  disclosure: string;
}

export interface ContentLink {
  text: string;
  url: string;
}

export interface PageSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  facts?: [string, string][];
  links?: ContentLink[];
}

export interface PageEntry {
  path: string;
  mdPath: string;
  title: string;
  h1: string;
  description: string;
  aiSummary: string;
  lastUpdated: string;
  sections: PageSection[];
  related: ContentLink[];
}

export const SITE: SiteInfo = ${JSON.stringify(site, null, 2)};

export const PAGES: PageEntry[] = ${JSON.stringify(pages, null, 2)};
`;
}

const rendered = renderContentModule(SITE, PAGES);
if (process.argv.includes("--check")) {
  const current = fs.existsSync(outPath) ? fs.readFileSync(outPath, "utf8") : "";
  if (current !== rendered) {
    console.error(
      "content.generated.ts is STALE — regenerate with: node mcp/build-content.mjs"
    );
    process.exit(1);
  }
  console.log("content.generated.ts is fresh");
} else {
  fs.writeFileSync(outPath, rendered);
  console.log(`wrote ${outPath} (${rendered.length} chars)`);
}
