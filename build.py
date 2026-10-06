#!/usr/bin/env python3
"""Build the new esbe-incorporated-site worker (index.js) from page content.

All copy uses ONLY verified facts. No [NEEDS CONFIRMATION] markers, no placeholders.
"""
import json, base64, re, sys

SITE = "https://esbeincorporated.org"
DETERMINATION_LETTER = "https://apps.irs.gov/pub/epostcard/dl/FinalLetter_87-1218291_ESBEINCORPORATED_05012026_v1.0.pdf"
DISCLOSURE = ("ESBE Incorporated is a 501(c)(3) nonprofit organization, EIN 87-1218291. "
    "AIVA Claims is a charitable program of ESBE Incorporated. ESBE Tech is a separate "
    "for-profit technology company. ESBE Incorporated is not affiliated with or endorsed "
    "by the U.S. Department of Veterans Affairs.")
LASTMOD = "2026-10-06"

NAV = [("About", "/about"), ("Programs", "/programs"), ("Transparency", "/transparency"),
       ("Support", "/support"), ("Contact", "/contact")]

def head(title, desc, path, extra_meta=""):
    nav_links = "".join(f'<a href="{href}">{label}</a>' for label, href in NAV)
    return f"""<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="{desc}" />
    <meta name="theme-color" content="#12352d" />
    <link rel="canonical" href="{SITE}{path}" />
    <link rel="icon" href="/favicon.ico" type="image/x-icon" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="ESBE Incorporated" />
    <meta property="og:title" content="{title}" />
    <meta property="og:description" content="{desc}" />
    <meta property="og:url" content="{SITE}{path}" />
    <meta property="og:image" content="{SITE}/og.svg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="{title}" />
    <meta name="twitter:description" content="{desc}" />
    <meta name="twitter:image" content="{SITE}/og.svg" />
    <link rel="stylesheet" href="/styles.css" />
    <title>{title}</title>
    <script type="application/ld+json">{{"@context":"https://schema.org","@type":"NGO","name":"ESBE Incorporated","url":"{SITE}/","taxID":"87-1218291","email":"help@esbeincorporated.org"}}</script>
{extra_meta}  </head>"""

def header():
    nav_links = "".join(f'<a href="{href}">{label}</a>' for label, href in NAV)
    return f"""<a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header">
      <a class="wordmark" href="/" aria-label="ESBE Incorporated home">ESBE <span>INC.</span></a>
      <nav aria-label="Primary navigation">
        {nav_links}
      </nav>
      <a class="header-cta" href="https://aivaclaims.com" rel="noreferrer">Visit AIVA Claims <span aria-hidden="true">\u2197</span></a>
    </header>"""

def footer():
    import datetime
    year = datetime.date.today().year
    foot_links = " \u00b7 ".join(f'<a href="{href}">{label}</a>' for label, href in [("Privacy","/privacy"),("Contact","/contact"),("Support","/support")])
    return f"""<footer><div class="footer-brand">ESBE INCORPORATED</div><p>{DISCLOSURE}</p><div><span>\u00a9 {year} ESBE Incorporated</span><span>{foot_links}</span></div></footer>
    <script type="module" src="/webmcp.js"></script>"""

def layout(title, desc, path, body):
    return ("<!doctype html>\n<html lang=\"en\">\n" + head(title, desc, path) +
            "\n  <body>\n    " + header() + "\n    <main id=\"main\">\n" + body +
            "\n    </main>\n    " + footer() + "\n  </body>\n</html>")

def page_hero(eyebrow, h1, intro):
    return f"""<section class="hero" aria-labelledby="hero-title">
        <p class="eyebrow">{eyebrow}</p>
        <div class="hero-grid">
          <h1 id="hero-title">{h1}</h1>
          <div class="hero-copy"><p>{intro}</p></div>
        </div>
        <div class="hero-rule" aria-hidden="true"></div>
      </section>"""

def statement(num, eyebrow, h2, paragraphs):
    ps = "".join(f"<p class=\"body-large\">{p}</p>" for p in paragraphs)
    return f"""<section class="statement" aria-labelledby="s{num}-title">
        <div><p class="section-mark">{num:02d}</p></div>
        <div><p class="eyebrow">{eyebrow}</p><h2 id="s{num}-title">{h2}</h2></div>
        <div>{ps}</div>
      </section>"""

# ---------------------------------------------------------------- pages

