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

test("every page template carries the GA4 tag (home, /donate, /community, /privacy, /terms)", () => {
  // Five page templates ship in the bundle: /, /donate, /community,
  // /privacy, /terms. Each carries the gtag.js loader once (the loader
  // URL carries the measurement ID) plus one gtag('config', ID) call,
  // so the ID appears exactly twice per template.
  assert.equal((bundle.match(/googletagmanager\.com\/gtag\/js/g) || []).length, 5);
  assert.equal((bundle.match(/G-YLVSKGE4LT/g) || []).length, 10);
});

test("ads.js fires both Ads conversion events with exact GA4 names", () => {
  // Since PR #5 (d576928) ads.js dispatches through a variable: the
  // click handler assigns gaEvent to the exact GA4 event name and
  // sendTo to the matching Ads conversion label, then fires
  // gtag('event', gaEvent, ...) plus a 'conversion' event whose
  // event_callback performs the held navigation. Assert that whole
  // mechanism - the exact names, the labels, the dispatch - rather
  // than the pre-PR#5 literal gtag('event', '<name>') call shape.
  assert.match(ads, /gaEvent = 'aiva_signup_click'/);
  assert.match(ads, /gaEvent = 'donate_click'/);
  assert.match(ads, /gtag\('event', gaEvent,/);
  assert.match(ads, /sendTo = 'AW-18515418870\/gV58CKnooq8dEPa96_xE'/);
  assert.match(ads, /sendTo = 'AW-18515418870\/bKn5CKzooq8dEPa96_xE'/);
  assert.match(ads, /gtag\('event', 'conversion', \{/);
  assert.match(ads, /event_callback: navigate/);
  assert.match(ads, /aivaclaims\.com' && url\.pathname\.startsWith\('\/sign-up'\)/);
  assert.match(ads, /url\.pathname === '\/donate'/);
});

test("the CTAs the events describe exist in the bundle", () => {
  assert.ok(bundle.includes("aivaclaims.com/sign-up"), "AIVA sign-up CTA missing");
  assert.ok(bundle.includes("www.every.org/esbe-incorporated"), "Every.org donate CTA missing");
});

test("ads.js is loaded on every page template", () => {
  // One <script src="/ads.js"> per page template; the bundle ships
  // five templates (/, /donate, /community, /privacy, /terms) and the
  // three content pages are among them.
  assert.equal((bundle.match(/src="\/ads\.js"/g) || []).length, 5);
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
