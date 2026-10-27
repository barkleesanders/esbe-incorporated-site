// GA4 conversion-event coverage: the events Google Ads imports
// (aiva_signup_click 7855556310, donate_click 7855556313 in account
// 681-385-8588) must actually be fired by the shipped site, and every
// public page must carry the GA4 tag so the events can reach GA4.
// Run: node --test tests/ga4-events.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const bundle = fs.readFileSync(path.join(root, "index.js"), "utf8");
const ads = fs.readFileSync(path.join(root, "public/ads.js"), "utf8");

test("every page template carries the GA4 tag (home, /donate, /community)", () => {
  assert.equal((bundle.match(/G-YLVSKGE4LT/g) || []).length, 6);
  assert.equal((bundle.match(/googletagmanager\.com\/gtag\/js/g) || []).length, 3);
});

test("ads.js fires both Ads conversion events with exact GA4 names", () => {
  assert.match(ads, /gtag\('event', 'aiva_signup_click'/);
  assert.match(ads, /gtag\('event', 'donate_click'/);
  assert.match(ads, /aivaclaims\.com' && url\.pathname\.startsWith\('\/sign-up'\)/);
  assert.match(ads, /url\.pathname === '\/donate'/);
});

test("the CTAs the events describe exist in the bundle", () => {
  assert.ok(bundle.includes("aivaclaims.com/sign-up"), "AIVA sign-up CTA missing");
  assert.ok(bundle.includes("www.every.org/esbe-incorporated"), "Every.org donate CTA missing");
});

test("ads.js is loaded on all three page templates", () => {
  assert.equal((bundle.match(/src="\/ads\.js"/g) || []).length, 3);
});

test("CSP allows the hosts gtag.js actually collects to", () => {
  // gtag.js sends GA4 hits by fetch/beacon to analytics.google.com,
  // www.google.com and stats.g.doubleclick.net (observed live in a
  // browser console 2026-10-27: every collect was CSP-blocked when
  // connect-src listed only www.google-analytics.com). The img-src
  // fallback needs the same hosts.
  const csp = bundle.match(/connect-src ([^;]+);/)?.[1] ?? "";
  for (const h of ["https://www.google-analytics.com", "https://region1.google-analytics.com", "https://analytics.google.com", "https://www.google.com", "https://stats.g.doubleclick.net"])
    assert.ok(csp.includes(h), `connect-src missing ${h}`);
});