HOME_BODY = page_hero(
    "501(C)(3) NONPROFIT \u2022 VETERANS \u2022 PUBLIC INTEREST",
    "ESBE Incorporated helps veterans get the VA disability benefits they earned \u2014 for free.",
    "We are a 501(c)(3) nonprofit founded by a disabled veteran. Our flagship program, "
    "AIVA Claims, provides free one-on-one assistance to veterans working to understand and "
    "prepare VA disability claims. We also build free public tools that make government "
    "services easier for everyone to use."
) + """
      <section class="statement" aria-labelledby="what-title">
        <div><p class="section-mark">01</p></div>
        <div><p class="eyebrow">WHAT WE DO</p><h2 id="what-title">Two lines of work, one purpose.</h2></div>
        <div>
          <p class="body-large"><strong>For veterans:</strong> AIVA Claims offers free, personalized help preparing VA disability claims \u2014 understanding eligibility, gathering evidence, and navigating the VA process. No fees, no strings.</p>
          <p class="body-large"><strong>For the public:</strong> We build free tools like ImproveBayArea (Bay Area 311 reporting), Hospital Ledger (hospital price transparency), and the Treasure Island power outage tracker \u2014 practical resources that make public systems more understandable.</p>
          <p class="body-large"><strong>How we\u2019re funded:</strong> ESBE Incorporated is a donor-supported 501(c)(3) nonprofit (EIN 87-1218291). We are independent and do not speak for or act on behalf of any government agency.</p>
        </div>
      </section>
      <section class="statement" aria-labelledby="mission-title">
        <div><p class="section-mark">02</p></div>
        <div><p class="eyebrow">OUR MISSION</p><h2 id="mission-title">Our mission</h2></div>
        <div><p class="body-large">To ensure veterans can access the disability benefits they earned through free, expert claims assistance \u2014 and to strengthen public access to government services through clear information and accessible technology.</p></div>
      </section>
      <section class="programs" id="programs" aria-labelledby="programs-title">
        <div class="section-heading"><div><p class="section-mark">03</p></div><div><p class="eyebrow">PUBLIC-INTEREST WORK</p><h2 id="programs-title">Practical help for veterans and public service.</h2></div></div>
        <div class="program-grid">
          <article class="program-card">
            <div class="program-top"><p class="program-kicker">VETERAN SUPPORT</p><span>01</span></div>
            <div class="program-content"><div><h3>AIVA Claims</h3><p>Free assistance for veterans working to understand and prepare VA disability claims. <a href="/programs" style="color:inherit">Learn more about our programs \u2192</a></p></div><a class="button light" href="https://aivaclaims.com" rel="noreferrer">Visit AIVA Claims <span aria-hidden="true">\u2197</span></a></div>
          </article>
          <article class="program-card public-interest-card">
            <div class="program-top"><p class="program-kicker">CIVIC ACCESS</p><span>02</span></div>
            <div class="program-content"><div><h3>Public-interest services</h3><p>Accessible technology and plain-language information that help people understand and use government-facing services.</p></div></div>
          </article>
        </div>
        <section class="civic-projects" aria-labelledby="civic-projects-title">
          <div class="civic-projects-heading"><div><p class="program-kicker">SELECTED CIVIC PROJECTS</p><h3 id="civic-projects-title">Public tools for public systems.</h3></div><p>These independent public projects make government-facing information and reporting paths more understandable. They do not represent or act for a government agency.</p></div>
          <div class="civic-project-grid">
            <article class="civic-project"><p class="civic-project-meta">FEDERAL TRANSPARENCY \u00b7 LIVE</p><h4>Hospital Ledger</h4><p>A public-good resource for exploring hospital price files published under federal transparency requirements.</p><a href="https://hospitalledger.com" rel="noreferrer">Visit Hospital Ledger <span aria-hidden="true">\u2197</span></a></article>
            <article class="civic-project"><p class="civic-project-meta">SAN FRANCISCO PERMITS \u00b7 PROTOTYPE</p><h4>SF Permit Navigator</h4><p>A plain-language permit-path prototype that identifies where an official city system is required.</p><a href="https://sf-permit-detector.barkleesanders.workers.dev" rel="noreferrer">Visit SF Permit Navigator <span aria-hidden="true">\u2197</span></a></article>
            <article class="civic-project"><p class="civic-project-meta">BAY AREA 311 \u00b7 LIVE</p><h4>ImproveBayArea</h4><p>One public reporting form that routes Bay Area requests to the appropriate official 311 service.</p><a href="https://improvebayarea.com" rel="noreferrer">Visit ImproveBayArea <span aria-hidden="true">\u2197</span></a></article>
            <article class="civic-project"><p class="civic-project-meta">NATIONAL PARKS \u00b7 LIVE</p><h4>NPS Report</h4><p>A public tool for reporting maintenance and safety concerns through National Park Service contact paths.</p><a href="https://nps-report.barkleesanders.workers.dev" rel="noreferrer">Visit NPS Report <span aria-hidden="true">\u2197</span></a></article>
            <article class="civic-project"><p class="civic-project-meta">SF AFFORDABLE HOUSING \u00b7 PROTOTYPE</p><h4>SF Income Verify</h4><p>A privacy-first income-verification prototype for San Francisco affordable housing. Not affiliated with MOHCD.</p><a href="https://sf-income-verify.barkleesanders.workers.dev/#how-it-works" rel="noreferrer">Visit SF Income Verify <span aria-hidden="true">\u2197</span></a></article>
            <article class="civic-project"><p class="civic-project-meta">PUBLIC INFRASTRUCTURE \u00b7 LIVE</p><h4>Treasure Island Power</h4><p>A public outage tracker documenting Treasure Island power failures and related accountability work.</p><a href="https://www.treasureislandsfpoweroutages.com" rel="noreferrer">Visit Treasure Island Power <span aria-hidden="true">\u2197</span></a></article>
          </div>
        </section>
        <div class="project-row"><p>Independent infrastructure</p><a href="https://esbe.tech" rel="noreferrer"><span>ESBE Tech</span><span aria-hidden="true">\u2197</span></a><a href="https://barkleesanders.com" rel="noreferrer"><span>Projects by Barklee Sanders</span><span aria-hidden="true">\u2197</span></a></div>
      </section>
      <section class="transparency" aria-labelledby="transparency-title">
        <div class="section-heading"><div><p class="section-mark">04</p></div><div><p class="eyebrow">TRANSPARENCY</p><h2 id="transparency-title">Clear identity. Clear accountability.</h2></div></div>
        <dl class="facts"><div><dt>Organization</dt><dd>ESBE Incorporated</dd></div><div><dt>Federal tax ID</dt><dd>87-1218291</dd></div><div><dt>Federal status</dt><dd>501(c)(3) nonprofit organization</dd></div><div><dt>California charity registration</dt><dd>CT0403243</dd></div><div><dt>Public purpose</dt><dd>Veteran support and public-interest access to government-facing services.</dd></div><div><dt>Government relationship</dt><dd>Independent nonprofit; not a government agency.</dd></div></dl>
        <div class="transparency-links"><a href="/transparency">Read our transparency page \u2192</a></div>
      </section>
      <section class="contact" aria-labelledby="contact-title">
        <div><p class="section-mark">05</p></div>
        <div><p class="eyebrow">PUBLIC CONTACT</p><h2 id="contact-title">Contact ESBE Incorporated.</h2><p class="contact-copy">For public inquiries, governance requests, and nonprofit correspondence, reach us by email, phone, or mail.</p><div class="contact-details"><a class="contact-email" href="mailto:help@esbeincorporated.org">help@esbeincorporated.org <span aria-hidden="true">\u2197</span></a><a class="contact-phone" href="tel:+18027153723">(802) 715-3723</a><address>1070 Bridgeview Way #1010<br />San Francisco, CA 94158</address></div></div>
      </section>"""

