#!/usr/bin/env python3
"""Apply the /donate change to the recovered live bundle (index.js).

Deterministic, assertion-guarded string surgery on the exact bundle bytes
that production runs (recovered via the Cloudflare API on 2026-10-15):
  1. Homepage nav gains a Donate link to /donate.
  2. A new GET /donate route is inserted before the /security.txt route.
     The page reuses the site's existing CSS classes and hands giving off
     to ESBE's Every.org page. Facts: 501(c)(3), EIN 87-1218291, CA Charity
     Registration CT0403243 (issued 2026-10-02).

Run: python3 patch_donate.py index.js > index.patched.js  (or in place with -i)
"""
import sys

NAV_OLD = '<a href="#mission">Mission</a><a href="#programs">Programs</a><a href="#transparency">Transparency</a><a href="#contact">Contact</a>'
NAV_NEW = '<a href="#mission">Mission</a><a href="#programs">Programs</a><a href="/donate">Donate</a><a href="#transparency">Transparency</a><a href="#contact">Contact</a>'

DONATE_ROUTE = r'''app.get(
  "/donate",
  (c) => c.html(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="Donate to ESBE Incorporated, a 501(c)(3) nonprofit. Your gift funds free VA claims help for veterans through AIVA Claims." />
    <meta name="theme-color" content="#12352d" />
    <link rel="canonical" href="https://esbeincorporated.org/donate" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="ESBE Incorporated" />
    <meta property="og:title" content="Donate | ESBE Incorporated" />
    <meta property="og:description" content="Your gift funds free VA disability claims help for veterans. Donor-funded 501(c)(3) nonprofit." />
    <meta property="og:url" content="https://esbeincorporated.org/donate" />
    <meta property="og:image" content="https://esbeincorporated.org/og.svg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Donate | ESBE Incorporated" />
    <meta name="twitter:description" content="Your gift funds free VA disability claims help for veterans." />
    <meta name="twitter:image" content="https://esbeincorporated.org/og.svg" />
    <link rel="stylesheet" href="/styles.css" />
    <title>Donate | ESBE Incorporated</title>
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"NGO","name":"ESBE Incorporated","url":"https://esbeincorporated.org/","taxID":"87-1218291","email":"help@esbeincorporated.org","sameAs":["${determinationLetter}"]}<\/script>
  </head>
  <body>
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header">
      <a class="wordmark" href="/" aria-label="ESBE Incorporated home">ESBE <span>INC.</span></a>
      <nav aria-label="Primary navigation">
        <a href="/#mission">Mission</a><a href="/#programs">Programs</a><a href="/donate" aria-current="page">Donate</a><a href="/#transparency">Transparency</a><a href="/#contact">Contact</a>
      </nav>
      <a class="header-cta" data-carry-params href="https://aivaclaims.com/sign-up?utm_source=esbeincorporated.org&amp;utm_medium=nonprofit_site&amp;utm_campaign=header_cta">Visit AIVA Claims <span aria-hidden="true">↗</span></a>
    </header>
    <main id="main">
      <section class="hero" aria-labelledby="donate-title">
        <p class="eyebrow">501(C)(3) NONPROFIT • DONOR-FUNDED</p>
        <div class="hero-grid">
          <h1 id="donate-title">Free help for veterans, funded by people who give.</h1>
          <div class="hero-copy">
            <p>AIVA Claims — ESBE's veteran support program — helps veterans understand and prepare VA disability claims at no cost to them. Donations pay for that work: the tools, the technology, and the time, so veterans never have to.</p>
            <div class="hero-actions"><a class="button primary" href="https://www.every.org/esbe-incorporated?frequency=once#/donate/pay" rel="noreferrer">Donate now <span aria-hidden="true">↗</span></a><a class="text-link" href="https://www.every.org/esbe-incorporated?frequency=monthly#/donate/pay" rel="noreferrer">Give monthly <span aria-hidden="true">→</span></a></div>
          </div>
        </div>
        <div class="hero-rule" aria-hidden="true"></div>
        <p class="hero-note">Giving is processed securely by Every.org. ESBE Incorporated is an independent nonprofit and is not affiliated with the U.S. Department of Veterans Affairs.</p>
      </section>

      <section class="programs" id="gift" aria-labelledby="gift-title">
        <div class="section-heading"><div><p class="section-mark">01</p><a class="permalink" href="#gift" aria-label="Copy link to what your gift does">#</a></div><div><p class="eyebrow">SUPPORT THE MISSION</p><h2 id="gift-title">What your gift does.</h2></div></div>
        <div class="program-grid">
          <article class="program-card featured-program">
            <div class="program-top"><p class="program-kicker">DONOR-FUNDED</p><span>01</span></div>
            <div class="featured-body">
              <div>
                <h3>AIVA Claims</h3>
                <p>Free, donor-funded help preparing VA disability claims. Veterans review, edit, and file everything themselves — your gift keeps it that way.</p>
                <div class="program-actions"><a class="button light" href="https://www.every.org/esbe-incorporated?frequency=once#/donate/pay" rel="noreferrer">Donate <span aria-hidden="true">→</span></a><a class="button light" href="https://www.every.org/esbe-incorporated?frequency=monthly#/donate/pay" rel="noreferrer">Give monthly <span aria-hidden="true">→</span></a></div>
              </div>
              <ol class="program-steps"><li>Give once or monthly through Every.org</li><li>Your gift funds free help for veterans</li><li>ESBE reports its work publicly</li></ol>
            </div>
            <p class="program-assurance">No cost to veterans · 501(c)(3) nonprofit, EIN 87-1218291 · CA Charity Registration CT0403243 · Not affiliated with the U.S. Department of Veterans Affairs</p>
          </article>
        </div>
      </section>

      <section class="transparency" id="donate-transparency" aria-labelledby="donate-transparency-title">
        <div class="section-heading"><div><p class="section-mark">02</p><a class="permalink" href="#donate-transparency" aria-label="Copy link to transparency">#</a></div><div><p class="eyebrow">TRANSPARENCY</p><h2 id="donate-transparency-title">Give with the facts in front of you.</h2></div></div>
        <dl class="facts"><div><dt>Organization</dt><dd>ESBE Incorporated</dd></div><div><dt>Federal tax ID</dt><dd>87-1218291</dd></div><div><dt>Federal status</dt><dd>501(c)(3) nonprofit organization</dd></div><div><dt>CA charity registration</dt><dd>CT0403243</dd></div><div><dt>Giving processed by</dt><dd>Every.org</dd></div><div><dt>Program relationship</dt><dd>AIVA Claims is a program of ESBE Incorporated.</dd></div></dl>
        <div class="transparency-links"><a href="${determinationLetter}" rel="noreferrer">Read the IRS determination letter <span aria-hidden="true">↗</span></a><a href="https://apps.irs.gov/app/eos/" rel="noreferrer">Search the IRS Tax Exempt Organization Search <span aria-hidden="true">↗</span></a><a href="mailto:help@esbeincorporated.org?subject=ESBE%20Incorporated%20sponsorship%20or%20grant%20inquiry">Ask about sponsorships and grants <span aria-hidden="true">↗</span></a></div>
      </section>
    </main>
    <footer><div class="footer-brand">ESBE INCORPORATED</div><p>${disclosure}</p><div><span>© ${(new Date()).getFullYear()} ESBE Incorporated</span><a href="/">Back to home ↑</a></div></footer>
    <script type="module" src="/webmcp.js"><\/script>
    <script type="module" src="/ads.js"><\/script>
  </body>
</html>`)
);
'''

def main():
    path = sys.argv[1]
    inplace = len(sys.argv) > 2 and sys.argv[2] == "-i"
    src = open(path).read()
    assert src.count(NAV_OLD) == 1, f"nav anchor count = {src.count(NAV_OLD)}"
    assert 'app.get(\n  "/donate"' not in src, "donate route already present"
    out = src.replace(NAV_OLD, NAV_NEW)
    anchor = 'app.get("/security.txt"'
    assert out.count(anchor) == 1
    out = out.replace(anchor, DONATE_ROUTE + anchor)
    if inplace:
        open(path, "w").write(out)
    else:
        sys.stdout.write(out)

if __name__ == "__main__":
    main()
