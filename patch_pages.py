#!/usr/bin/env python3
"""Apply the Google for Nonprofits activation fix to index.js.

Why: on 2026-11-23 Google for Nonprofits Support said ESBE
Incorporated's Workspace activation could not be processed because
Google could not confirm the organization owns/operates
esbeincorporated.org: the site did not explicitly display the physical
street address / organization details submitted at registration, and it
read as a single-page site without the standard sub-pages needed to
verify operations.

What this patch does (all content from verified records only):
  * PAGES (markdown layer): home gains a Registered address fact, a
    mailing-address paragraph, About/Contact related links, and a
    2026-11-23 lastUpdated; new /about, /programs, /contact entries.
  * HTML: every page's primary nav gains About / Programs / Contact
    (Programs and Contact now point at the new pages); every footer
    gains a Registered address line; every transparency <dl> gains a
    Registered address row; the home contact section gains the address;
    the home NGO JSON-LD gains a PostalAddress.
  * New HTML routes /about, /programs, /contact, built from the live
    /community route's shell (head/header/footer extracted at patch
    time, so the new pages match the deployed design byte-for-byte
    outside their own content).

The address — 1070 Bridgeview Way, Apt 1010, San Francisco, CA 94158 —
is the physical address on ESBE Incorporated's SAM.gov registration
(UEI KHWFAQ25EZX3), confirmed in DLA's CAGE review correspondence of
2026-11-04. No EIN/SSN/credential is added anywhere (the EIN already
printed by the site's pre-existing disclosure text is untouched).

Run from the repo root:  python3 patch_pages.py
Assertion-guarded: every replacement checks its expected count, and
the script refuses to run twice. After patching, run
`node mcp/build-content.mjs` and `node --test tests/`.
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).parent
BUNDLE_PATH = ROOT / "index.js"
ADDRESS = "1070 Bridgeview Way, Apt 1010, San Francisco, CA 94158"

src = BUNDLE_PATH.read_text()
if 'path: "/about",' in src or 'app.get(\n  "/about",' in src:
    sys.exit("patch_pages: already applied — refusing to run twice")


def must_replace(text, old, new, count, label):
    found = text.count(old)
    assert found == count, f"{label}: anchor count {found} != {count} for {old[:80]!r}"
    return text.replace(old, new)


# ---------------------------------------------------------------- PAGES: home
home_start = src.index('    path: "/",')
home_end = src.index('    path: "/donate",')
home = src[home_start:home_end]
home = must_replace(
    home,
    '["Federal status", "501(c)(3) nonprofit organization"],',
    '["Federal status", "501(c)(3) nonprofit organization"],\n'
    f'          ["Registered address", "{ADDRESS}"],',
    1,
    "PAGES home facts",
)
home = must_replace(
    home,
    r'"Email: help@esbeincorporated.org \xB7 Phone: (802) 715-3723",',
    r'"Email: help@esbeincorporated.org \xB7 Phone: (802) 715-3723",' + "\n"
    f'          "Mailing and registered address: ESBE Incorporated, {ADDRESS}.",',
    1,
    "PAGES home contact",
)
home = must_replace(home, 'lastUpdated: "2026-11-22"', 'lastUpdated: "2026-11-23"', 1, "PAGES home lastUpdated")
_aiva = r'L("AIVA Claims \u2014 create your free account", "https://aivaclaims.com/sign-up?utm_source=esbeincorporated.org&utm_medium=nonprofit_site&utm_campaign=programs_cta")'
home = must_replace(
    home,
    _aiva,
    'L("About ESBE Incorporated", "https://esbeincorporated.org/about"),\n'
    '      L("Contact ESBE Incorporated", "https://esbeincorporated.org/contact"),\n'
    f"      {_aiva}",
    1,
    "PAGES home related",
)
src = src[:home_start] + home + src[home_end:]

# ------------------------------------------------------- PAGES: append entries
NEW_ENTRIES = r"""  {
    path: "/about",
    mdPath: "/about.md",
    title: "About | ESBE Incorporated",
    h1: "A San Francisco nonprofit built around clarity",
    description:
      "About ESBE Incorporated, a 501(c)(3) nonprofit organization based in San Francisco, California: who we are, what we do, and the organization details behind esbeincorporated.org.",
    aiSummary:
      "About ESBE Incorporated, a 501(c)(3) nonprofit organization based in San Francisco, California: who we are, what we do, and the organization details behind esbeincorporated.org.",
    lastUpdated: "2026-11-23",
    sections: [
      {
        heading: "Who we are",
        paragraphs: [
          "ESBE Incorporated is a 501(c)(3) nonprofit organization based in San Francisco, California. It builds practical tools and clear information for veterans and people navigating government-facing services.",
          "The organization was founded by Barklee Sanders, who leads it as chief executive. ESBE Incorporated is independent and does not speak for or act on behalf of any government agency."
        ]
      },
      {
        heading: "Organization details",
        facts: [
          ["Organization", "ESBE Incorporated"],
          ["Federal status", "501(c)(3) nonprofit organization"],
          ["Federal tax exemption effective", "May 1, 2026"],
          ["California corporation number", "C4752548"],
          ["Registered address", "1070 Bridgeview Way, Apt 1010, San Francisco, CA 94158"],
          ["Chief executive", "Barklee Sanders"],
          ["Government relationship", "Independent nonprofit; not a government agency."]
        ],
        links: [
          L("Read the IRS determination letter", DETERMINATION_LETTER),
          L("Search the IRS Tax Exempt Organization Search", "https://apps.irs.gov/app/eos/")
        ]
      },
      {
        heading: "What we do",
        paragraphs: [
          "Our work has two parts: AIVA Claims, free donor-funded help that helps veterans prepare VA disability claims they file themselves; and public-interest services \u2014 accessible technology and plain-language information that help people understand and use government-facing services."
        ],
        links: [
          L("Programs and services", "https://esbeincorporated.org/programs"),
          L("How to file a VA disability claim \u2014 a step-by-step guide", "https://esbeincorporated.org/va-claim-guide"),
          L("Community \u2014 Treasure Island community work", "https://esbeincorporated.org/community")
        ]
      },
      {
        heading: "Transparency",
        paragraphs: [
          "ESBE Incorporated publishes its organization details, its IRS determination letter, and its program relationships on this site so anyone can verify who operates esbeincorporated.org and aivaclaims.com.",
          DISCLOSURE
        ],
        links: [
          L("Request governance or filing information", "mailto:help@esbeincorporated.org?subject=ESBE%20Incorporated%20transparency%20request")
        ]
      }
    ],
    related: [
      L("Programs and services", "https://esbeincorporated.org/programs"),
      L("Contact ESBE Incorporated", "https://esbeincorporated.org/contact"),
      L("Donate to ESBE Incorporated", "https://esbeincorporated.org/donate")
    ]
  },
  {
    path: "/programs",
    mdPath: "/programs.md",
    title: "Programs & Services | ESBE Incorporated",
    h1: "Programs that help people move forward",
    description:
      "ESBE Incorporated's programs and services: AIVA Claims, free donor-funded help preparing VA disability claims; public-interest services; and independent civic projects.",
    aiSummary:
      "ESBE Incorporated's programs and services: AIVA Claims, free donor-funded help preparing VA disability claims; public-interest services; and independent civic projects.",
    lastUpdated: "2026-11-23",
    sections: [
      {
        heading: "AIVA Claims (veteran support)",
        paragraphs: [
          "AIVA Claims is ESBE Incorporated's veteran support program. It helps veterans understand and prepare VA disability claims at no cost to them; the work is funded by donations.",
          "AIVA Claims helps a veteran organize records, understand the claims process, and prepare claim materials. Veterans review, edit, and file everything themselves with the U.S. Department of Veterans Affairs \u2014 AIVA Claims does not file claims with the VA, and ESBE Incorporated is not affiliated with the VA."
        ],
        bullets: [
          "Create your free account",
          "Upload your records",
          "Review your draft claim package",
          "File it yourself with the VA"
        ],
        links: [
          L("AIVA Claims \u2014 create your free account", "https://aivaclaims.com/sign-up?utm_source=esbeincorporated.org&utm_medium=nonprofit_site&utm_campaign=programs_cta"),
          L("How to file a VA disability claim \u2014 a step-by-step guide", "https://esbeincorporated.org/va-claim-guide"),
          L("Nexus letters \u2014 what they are and when a claim needs one", "https://esbeincorporated.org/nexus-letter")
        ]
      },
      {
        heading: "Public-interest services",
        paragraphs: [
          "Accessible technology and plain-language information that help people understand and use government-facing services.",
          "This work includes the public guides published on this site and the civic projects below."
        ]
      },
      {
        heading: "Selected civic projects",
        paragraphs: [
          "These independent public projects make government-facing information and reporting paths more understandable. They do not represent or act for a government agency."
        ],
        links: [
          L("Hospital Ledger", "https://hospitalledger.com"),
          L("San Francisco Permit Navigator", "https://sf-permit-navigator.barkleesanders.workers.dev/"),
          L("ImproveBayArea", "https://improvebayarea.com"),
          L("National Park Service Report", "https://improvebayarea.com/nps-report"),
          L("San Francisco Income Verify", "https://sf-income-verify.barkleesanders.workers.dev/"),
          L("Treasure Island Power", "https://treasureislandsfpoweroutages.com")
        ]
      },
      {
        heading: "Community work",
        paragraphs: [
          "ESBE Incorporated supports public documentation and accountability work for Treasure Island residents, including the Treasure Island Power outage tracker."
        ],
        links: [
          L("Community \u2014 Treasure Island community work", "https://esbeincorporated.org/community")
        ]
      },
      {
        heading: "Transparency",
        facts: [
          ["Organization", "ESBE Incorporated"],
          ["Federal status", "501(c)(3) nonprofit organization"],
          ["Registered address", "1070 Bridgeview Way, Apt 1010, San Francisco, CA 94158"],
          ["Program relationship", "AIVA Claims is a program of ESBE Incorporated."]
        ],
        links: [
          L("Read the IRS determination letter", DETERMINATION_LETTER)
        ]
      }
    ],
    related: [
      L("About ESBE Incorporated", "https://esbeincorporated.org/about"),
      L("Contact ESBE Incorporated", "https://esbeincorporated.org/contact"),
      L("Donate to ESBE Incorporated", "https://esbeincorporated.org/donate")
    ]
  },
  {
    path: "/contact",
    mdPath: "/contact.md",
    title: "Contact | ESBE Incorporated",
    h1: "Contact ESBE Incorporated",
    description:
      "Contact ESBE Incorporated: email, phone, and the registered mailing address for public inquiries, governance requests, and nonprofit correspondence.",
    aiSummary:
      "Contact ESBE Incorporated: email, phone, and the registered mailing address for public inquiries, governance requests, and nonprofit correspondence.",
    lastUpdated: "2026-11-23",
    sections: [
      {
        heading: "How to reach us",
        paragraphs: [
          "For public inquiries, governance requests, and nonprofit correspondence, reach us by email or phone.",
          "Email: help@esbeincorporated.org \xB7 Phone: (802) 715-3723",
          "Mailing and registered address: ESBE Incorporated, 1070 Bridgeview Way, Apt 1010, San Francisco, CA 94158."
        ],
        links: [
          L("Email ESBE Incorporated", "mailto:help@esbeincorporated.org"),
          L("Request governance or filing information", "mailto:help@esbeincorporated.org?subject=ESBE%20Incorporated%20transparency%20request")
        ]
      },
      {
        heading: "AIVA Claims support",
        paragraphs: [
          "AIVA Claims is a program of ESBE Incorporated. For help with an AIVA Claims account or with a claim you are preparing, start at AIVA Claims."
        ],
        links: [
          L("AIVA Claims", "https://aivaclaims.com"),
          L("AIVA Claims \u2014 create your free account", "https://aivaclaims.com/sign-up?utm_source=esbeincorporated.org&utm_medium=nonprofit_site&utm_campaign=programs_cta")
        ]
      },
      {
        heading: "Organization details",
        facts: [
          ["Organization", "ESBE Incorporated"],
          ["Federal status", "501(c)(3) nonprofit organization"],
          ["Registered address", "1070 Bridgeview Way, Apt 1010, San Francisco, CA 94158"]
        ],
        links: [
          L("Read the IRS determination letter", DETERMINATION_LETTER)
        ]
      }
    ],
    related: [
      L("About ESBE Incorporated", "https://esbeincorporated.org/about"),
      L("Programs and services", "https://esbeincorporated.org/programs"),
      L("Donate to ESBE Incorporated", "https://esbeincorporated.org/donate")
    ]
  }"""

esc_at = src.index("var esc")
arr_close = src.rindex("];", 0, esc_at)
tail = src[:arr_close].rstrip()
assert tail.endswith("  }"), f"unexpected PAGES tail: {tail[-60:]!r}"
src = tail + ",\n" + NEW_ENTRIES + "\n" + src[arr_close:]

# ------------------------------------------------------------------- HTML: nav
NAV_HOME_OLD = '        <a href="#mission">Mission</a><a href="#programs">Programs</a><a href="/community">Community</a><a href="/donate">Donate</a><a href="#transparency">Transparency</a><a href="#contact">Contact</a>'
NAV_HOME_NEW = '        <a href="#mission">Mission</a><a href="/about">About</a><a href="/programs">Programs</a><a href="/community">Community</a><a href="/donate">Donate</a><a href="#transparency">Transparency</a><a href="/contact">Contact</a>'
NAV_DONATE_OLD = '        <a href="/#mission">Mission</a><a href="/#programs">Programs</a><a href="/donate" aria-current="page">Donate</a><a href="/#transparency">Transparency</a><a href="/#contact">Contact</a>'
NAV_DONATE_NEW = '        <a href="/#mission">Mission</a><a href="/about">About</a><a href="/programs">Programs</a><a href="/community">Community</a><a href="/donate" aria-current="page">Donate</a><a href="/#transparency">Transparency</a><a href="/contact">Contact</a>'
NAV_STD_OLD = '        <a href="/#mission">Mission</a><a href="/#programs">Programs</a><a href="/community">Community</a><a href="/donate">Donate</a><a href="/#transparency">Transparency</a><a href="/#contact">Contact</a>'
NAV_STD_NEW = '        <a href="/#mission">Mission</a><a href="/about">About</a><a href="/programs">Programs</a><a href="/community">Community</a><a href="/donate">Donate</a><a href="/#transparency">Transparency</a><a href="/contact">Contact</a>'
NAV_COMM_OLD = '        <a href="/#mission">Mission</a><a href="/#programs">Programs</a><a href="/community" aria-current="page">Community</a><a href="/donate">Donate</a><a href="/#transparency">Transparency</a><a href="/#contact">Contact</a>'
NAV_COMM_NEW = '        <a href="/#mission">Mission</a><a href="/about">About</a><a href="/programs">Programs</a><a href="/community" aria-current="page">Community</a><a href="/donate">Donate</a><a href="/#transparency">Transparency</a><a href="/contact">Contact</a>'
src = must_replace(src, NAV_HOME_OLD, NAV_HOME_NEW, 1, "nav home")
src = must_replace(src, NAV_DONATE_OLD, NAV_DONATE_NEW, 1, "nav donate")
src = must_replace(src, NAV_STD_OLD, NAV_STD_NEW, 4, "nav standard")
src = must_replace(src, NAV_COMM_OLD, NAV_COMM_NEW, 1, "nav community")

# ------------------------------------------------- HTML: footer + facts + home
src = must_replace(
    src,
    "<p>${disclosure}</p>",
    f"<p>${{disclosure}}</p><p>Registered address: {ADDRESS}</p>",
    7,
    "footer address",
)
src = must_replace(
    src,
    "<div><dt>Federal status</dt><dd>501(c)(3) nonprofit organization</dd></div>",
    "<div><dt>Federal status</dt><dd>501(c)(3) nonprofit organization</dd></div>"
    f"<div><dt>Registered address</dt><dd>{ADDRESS}</dd></div>",
    5,
    "transparency dl address",
)
src = must_replace(
    src,
    r'<div class="contact-details"><a class="contact-email" href="mailto:help@esbeincorporated.org">help@esbeincorporated.org <span aria-hidden="true">\u2197</span></a><a class="contact-phone" href="tel:+18027153723">(802) 715-3723</a></div>',
    r'<div class="contact-details"><a class="contact-email" href="mailto:help@esbeincorporated.org">help@esbeincorporated.org <span aria-hidden="true">\u2197</span></a><a class="contact-phone" href="tel:+18027153723">(802) 715-3723</a></div>'
    f'<p class="contact-address">Registered address: {ADDRESS}</p>',
    1,
    "home contact address",
)
src = must_replace(
    src,
    '"email":"help@esbeincorporated.org","contactPoint"',
    '"email":"help@esbeincorporated.org","address":{"@type":"PostalAddress","streetAddress":"1070 Bridgeview Way, Apt 1010","addressLocality":"San Francisco","addressRegion":"CA","postalCode":"94158","addressCountry":"US"},"contactPoint"',
    1,
    "home JSON-LD address",
)

# ------------------------------------------------------- new HTML routes
# Extract the live /community route's shell (head / header / closing) from the
# already-patched bundle so the new pages inherit the deployed design exactly.
_comm = re.search(r'app\.get\(\s*"/community",', src)
assert _comm, "community route not found"
_cstart = _comm.start()
_cend = src.index("\napp.get(", _cstart + 10)
_croute = src[_cstart:_cend]
_head = _croute[_croute.index("c.html("): _croute.index("</head>") + len("</head>")]
_header = _croute[_croute.index('<a class="skip-link"'): _croute.index("</header>") + len("</header>")]
_closing = _croute[_croute.index("</main>"):]

# Extract the home route's program grid (+ civic projects block) verbatim for
# reuse on /about and /programs.
_home_m = re.search(r'app\.get\(\s*"/",', src)
assert _home_m, "home route not found"
_hstart = _home_m.start()
_hend = src.index("\napp.get(", _hstart + 10)
_hroute = src[_hstart:_hend]
_g0 = _hroute.index('<div class="program-grid">')
_civ0 = _hroute.index('<section class="civic-projects"', _g0)
GRID_BLOCK = _hroute[_g0:_civ0].rstrip()
_civ1 = _hroute.index("</section>", _civ0) + len("</section>")
CIVIC_BLOCK = _hroute[_civ0:_civ1]

COMM_TITLE = "Treasure Island Community Work | ESBE Incorporated"
COMM_DESC = "ESBE Incorporated's community work on Treasure Island: public documentation of power outages and plain-language paths to official reporting channels for residents."
COMM_OG_DESC = "Public documentation of Treasure Island power outages and clear paths to official reporting channels for residents."
NAV_ABOUT = NAV_STD_NEW.replace('<a href="/about">About</a>', '<a href="/about" aria-current="page">About</a>')
NAV_PROGRAMS = NAV_STD_NEW.replace('<a href="/programs">Programs</a>', '<a href="/programs" aria-current="page">Programs</a>')
NAV_CONTACT = NAV_STD_NEW.replace('<a href="/contact">Contact</a>', '<a href="/contact" aria-current="page">Contact</a>')


def build_route(path, title, desc, crumb, nav_body, body):
    head = _head
    head = must_replace(head, COMM_TITLE, title, 3, f"{path} head title")
    head = must_replace(head, COMM_DESC, desc, 2, f"{path} head desc")
    head = must_replace(head, COMM_OG_DESC, desc, 2, f"{path} head og desc")
    head = must_replace(head, "https://esbeincorporated.org/community.md", f"https://esbeincorporated.org{path}.md", 1, f"{path} head md")
    head = must_replace(head, 'https://esbeincorporated.org/community"', f'https://esbeincorporated.org{path}"', 3, f"{path} head url")
    head = must_replace(head, '"name":"Community"', f'"name":"{crumb}"', 1, f"{path} head crumb")
    header = must_replace(_header, NAV_COMM_NEW, nav_body, 1, f"{path} header nav")
    breadcrumb = (
        '<nav aria-label="Breadcrumb" class="breadcrumb"><ol><li><a href="/">Home</a></li>'
        f'<li aria-current="page">{crumb}</li></ol></nav>'
    )
    return (
        f'app.get(\n  "{path}",\n  (c) => '
        + head
        + "\n  <body>\n    "
        + header
        + '\n    <main id="main">\n      '
        + breadcrumb
        + "\n      "
        + body
        + "\n    "
        + _closing
    )


def facts_dl(rows):
    return '<dl class="facts">' + "".join(f"<div><dt>{k}</dt><dd>{v}</dd></div>" for k, v in rows) + "</dl>"


DET_LINK = r'<a href="${determinationLetter}">Read the IRS determination letter <span aria-hidden="true">\u2197</span></a>'
TEOS_LINK = r'<a href="https://apps.irs.gov/app/eos/">Search the IRS Tax Exempt Organization Search <span aria-hidden="true">\u2197</span></a>'

ABOUT_BODY = (
    r'''<section class="hero" aria-labelledby="about-title">
        <p class="eyebrow">ABOUT \u2022 SAN FRANCISCO \u2022 NONPROFIT</p>
        <div class="hero-grid">
          <h1 id="about-title">A San Francisco nonprofit built around clarity.</h1>
          <div class="hero-copy">
            <p>ESBE Incorporated is a 501(c)(3) nonprofit organization based in San Francisco, California. It builds practical tools and clear information for veterans and people navigating government-facing services.</p>
            <div class="hero-actions"><a class="button primary" href="/programs">See our programs <span aria-hidden="true">\u2197</span></a><a class="text-link" href="#details">Organization details <span aria-hidden="true">\u2193</span></a></div>
          </div>
        </div>
        <div class="hero-rule" aria-hidden="true"></div>
        <p class="hero-note">ESBE Incorporated is an independent nonprofit. It is not a government agency and does not speak for the U.S. Department of Veterans Affairs.</p>
      </section>
      <section class="statement" id="who" aria-labelledby="who-title">
        <div><p class="section-mark">01</p><a class="permalink" href="#who" aria-label="Copy link to who we are">#</a></div>
        <div><p class="eyebrow">WHO WE ARE</p><h2 id="who-title">Founded to make hard processes understandable.</h2></div>
        <p class="body-large">The organization was founded by Barklee Sanders, who leads it as chief executive. Its work starts from a simple observation: people lose time, money, and benefits when government-facing processes are hard to understand \u2014 so it builds the tools and explanations that make those processes clear.</p>
      </section>
      <section class="transparency" id="details" aria-labelledby="details-title">
        <div class="section-heading"><div><p class="section-mark">02</p></div><div><p class="eyebrow">ORGANIZATION DETAILS</p><h2 id="details-title">The details behind this site.</h2></div></div>
        '''
    + facts_dl([
        ("Organization", "ESBE Incorporated"),
        ("Federal status", "501(c)(3) nonprofit organization"),
        ("Federal tax exemption effective", "May 1, 2026"),
        ("California corporation number", "C4752548"),
        ("Registered address", ADDRESS),
        ("Chief executive", "Barklee Sanders"),
        ("Government relationship", "Independent nonprofit; not a government agency."),
    ])
    + f'''
        <div class="transparency-links">{DET_LINK}{TEOS_LINK}</div>
      </section>
      <section class="programs" id="what" aria-labelledby="what-title">
        <div class="section-heading"><div><p class="section-mark">03</p><a class="permalink" href="#what" aria-label="Copy link to what we do">#</a></div><div><p class="eyebrow">WHAT WE DO</p><h2 id="what-title">Two kinds of work.</h2></div></div>
        '''
    + GRID_BLOCK
    + "\n      </section>"
)

PROGRAMS_BODY = (
    r'''<section class="hero" aria-labelledby="programs-title">
        <p class="eyebrow">PROGRAMS \u2022 VETERAN SUPPORT \u2022 CIVIC ACCESS</p>
        <div class="hero-grid">
          <h1 id="programs-title">Programs that help people move forward.</h1>
          <div class="hero-copy">
            <p>ESBE Incorporated runs AIVA Claims, free donor-funded help that helps veterans prepare VA disability claims they file themselves, and public-interest services that make government-facing systems easier to understand.</p>
            <div class="hero-actions"><a class="button primary" data-carry-params href="https://aivaclaims.com/sign-up?utm_source=esbeincorporated.org&amp;utm_medium=nonprofit_site&amp;utm_campaign=programs_cta">Create your free AIVA Claims account <span aria-hidden="true">\u2197</span></a><a class="text-link" href="#aiva-claims">How AIVA Claims works <span aria-hidden="true">\u2193</span></a></div>
          </div>
        </div>
        <div class="hero-rule" aria-hidden="true"></div>
        <p class="hero-note">AIVA Claims does not file claims with the VA. Veterans review, edit, and file everything themselves with the U.S. Department of Veterans Affairs.</p>
      </section>
      <section class="programs" id="programs-list" aria-labelledby="programs-list-title">
        <div class="section-heading"><div><p class="section-mark">01</p><a class="permalink" href="#programs-list" aria-label="Copy link to programs and services">#</a></div><div><p class="eyebrow">PROGRAMS AND SERVICES</p><h2 id="programs-list-title">What ESBE Incorporated runs.</h2></div></div>
        '''
    + GRID_BLOCK
    + "\n        "
    + CIVIC_BLOCK
    + r'''
      </section>
      <section class="statement" id="community-work" aria-labelledby="community-work-title">
        <div><p class="section-mark">02</p><a class="permalink" href="#community-work" aria-label="Copy link to community work">#</a></div>
        <div><p class="eyebrow">COMMUNITY WORK</p><h2 id="community-work-title">Accountability work for Treasure Island residents.</h2></div>
        <p class="body-large">ESBE Incorporated supports public documentation and accountability work for Treasure Island residents, including the <a href="https://treasureislandsfpoweroutages.com">Treasure Island Power</a> outage tracker. Read more about our <a href="/community">community work</a>.</p>
      </section>
      <section class="transparency" aria-labelledby="programs-transparency-title">
        <div class="section-heading"><div><p class="section-mark">03</p></div><div><p class="eyebrow">TRANSPARENCY</p><h2 id="programs-transparency-title">Clear identity. Clear accountability.</h2></div></div>
        '''
    + facts_dl([
        ("Organization", "ESBE Incorporated"),
        ("Federal status", "501(c)(3) nonprofit organization"),
        ("Registered address", ADDRESS),
        ("Program relationship", "AIVA Claims is a program of ESBE Incorporated."),
    ])
    + f'''
        <div class="transparency-links">{DET_LINK}</div>
      </section>'''
)

CONTACT_BODY = (
    r'''<section class="hero" aria-labelledby="contact-title">
        <p class="eyebrow">CONTACT \u2022 PUBLIC INQUIRIES \u2022 GOVERNANCE</p>
        <div class="hero-grid">
          <h1 id="contact-title">Contact ESBE Incorporated.</h1>
          <div class="hero-copy">
            <p>For public inquiries, governance requests, and nonprofit correspondence, reach ESBE Incorporated by email, phone, or mail at the registered address below.</p>
            <div class="hero-actions"><a class="button primary" href="mailto:help@esbeincorporated.org">Email ESBE Incorporated <span aria-hidden="true">\u2197</span></a><a class="text-link" href="#details">Organization details <span aria-hidden="true">\u2193</span></a></div>
          </div>
        </div>
        <div class="hero-rule" aria-hidden="true"></div>
        <p class="hero-note">For help with an AIVA Claims account, start at aivaclaims.com \u2014 AIVA Claims is a program of ESBE Incorporated.</p>
      </section>
      <section class="contact" id="reach" aria-labelledby="reach-title">
        <div><p class="section-mark">01</p><a class="permalink" href="#reach" aria-label="Copy link to how to reach us">#</a></div>
        <div><p class="eyebrow">HOW TO REACH US</p><h2 id="reach-title">Email, phone, or mail.</h2><p class="contact-copy">For public inquiries, governance requests, and nonprofit correspondence, reach us by email or phone.</p><div class="contact-details"><a class="contact-email" href="mailto:help@esbeincorporated.org">help@esbeincorporated.org <span aria-hidden="true">\u2197</span></a><a class="contact-phone" href="tel:+18027153723">(802) 715-3723</a></div>'''
    + f'<p class="contact-address">Mailing and registered address: ESBE Incorporated, {ADDRESS}</p>'
    + r'''</div>
      </section>
      <section class="transparency" id="details" aria-labelledby="contact-details-title">
        <div class="section-heading"><div><p class="section-mark">02</p></div><div><p class="eyebrow">ORGANIZATION DETAILS</p><h2 id="contact-details-title">Who operates this site.</h2></div></div>
        '''
    + facts_dl([
        ("Organization", "ESBE Incorporated"),
        ("Federal status", "501(c)(3) nonprofit organization"),
        ("Registered address", ADDRESS),
    ])
    + f'''
        <div class="transparency-links">{DET_LINK}<a href="mailto:help@esbeincorporated.org?subject=ESBE%20Incorporated%20transparency%20request">Request governance or filing information <span aria-hidden="true">\\u2197</span></a></div>
      </section>'''
)

routes = [
    build_route(
        "/about",
        "About | ESBE Incorporated",
        "About ESBE Incorporated, a 501(c)(3) nonprofit organization based in San Francisco, California: who we are, what we do, and the organization details behind esbeincorporated.org.",
        "About",
        NAV_ABOUT,
        ABOUT_BODY,
    ),
    build_route(
        "/programs",
        "Programs & Services | ESBE Incorporated",
        "ESBE Incorporated's programs and services: AIVA Claims, free donor-funded help preparing VA disability claims; public-interest services; and independent civic projects.",
        "Programs",
        NAV_PROGRAMS,
        PROGRAMS_BODY,
    ),
    build_route(
        "/contact",
        "Contact | ESBE Incorporated",
        "Contact ESBE Incorporated: email, phone, and the registered mailing address for public inquiries, governance requests, and nonprofit correspondence.",
        "Contact",
        NAV_CONTACT,
        CONTACT_BODY,
    ),
]

og_anchor = 'app.get("/og.png", (c) => c.body(OG_PNG_BYTES'
assert src.count(og_anchor) == 1, "og.png route anchor drifted"
src = src.replace(og_anchor, "\n\n".join(routes) + "\n\n" + og_anchor)

BUNDLE_PATH.write_text(src)
print(f"patch_pages: index.js updated ({len(src)} bytes)")
print("counts after patch:")
for needle in ["G-YLVSKGE4LT", "googletagmanager.com/gtag/js", 'src="/ads.js"', 'name="ai-summary"', 'rel="alternate" type="text/markdown"', "1070 Bridgeview Way"]:
    print(f"  {needle}: {src.count(needle)}")