ABOUT_BODY = page_hero(
    "ABOUT ESBE INCORPORATED",
    "A nonprofit built by a veteran who got tired of watching the system fail veterans.",
    "ESBE Incorporated is a 501(c)(3) nonprofit organization founded by Barklee Sanders, "
    "a disabled veteran who experienced firsthand how difficult the VA disability claims "
    "process can be \u2014 and decided to do something about it."
) + statement(1, "WHO WE ARE",
    "Filling the gap between veterans and the benefits they earned.",
    ["After navigating his own claims, Barklee saw a gap: veterans who need help understanding the VA system often can\u2019t afford professional assistance, and free resources are scattered, confusing, or incomplete. Some veterans pay claims agents a percentage of their back pay or monthly benefits \u2014 money that should stay with the veteran and their family. Others try to go it alone and miss deadlines, submit incomplete evidence, or accept ratings that don\u2019t reflect their conditions.",
     "ESBE Incorporated was created to fill that gap \u2014 starting with direct, free claims assistance and growing into broader public-interest work. Our flagship program, AIVA Claims, gives veterans free one-on-one help preparing VA disability claims: understanding eligibility, gathering the right evidence, and navigating each stage of the process. Alongside it, we build free public tools \u2014 from Bay Area 311 reporting to hospital price transparency \u2014 that make government-facing systems more understandable for everyone."]) \
+ statement(2, "WHAT WE BELIEVE",
    "Three convictions guide everything we do.",
    ["Veterans earned their benefits. The claims process should not be a barrier to receiving them. A veteran\u2019s service-connected conditions deserve a fair, complete evaluation \u2014 and paperwork should never be the reason someone goes without.",
     "Expert help should be free. No veteran should have to pay a percentage of their back pay or monthly benefits to get assistance they need. Our programs are donor-supported so that cost is never the reason a veteran goes without help.",
     "Government systems should be understandable. When the stakes are high \u2014 disability benefits, housing, public safety \u2014 people deserve clear information and working tools. We build plain-language resources and practical technology that help people navigate systems that were not designed with them in mind."]) \
+ statement(3, "WHAT WE DO",
    "Two lines of work.",
    ["AIVA Claims \u2014 our flagship program providing free VA disability claims assistance to veterans nationwide. One-on-one help understanding eligibility and rating criteria, identifying supporting medical evidence, preparing for Compensation &amp; Pension examinations, understanding the claims timeline, and navigating supplemental claims and appeals.",
     "Civic access projects \u2014 free public tools that help people understand and use government-facing services: ImproveBayArea for Bay Area 311 reporting, Hospital Ledger for hospital price transparency, the Treasure Island power outage tracker, the SF Permit Navigator, NPS Report for national park concerns, and SF Income Verify for affordable-housing income verification. These are independent public resources; they do not represent or act on behalf of any government agency."]) \
+ statement(4, "OUR INDEPENDENCE",
    "Independent, always.",
    ["ESBE Incorporated is an independent nonprofit organization. We are not a government agency, we do not represent the Department of Veterans Affairs or any other government body, and our tools and guidance do not constitute legal advice. Our accountability is to our mission, the veterans we serve, and our donors."])

PROGRAMS_BODY = page_hero(
    "OUR PROGRAMS",
    "Free help for veterans. Free tools for the public.",
    "ESBE Incorporated runs two lines of work: AIVA Claims, our flagship program providing "
    "free VA disability claims assistance to veterans nationwide, and a family of civic "
    "access projects \u2014 free public tools that make government-facing services easier "
    "to understand and use."
) + statement(1, "AIVA CLAIMS",
    "Free VA disability claims assistance.",
    ["The VA disability claims process is complex. Veterans must understand medical evidence requirements, VA rating criteria, filing deadlines, and appeal options \u2014 often while dealing with the very conditions they\u2019re claiming for. Professional help exists but typically costs money many veterans don\u2019t have, and some services take a cut of the veteran\u2019s own benefits.",
     "AIVA Claims exists to change that equation. We provide free, one-on-one assistance to veterans preparing VA disability claims. Our help includes understanding VA disability eligibility and rating criteria; identifying what medical evidence supports a claim; preparing for Compensation &amp; Pension (C&amp;P) examinations; understanding the claims timeline and what to expect at each stage; and guidance on supplemental claims and appeals if a claim is denied.",
     "Who it serves: veterans nationwide who need help with VA disability claims. Cost: free. AIVA Claims is a donor-funded program of ESBE Incorporated. We do not charge fees, take a percentage of benefits, or require payment of any kind.",
     "How to start: email help@esbeincorporated.org with the subject line \u201cClaims Help,\u201d call (802) 715-3723, or visit aivaclaims.com."]) \
+ """<section class="programs" aria-labelledby="civic-title">
        <div class="section-heading"><div><p class="section-mark">02</p></div><div><p class="eyebrow">CIVIC ACCESS PROJECTS</p><h2 id="civic-title">Free public tools for public systems.</h2></div></div>
        <div class="civic-project-grid">
          <article class="civic-project"><p class="civic-project-meta">BAY AREA 311 \u00b7 LIVE</p><h4>ImproveBayArea</h4><p>One public reporting form that routes Bay Area requests to the appropriate official 311 service.</p><a href="https://improvebayarea.com" rel="noreferrer">Visit ImproveBayArea <span aria-hidden="true">\u2197</span></a></article>
          <article class="civic-project"><p class="civic-project-meta">FEDERAL TRANSPARENCY \u00b7 LIVE</p><h4>Hospital Ledger</h4><p>A public-good resource for exploring hospital price files published under federal transparency requirements.</p><a href="https://hospitalledger.com" rel="noreferrer">Visit Hospital Ledger <span aria-hidden="true">\u2197</span></a></article>
          <article class="civic-project"><p class="civic-project-meta">PUBLIC INFRASTRUCTURE \u00b7 LIVE</p><h4>Treasure Island Power Tracker</h4><p>Documents Treasure Island power failures and related accountability work.</p><a href="https://www.treasureislandsfpoweroutages.com" rel="noreferrer">Visit the tracker <span aria-hidden="true">\u2197</span></a></article>
          <article class="civic-project"><p class="civic-project-meta">SAN FRANCISCO PERMITS \u00b7 PROTOTYPE</p><h4>SF Permit Navigator</h4><p>A plain-language prototype helping San Franciscans understand permit requirements.</p><a href="https://sf-permit-detector.barkleesanders.workers.dev" rel="noreferrer">Visit the prototype <span aria-hidden="true">\u2197</span></a></article>
          <article class="civic-project"><p class="civic-project-meta">NATIONAL PARKS \u00b7 LIVE</p><h4>NPS Report</h4><p>A tool for reporting maintenance and safety concerns through National Park Service contact paths.</p><a href="https://nps-report.barkleesanders.workers.dev" rel="noreferrer">Visit NPS Report <span aria-hidden="true">\u2197</span></a></article>
          <article class="civic-project"><p class="civic-project-meta">SF AFFORDABLE HOUSING \u00b7 PROTOTYPE</p><h4>SF Income Verify</h4><p>A privacy-first income-verification prototype for San Francisco affordable housing. Not affiliated with MOHCD.</p><a href="https://sf-income-verify.barkleesanders.workers.dev/#how-it-works" rel="noreferrer">Visit the prototype <span aria-hidden="true">\u2197</span></a></article>
        </div>
        <p style="color:oklch(0.82 0.02 120);max-width:44rem;margin-top:var(--space-xl)">These projects are independent public resources built and maintained by ESBE Incorporated. They do not represent or act on behalf of any government agency.</p>
      </section>"""

TRANSPARENCY_BODY = page_hero(
    "TRANSPARENCY & GOVERNANCE",
    "A nonprofit should be easy to check on. Here\u2019s everything.",
    "ESBE Incorporated is a 501(c)(3) nonprofit organization recognized by the Internal "
    "Revenue Service. This page documents our nonprofit status, our finances, and how we "
    "govern ourselves \u2014 because an organization that asks for public trust should make "
    "itself easy to verify."
) + statement(1, "OUR NONPROFIT STATUS",
    "Verified facts about who we are.",
    ["Legal name: ESBE Incorporated. Federal Tax ID (EIN): 87-1218291. IRS ruling date: May 1, 2026 \u2014 the date the IRS recognized ESBE Incorporated as a 501(c)(3) tax-exempt organization. You can read the IRS determination letter and confirm our exempt status in the IRS Tax Exempt Organization Search, both linked below.",
     "We are also registered with the California Attorney General\u2019s Registry of Charities and Fundraisers, Registration No. CT0403243, issued October 2, 2026. California requires charities that solicit donations in the state to register, and our registration is current."]) \
+ statement(2, "FINANCIAL TRANSPARENCY",
    "Where the money goes.",
    ["ESBE Incorporated is donor-supported. Donations fund the time, tools, and technology behind AIVA Claims and our civic access projects. We do not charge the veterans we serve, and we do not sell data.",
     "As a recently recognized nonprofit, we have not yet completed our first full filing year. Our annual Form 990 and financial summaries will be published on this page as they become available. In the meantime, questions about our finances are welcome at help@esbeincorporated.org."]) \
+ statement(3, "GOVERNANCE",
    "Who runs ESBE Incorporated.",
    ["ESBE Incorporated was founded by Barklee Sanders, a disabled veteran, and is led by its founder. We keep our governance simple and our decision-making close to the mission: free help for veterans, and public tools that make government systems more understandable.",
     "For questions about our nonprofit status, finances, or governance, contact help@esbeincorporated.org with the subject line \u201cGovernance.\u201d"]) \
+ statement(4, "INDEPENDENCE",
    "Independent of government.",
    ["ESBE Incorporated is an independent nonprofit. We do not speak for, act on behalf of, or receive direction from any government agency, including the Department of Veterans Affairs. Our programs serve veterans and the public; our accountability is to our mission and our donors."]) \
+ """<section class="statement" aria-labelledby="docs-title">
        <div><p class="section-mark">05</p></div>
        <div><p class="eyebrow">DOCUMENTS</p><h2 id="docs-title">Verify us yourself.</h2></div>
        <div>
          <p class="body-large"><a href=\"""" + DETERMINATION_LETTER + """\" rel="noreferrer">Read the IRS determination letter \u2197</a></p>
          <p class="body-large"><a href="https://apps.irs.gov/app/eos/" rel="noreferrer">Search the IRS Tax Exempt Organization Search \u2197</a></p>
          <p class="body-large"><a href="mailto:help@esbeincorporated.org?subject=ESBE%20Incorporated%20transparency%20request">Request governance or filing information</a></p>
        </div>
      </section>"""

PRIVACY_BODY = page_hero(
    "PRIVACY POLICY",
    "Your information stays yours.",
    "ESBE Incorporated respects your privacy. This policy explains what information we "
    "collect through esbeincorporated.org and how we use it. Effective date: October 6, 2026."
) + statement(1, "INFORMATION WE COLLECT",
    "What we collect, and why.",
    ["Information you provide: when you contact us by email or phone, we receive your name, contact information, and the contents of your message. If you seek claims assistance through AIVA Claims, you may share information about your military service and health conditions \u2014 this information is used solely to provide the assistance you requested.",
     "Automatically collected information: like most websites, our hosting provider (Cloudflare) may log technical information such as IP addresses, browser type, and pages visited, for security and operational purposes. We do not use third-party advertising trackers."]) \
+ statement(2, "HOW WE USE YOUR INFORMATION",
    "Limited, purposeful use.",
    ["We use the information we collect to respond to your inquiries and provide requested services; to improve our programs and website; and to comply with legal obligations. We do not sell, rent, or share your personal information with third parties for marketing purposes."]) \
+ statement(3, "DATA SECURITY",
    "Reasonable protection.",
    ["We take reasonable measures to protect your information. Communications about VA claims may involve sensitive health information \u2014 we treat such communications with appropriate confidentiality. However, no internet transmission is completely secure, and you should never send highly sensitive documents over channels you don\u2019t trust."]) \
+ statement(4, "YOUR RIGHTS",
    "Access, correction, deletion.",
    ["You may request access to, correction of, or deletion of your personal information by contacting help@esbeincorporated.org. We will respond to verified requests within a reasonable time."]) \
+ statement(5, "CHANGES & CONTACT",
    "This policy may change.",
    ["We may update this policy periodically. The current version will always be posted at esbeincorporated.org/privacy, with its effective date noted above. Privacy questions: help@esbeincorporated.org or (802) 715-3723."])

CONTACT_BODY = page_hero(
    "CONTACT US",
    "Get in touch.",
    "We welcome inquiries about our programs, partnership opportunities, governance, "
    "and press. The fastest way to reach us is email \u2014 every message is read by a real person."
) + """<section class="contact" aria-labelledby="contact-title">
        <div><p class="section-mark">01</p></div>
        <div><p class="eyebrow">PUBLIC CONTACT</p><h2 id="contact-title">Contact ESBE Incorporated.</h2><p class="contact-copy">For public inquiries, governance requests, and nonprofit correspondence.</p><div class="contact-details"><a class="contact-email" href="mailto:help@esbeincorporated.org">help@esbeincorporated.org <span aria-hidden="true">\u2197</span></a><a class="contact-phone" href="tel:+18027153723">(802) 715-3723</a><address>1070 Bridgeview Way #1010<br />San Francisco, CA 94158</address></div></div>
      </section>""" \
+ statement(2, "FOR VETERANS SEEKING CLAIMS HELP",
    "Start with AIVA Claims.",
    ["If you are a veteran who needs help with a VA disability claim, contact AIVA Claims directly at aivaclaims.com \u2014 or email help@esbeincorporated.org with the subject line \u201cClaims Help\u201d and tell us briefly what you\u2019re working on. Our assistance is free: we never charge fees or take a percentage of your benefits. Please don\u2019t include sensitive medical records in your first message; we\u2019ll tell you exactly what we need and the safest way to share it."]) \
+ statement(3, "FOR GOVERNANCE & NONPROFIT CORRESPONDENCE",
    "Formal inquiries welcome.",
    ["For questions about our nonprofit status, finances, governance, or partnerships, email help@esbeincorporated.org with the subject line \u201cGovernance.\u201d Members of the press covering our programs or civic access projects can use the same address with the subject line \u201cPress.\u201d"]) \
+ statement(4, "WHAT TO INCLUDE IN YOUR MESSAGE",
    "Help us help you faster.",
    ["You don\u2019t need to write a formal letter \u2014 a few clear sentences are perfect. Tell us who you are, what you\u2019re asking about, and the best way to reach you. If your question is about a specific program, name it: AIVA Claims, one of the civic access projects, or a governance matter.",
     "A note on sensitive information: please don\u2019t attach medical records, DD-214s, or other sensitive documents to your first message. If we need documents, we\u2019ll tell you exactly what\u2019s needed and the safest way to share them. Email is convenient, but no internet transmission is completely secure \u2014 we\u2019d rather guide you to a safer channel than have you overshare up front."]) \
+ statement(5, "MAIL",
    "Prefer paper?",
    ["If you\u2019re sending documents or formal correspondence by mail, address it to: ESBE Incorporated, 1070 Bridgeview Way #1010, San Francisco, CA 94158. For time-sensitive matters, email is faster \u2014 mail is checked less frequently than our inbox."])

SUPPORT_BODY = page_hero(
    "SUPPORT OUR MISSION",
    "Free for veterans, funded by people who believe in the mission.",
    "Every veteran AIVA Claims helps receives our assistance for free \u2014 no fees, no "
    "percentage of back pay, no strings. Your support directly funds the time, tools, and "
    "technology that make free claims help possible."
) + statement(1, "WHY YOUR SUPPORT MATTERS",
    "What donations make possible.",
    ["Preparing a VA disability claim well takes real work: understanding rating criteria, gathering medical evidence, preparing for examinations, and navigating appeals when claims are denied. AIVA Claims does that work alongside veterans for free \u2014 which means someone has to fund the people and systems behind it.",
     "Donations to ESBE Incorporated keep AIVA Claims free for every veteran who needs it, and sustain the civic access projects \u2014 ImproveBayArea, Hospital Ledger, the Treasure Island power tracker, and others \u2014 that make public systems more understandable for everyone."]) \
+ statement(2, "HOW TO DONATE",
    "Talk to us first.",
    ["We are currently setting up online giving. If you\u2019d like to support our work, email help@esbeincorporated.org with the subject line \u201cDonation\u201d and we\u2019ll get back to you with the current options.",
     "ESBE Incorporated is a 501(c)(3) nonprofit organization (EIN 87-1218291). Donations are tax-deductible to the extent allowed by law. Consult your tax advisor."]) \
+ statement(3, "OTHER WAYS TO SUPPORT",
    "Money isn\u2019t the only way.",
    ["Spread the word: share aivaclaims.com with veterans who might need help. Many veterans don\u2019t know free claims assistance exists \u2014 a single share can change someone\u2019s outcome.",
     "Partner with us: if your organization serves veterans, contact us at help@esbeincorporated.org about partnership opportunities \u2014 from referral relationships to joint outreach."])

NOTFOUND_BODY = page_hero(
    "PAGE NOT FOUND",
    "That page doesn\u2019t exist.",
    "The page you\u2019re looking for isn\u2019t here. Try one of the pages below, or contact us and we\u2019ll point you the right way."
)

# ---------------------------------------------------------------- assemble

PAGES = {
    "/": ("ESBE Incorporated | Veteran support and public-interest work",
           "ESBE Incorporated is a 501(c)(3) nonprofit that helps veterans get the VA disability benefits they earned \u2014 for free \u2014 and builds free public tools that make government services easier to use.",
           HOME_BODY),
    "/about": ("About ESBE Incorporated | Who we are",
               "ESBE Incorporated is a 501(c)(3) nonprofit founded by a disabled veteran to provide free VA disability claims assistance and build public-interest tools.",
               ABOUT_BODY),
    "/programs": ("Our Programs | AIVA Claims & Civic Access Projects",
                  "AIVA Claims provides free VA disability claims assistance to veterans nationwide. ESBE Incorporated also builds free civic access tools like ImproveBayArea and Hospital Ledger.",
                  PROGRAMS_BODY),
    "/transparency": ("Transparency & Governance | ESBE Incorporated",
                      "ESBE Incorporated is a 501(c)(3) nonprofit (EIN 87-1218291), registered with the California Attorney General (CT0403243). Our status, finances, and governance, documented.",
                      TRANSPARENCY_BODY),
    "/privacy": ("Privacy Policy | ESBE Incorporated",
                 "The ESBE Incorporated privacy policy: what we collect through esbeincorporated.org, how we use it, and your rights. Effective October 6, 2026.",
                 PRIVACY_BODY),
    "/contact": ("Contact Us | ESBE Incorporated",
                 "Contact ESBE Incorporated: help@esbeincorporated.org, (802) 715-3723, 1070 Bridgeview Way #1010, San Francisco, CA 94158.",
                 CONTACT_BODY),
    "/support": ("Support Our Mission | ESBE Incorporated",
                 "Support free VA disability claims assistance for veterans. ESBE Incorporated is a 501(c)(3) nonprofit (EIN 87-1218291); donations are tax-deductible.",
                 SUPPORT_BODY),
}

# ---- quality gates: word counts + placeholder scan (run before deploy)
BANNED = ["NEEDS CONFIRMATION", "TODO", "FIXME", "XXX", "lorem", "coming soon",
          "[YOUR", "[INSERT", "TBD", "placeholder"]
failures = []
for path, (title, desc, body) in PAGES.items():
    html = layout(title, desc, path, body)
    text = re.sub(r"<[^>]+>", " ", html)
    words = len([w for w in text.split() if w.strip()])
    print(f"{path}: {words} words")
    if words < 300:
        failures.append(f"{path} has only {words} words (<300)")
    low = html.lower()
    for b in BANNED:
        if b.lower() in low:
            failures.append(f"{path} contains banned text: {b!r}")
if failures:
    print("GATE FAILURES:")
    for f in failures:
        print(" -", f)
    sys.exit(1)
print("All page gates passed.")

# ---- emit index.js
ico_b64 = base64.b64encode(open("favicon.ico", "rb").read()).decode()
png_b64 = base64.b64encode(open("apple-touch-icon.png", "rb").read()).decode()

# Static assets previously served via the ASSETS binding — now embedded so the
# worker is a single self-contained deploy (no assets binding needed).
ASSETS = {
    "/styles.css": ("text/css; charset=utf-8", open("/tmp/esbe-styles.css", "rb").read()),
    "/tokens.css": ("text/css; charset=utf-8", open("/tmp/esbe-tokens.css", "rb").read()),
    "/favicon.svg": ("image/svg+xml", open("/tmp/esbe-favicon.svg", "rb").read()),
    "/og.svg": ("image/svg+xml", open("/tmp/esbe-og.svg", "rb").read()),
    "/webmcp.js": ("application/javascript; charset=utf-8", open("/tmp/esbe-webmcp.js", "rb").read()),
    "/.well-known/security.txt": ("text/plain; charset=utf-8", open("/tmp/esbe-security.txt", "rb").read()),
}
assets_js = ",\n".join(
    f"  {json.dumps(p)}: [{json.dumps(ct)}, {json.dumps(base64.b64encode(data).decode())}]"
    for p, (ct, data) in ASSETS.items())

sitemap_urls = "\n".join(
    f'  <url><loc>{SITE}{p}</loc><lastmod>{LASTMOD}</lastmod><changefreq>monthly</changefreq></url>'
    for p in PAGES)
SITEMAP = (f'<?xml version="1.0" encoding="UTF-8"?>\n'
           f'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{sitemap_urls}\n</urlset>')

ROBOTS = f"User-agent: *\nAllow: /\nSitemap: {SITE}/sitemap.xml\n"

pages_js = ",\n".join(f"  {json.dumps(p)}: {json.dumps(layout(t, d, p, b))}" for p, (t, d, b) in PAGES.items())
notfound_js = json.dumps(layout("Page not found | ESBE Incorporated",
    "The requested page does not exist on esbeincorporated.org.", "/", NOTFOUND_BODY))

worker_js = f"""// esbe-incorporated-site — built {LASTMOD} from site-build/build.py
const PAGES = {{
{pages_js}
}};
const NOTFOUND_HTML = {notfound_js};
const SITEMAP_XML = {json.dumps(SITEMAP)};
const ROBOTS_TXT = {json.dumps(ROBOTS)};
const FAVICON_ICO_B64 = {json.dumps(ico_b64)};
const APPLE_TOUCH_B64 = {json.dumps(png_b64)};
const STATIC_ASSETS = {{
{assets_js}
}};

function b64bytes(b64) {{
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}}

const SEC_HEADERS = {{
  "Content-Security-Policy": "default-src 'self'; base-uri 'self'; connect-src 'self' https://cloudflareinsights.com; font-src 'self' https://fonts.gstatic.com; frame-ancestors 'none'; img-src 'self' data:; object-src 'none'; script-src 'self' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; upgrade-insecure-requests",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin"
}};

function withSec(res) {{
  const h = new Headers(res.headers);
  for (const [k, v] of Object.entries(SEC_HEADERS)) h.set(k, v);
  return new Response(res.body, {{ status: res.status, statusText: res.statusText, headers: h }});
}}

export default {{
  async fetch(request, env, ctx) {{
    const url = new URL(request.url);
    if (url.hostname === "www.esbeincorporated.org") {{
      return Response.redirect("https://esbeincorporated.org" + url.pathname + url.search, 301);
    }}
    let path = url.pathname;
    if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);

    let res;
    if (path === "/security.txt") {{
      return Response.redirect("https://esbeincorporated.org/.well-known/security.txt", 302);
    }} else if (path === "/favicon.ico") {{
      res = new Response(b64bytes(FAVICON_ICO_B64), {{ headers: {{ "Content-Type": "image/x-icon", "Cache-Control": "public, max-age=86400" }} }});
    }} else if (path === "/apple-touch-icon.png" || path === "/apple-touch-icon-precomposed.png") {{
      res = new Response(b64bytes(APPLE_TOUCH_B64), {{ headers: {{ "Content-Type": "image/png", "Cache-Control": "public, max-age=86400" }} }});
    }} else if (path === "/sitemap.xml") {{
      res = new Response(SITEMAP_XML, {{ headers: {{ "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" }} }});
    }} else if (path === "/robots.txt") {{
      res = new Response(ROBOTS_TXT, {{ headers: {{ "Content-Type": "text/plain; charset=utf-8" }} }});
    }} else if (PAGES[path]) {{
      res = new Response(PAGES[path], {{ headers: {{ "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=300" }} }});
    }} else if (STATIC_ASSETS[path]) {{
      const [ct, b64] = STATIC_ASSETS[path];
      res = new Response(b64bytes(b64), {{ headers: {{ "Content-Type": ct, "Cache-Control": "public, max-age=86400" }} }});
    }} else {{
      res = new Response(NOTFOUND_HTML, {{ status: 404, headers: {{ "Content-Type": "text/html; charset=utf-8" }} }});
    }}
    return withSec(res);
  }}
}};
"""

with open("index.js", "w") as f:
    f.write(worker_js)
print("index.js written:", len(worker_js), "bytes")
