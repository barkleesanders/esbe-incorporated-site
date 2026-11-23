// DO NOT EDIT — generated from ../ai-readable.js by mcp/build-content.mjs.
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

export const SITE: SiteInfo = {
  "name": "ESBE Incorporated",
  "url": "https://esbeincorporated.org",
  "description": "ESBE Incorporated is a 501(c)(3) nonprofit advancing veteran support and public-interest access to government-facing services.",
  "email": "help@esbeincorporated.org",
  "phone": "(802) 715-3723",
  "taxId": "87-1218291",
  "determinationLetter": "https://apps.irs.gov/pub/epostcard/dl/FinalLetter_87-1218291_ESBEINCORPORATED_05012026_v1.0.pdf",
  "disclosure": "ESBE Incorporated is a 501(c)(3) nonprofit organization, EIN 87-1218291. AIVA Claims is a charitable program of ESBE Incorporated. ESBE Tech is a separate for-profit technology company. ESBE Incorporated is not affiliated with or endorsed by the U.S. Department of Veterans Affairs."
};

export const PAGES: PageEntry[] = [
  {
    "path": "/",
    "mdPath": "/index.md",
    "title": "ESBE Incorporated | Veteran support and public-interest work",
    "h1": "Public-interest work that helps people move forward",
    "description": "ESBE Incorporated is a 501(c)(3) nonprofit advancing veteran support and public-interest access to government-facing services.",
    "aiSummary": "ESBE Incorporated is a 501(c)(3) nonprofit (EIN 87-1218291) advancing veteran support — through its AIVA Claims program, which helps veterans prepare VA disability claims for free — and public-interest access to government-facing services.",
    "lastUpdated": "2026-11-23",
    "sections": [
      {
        "heading": "About",
        "paragraphs": [
          "ESBE Incorporated builds practical tools and clear information for veterans and people navigating government-facing services.",
          "AIVA Claims is a program of ESBE Incorporated. ESBE Tech provides separate technical infrastructure. ESBE is independent and does not speak for or act on behalf of any government agency."
        ]
      },
      {
        "heading": "Our mission",
        "paragraphs": [
          "Public systems should be easier to use when the stakes are high.",
          "We make information easier to understand and help people prepare for the next right step. Our work supports veterans and strengthens public-interest access to government-facing services through clarity, privacy, and accessible technology."
        ]
      },
      {
        "heading": "AIVA Claims (veteran support)",
        "paragraphs": [
          "Free, donor-funded help preparing your VA disability claim. You review, edit, and file everything yourself."
        ],
        "bullets": [
          "Create your free account",
          "Upload your records",
          "Review your draft claim package",
          "File it yourself with the VA"
        ]
      },
      {
        "heading": "Public-interest services",
        "paragraphs": [
          "Accessible technology and plain-language information that help people understand and use government-facing services."
        ]
      },
      {
        "heading": "Selected civic projects",
        "paragraphs": [
          "These independent public projects make government-facing information and reporting paths more understandable. They do not represent or act for a government agency."
        ],
        "links": [
          {
            "text": "Hospital Ledger — a public-good resource for exploring hospital price files published under federal transparency requirements (live)",
            "url": "https://hospitalledger.com"
          },
          {
            "text": "SF Permit Navigator — a plain-language permit-path prototype that identifies where an official city system is required (prototype)",
            "url": "https://sf-permit-detector.barkleesanders.workers.dev"
          },
          {
            "text": "ImproveBayArea — one public reporting form that routes Bay Area requests to the appropriate official 311 service (live)",
            "url": "https://improvebayarea.com"
          },
          {
            "text": "NPS Report — a public tool for reporting maintenance and safety concerns through National Park Service contact paths (live)",
            "url": "https://nps-report.barkleesanders.workers.dev"
          },
          {
            "text": "SF Income Verify — a privacy-first income-verification prototype for San Francisco affordable housing; not affiliated with MOHCD (prototype)",
            "url": "https://sf-income-verify.barkleesanders.workers.dev/#how-it-works"
          },
          {
            "text": "Treasure Island Power — a public outage tracker documenting Treasure Island power failures and related accountability work (live)",
            "url": "https://www.treasureislandsfpoweroutages.com"
          },
          {
            "text": "ESBE Tech — independent infrastructure projects by Barklee Sanders",
            "url": "https://esbe.tech"
          }
        ]
      },
      {
        "heading": "Transparency",
        "facts": [
          [
            "Organization",
            "ESBE Incorporated"
          ],
          [
            "Federal tax ID",
            "87-1218291"
          ],
          [
            "Federal status",
            "501(c)(3) nonprofit organization"
          ],
          [
            "Registered address",
            "1070 Bridgeview Way, Apt 1010, San Francisco, CA 94158"
          ],
          [
            "Public purpose",
            "Veteran support and public-interest access to government-facing services."
          ],
          [
            "Program relationship",
            "AIVA Claims is a program of ESBE Incorporated."
          ],
          [
            "Government relationship",
            "Independent nonprofit; not a government agency."
          ]
        ],
        "links": [
          {
            "text": "Read the IRS determination letter",
            "url": "https://apps.irs.gov/pub/epostcard/dl/FinalLetter_87-1218291_ESBEINCORPORATED_05012026_v1.0.pdf"
          },
          {
            "text": "Search the IRS Tax Exempt Organization Search",
            "url": "https://apps.irs.gov/app/eos/"
          },
          {
            "text": "Request governance or filing information",
            "url": "mailto:help@esbeincorporated.org?subject=ESBE%20Incorporated%20transparency%20request"
          }
        ]
      },
      {
        "heading": "Contact",
        "paragraphs": [
          "For public inquiries, governance requests, and nonprofit correspondence, reach us by email or phone.",
          "Email: help@esbeincorporated.org · Phone: (802) 715-3723",
          "Mailing and registered address: ESBE Incorporated, 1070 Bridgeview Way, Apt 1010, San Francisco, CA 94158.",
          "ESBE Incorporated is a 501(c)(3) nonprofit organization, EIN 87-1218291. AIVA Claims is a charitable program of ESBE Incorporated. ESBE Tech is a separate for-profit technology company. ESBE Incorporated is not affiliated with or endorsed by the U.S. Department of Veterans Affairs."
        ]
      }
    ],
    "related": [
      {
        "text": "Community — Treasure Island community work",
        "url": "https://esbeincorporated.org/community"
      },
      {
        "text": "Donate to ESBE Incorporated",
        "url": "https://esbeincorporated.org/donate"
      },
      {
        "text": "About ESBE Incorporated",
        "url": "https://esbeincorporated.org/about"
      },
      {
        "text": "Contact ESBE Incorporated",
        "url": "https://esbeincorporated.org/contact"
      },
      {
        "text": "AIVA Claims — create your free account",
        "url": "https://aivaclaims.com/sign-up?utm_source=esbeincorporated.org&utm_medium=nonprofit_site&utm_campaign=programs_cta"
      }
    ]
  },
  {
    "path": "/donate",
    "mdPath": "/donate.md",
    "title": "Donate | ESBE Incorporated",
    "h1": "Free help for veterans, funded by people who give",
    "description": "Donate to ESBE Incorporated, a 501(c)(3) nonprofit. Your gift funds free VA claims help for veterans through AIVA Claims.",
    "aiSummary": "Donate to ESBE Incorporated, a 501(c)(3) nonprofit. Your gift funds free VA claims help for veterans through AIVA Claims.",
    "lastUpdated": "2026-10-15",
    "sections": [
      {
        "heading": "What your gift does",
        "paragraphs": [
          "AIVA Claims — ESBE's veteran support program — helps veterans understand and prepare VA disability claims at no cost to them. Donations pay for that work: the tools, the technology, and the time, so veterans never have to.",
          "Giving is processed securely by Every.org. ESBE Incorporated is an independent nonprofit and is not affiliated with the U.S. Department of Veterans Affairs.",
          "AIVA Claims: free, donor-funded help preparing VA disability claims. Veterans review, edit, and file everything themselves — your gift keeps it that way.",
          "No cost to veterans · 501(c)(3) nonprofit, EIN 87-1218291 · CA Charity Registration CT0403243 · Not affiliated with the U.S. Department of Veterans Affairs"
        ],
        "links": [
          {
            "text": "Donate now (Every.org, one-time)",
            "url": "https://www.every.org/esbe-incorporated?frequency=once#/donate/pay"
          },
          {
            "text": "Give monthly (Every.org)",
            "url": "https://www.every.org/esbe-incorporated?frequency=monthly#/donate/pay"
          }
        ]
      },
      {
        "heading": "Transparency",
        "facts": [
          [
            "Organization",
            "ESBE Incorporated"
          ],
          [
            "Federal tax ID",
            "87-1218291"
          ],
          [
            "Federal status",
            "501(c)(3) nonprofit organization"
          ],
          [
            "CA charity registration",
            "CT0403243"
          ],
          [
            "Giving processed by",
            "Every.org"
          ],
          [
            "Program relationship",
            "AIVA Claims is a program of ESBE Incorporated."
          ]
        ],
        "links": [
          {
            "text": "Read the IRS determination letter",
            "url": "https://apps.irs.gov/pub/epostcard/dl/FinalLetter_87-1218291_ESBEINCORPORATED_05012026_v1.0.pdf"
          },
          {
            "text": "Search the IRS Tax Exempt Organization Search",
            "url": "https://apps.irs.gov/app/eos/"
          },
          {
            "text": "Ask about sponsorships and grants",
            "url": "mailto:help@esbeincorporated.org?subject=ESBE%20Incorporated%20sponsorship%20or%20grant%20inquiry"
          }
        ]
      }
    ],
    "related": [
      {
        "text": "ESBE Incorporated home",
        "url": "https://esbeincorporated.org/"
      }
    ]
  },
  {
    "path": "/community",
    "mdPath": "/community.md",
    "title": "Treasure Island Community Work | ESBE Incorporated",
    "h1": "Dependable power is a community issue on Treasure Island",
    "description": "ESBE Incorporated's community work on Treasure Island: public documentation of power outages and plain-language paths to official reporting channels for residents.",
    "aiSummary": "ESBE Incorporated's community work on Treasure Island: public documentation of power outages and plain-language paths to official reporting channels for residents.",
    "lastUpdated": "2026-10-24",
    "sections": [
      {
        "heading": "About this work",
        "paragraphs": [
          "ESBE Incorporated supports public documentation and accountability work for Treasure Island residents. The goal is practical: make outage information easier to find, understand, and act on for the people who live on the island.",
          "ESBE Incorporated is an independent nonprofit. It is not a government agency and does not speak for the City and County of San Francisco, the San Francisco Public Utilities Commission, or the Treasure Island Development Authority."
        ]
      },
      {
        "heading": "Why it matters",
        "paragraphs": [
          "An island community feels every outage.",
          "When the power fails, households, small businesses, and neighbors who rely on electricity are affected together. A clear public record of what happened, and a clear path to the right official channel, helps residents ask for reliable service with facts in hand."
        ]
      },
      {
        "heading": "Community resources",
        "paragraphs": [
          "Treasure Island Power: a public outage tracker documenting Treasure Island power failures and related accountability work. Its records are community-compiled and are not a live power feed. It is an independent public project and is not affiliated with SFPUC or TIDA.",
          "For an emergency, call 911."
        ],
        "links": [
          {
            "text": "Treasure Island Power — the public record of outages and related accountability work for Treasure Island",
            "url": "https://www.treasureislandsfpoweroutages.com"
          },
          {
            "text": "Report an outage — through Improve Bay Area or San Francisco 311",
            "url": "https://www.treasureislandsfpoweroutages.com/report"
          },
          {
            "text": "Resident resources — emergency alerts, claim forms, advocacy tools, and press coverage for Treasure Island residents",
            "url": "https://www.treasureislandsfpoweroutages.com/resources"
          },
          {
            "text": "Record requests — public records requests filed in the Treasure Island and Yerba Buena Island grid investigation",
            "url": "https://www.treasureislandsfpoweroutages.com/records"
          },
          {
            "text": "Infrastructure map — an interactive map of Treasure Island grid infrastructure and outage history",
            "url": "https://www.treasureislandsfpoweroutages.com/map"
          },
          {
            "text": "Power quality log — voltage sags, swells, transients, and interruptions recorded by a power-quality meter on Treasure Island",
            "url": "https://www.treasureislandsfpoweroutages.com/power-quality"
          }
        ]
      },
      {
        "heading": "Transparency",
        "facts": [
          [
            "Organization",
            "ESBE Incorporated"
          ],
          [
            "Federal tax ID",
            "87-1218291"
          ],
          [
            "Federal status",
            "501(c)(3) nonprofit organization"
          ],
          [
            "Government relationship",
            "Independent nonprofit; not a government agency."
          ]
        ],
        "links": [
          {
            "text": "Read the IRS determination letter",
            "url": "https://apps.irs.gov/pub/epostcard/dl/FinalLetter_87-1218291_ESBEINCORPORATED_05012026_v1.0.pdf"
          },
          {
            "text": "Contact us about this work",
            "url": "mailto:help@esbeincorporated.org?subject=ESBE%20Incorporated%20community%20inquiry"
          }
        ]
      }
    ],
    "related": [
      {
        "text": "ESBE Incorporated home",
        "url": "https://esbeincorporated.org/"
      },
      {
        "text": "Support ESBE's work — donate",
        "url": "https://esbeincorporated.org/donate"
      }
    ]
  },
  {
    "path": "/va-claim-guide",
    "mdPath": "/va-claim-guide.md",
    "title": "How to File a VA Disability Claim | ESBE Incorporated",
    "h1": "How to file a VA disability claim, step by step",
    "description": "A plain-language guide to filing a VA disability claim: who can file, how to protect your effective date, the evidence VA looks for, how to file VA Form 21-526EZ, what happens at the C&P exam, and what to do after a decision — with free preparation help from AIVA Claims.",
    "aiSummary": "A plain-language guide to filing a VA disability claim: who can file, how to protect your effective date, the evidence VA looks for, how to file VA Form 21-526EZ, what happens at the C&P exam, and what to do after a decision — with free preparation help from AIVA Claims.",
    "lastUpdated": "2026-11-22",
    "sections": [
      {
        "heading": "Who can file",
        "paragraphs": [
          "You can file a claim for VA disability compensation if you have a current medical condition that was caused by — or made worse by — your military service. You do not need to be retired, and the condition does not need to have been treated while you were serving. What VA looks for is evidence connecting the condition to your service.",
          "This guide covers the standard disability claim process in general terms. It is general information, not legal or benefits advice, and it cannot cover every situation — claims for survivors' benefits, pension, and education benefits follow different rules."
        ]
      },
      {
        "heading": "Step 1 — Protect your effective date",
        "paragraphs": [
          "If you plan to file but are not ready yet, submit an intent to file — VA Form 21-0966 — online at VA.gov, by phone, or by mail. An intent to file generally gives you up to one year to complete and submit your claim while keeping the earlier date as your potential effective date, which is the date VA uses when it calculates any back pay.",
          "You can have only one intent to file open at a time, and it expires if the claim is not completed within the year."
        ]
      },
      {
        "heading": "Step 2 — Gather your evidence",
        "paragraphs": [
          "VA decides claims on evidence. Before you file, gather what you have; you can also tell VA where your records are. The most useful evidence usually includes:",
          "VA has a duty to help you obtain federal records, including your service treatment records and VA treatment records. Private medical records are your responsibility unless you give VA the details and signed authorization it needs to request them."
        ],
        "bullets": [
          "Your DD214 or other separation documents",
          "Service treatment records from your time in service",
          "VA medical records and private treatment records for the condition",
          "A current diagnosis from a medical provider",
          "Statements from fellow service members (often called buddy statements) and from family members who know the condition's history",
          "A medical opinion linking the condition to your service — a nexus letter — when the connection is not already clear in the records"
        ]
      },
      {
        "heading": "Step 3 — File the claim",
        "paragraphs": [
          "Most veterans file VA Form 21-526EZ, the standard application for disability compensation. You can file online at VA.gov, by mail to VA's claims intake center, or in person at a VA regional office.",
          "You do not have to do it alone: accredited veterans service organizations (VSOs) help for free, and accredited attorneys and claims agents can also help. By law, no one may charge you a fee for help with an initial claim."
        ]
      },
      {
        "heading": "Step 4 — The C&P exam",
        "paragraphs": [
          "After you file, VA may schedule a Compensation and Pension (C&P) exam. The exam is not treatment. The examiner reviews your records, examines you, and gives VA a medical opinion about your condition and whether it is connected to your service.",
          "Attending matters: if you miss the exam without rescheduling, VA can decide the claim without that evidence. Describe how the condition affects your daily life and your work in concrete terms, including your worst days, not just the day of the exam."
        ]
      },
      {
        "heading": "Step 5 — VA decides, and what happens next",
        "paragraphs": [
          "VA sends a rating decision listing each condition, whether it is service-connected, and the disability rating assigned to it. Ratings for separate conditions are combined using VA's combined ratings table — they are not simply added together.",
          "If you disagree with any part of the decision, you generally have one year from the decision date to act while preserving your place: file a Supplemental Claim with new and relevant evidence, request a Higher-Level Review of the existing record, or appeal to the Board of Veterans' Appeals. Each path has different rules about evidence and timing, so choose deliberately."
        ]
      },
      {
        "heading": "How AIVA Claims helps",
        "paragraphs": [
          "AIVA Claims is a charitable program of ESBE Incorporated. It helps veterans understand and prepare VA disability claims at no cost: organizing records, making sense of the process, and preparing a claim package you can stand behind. You review, edit, and file everything yourself."
        ],
        "links": [
          {
            "text": "Create your free AIVA Claims account",
            "url": "https://aivaclaims.com/sign-up?utm_source=esbeincorporated.org&utm_medium=nonprofit_site&utm_campaign=programs_cta"
          },
          {
            "text": "Nexus letters — what they are and when a claim needs one",
            "url": "https://esbeincorporated.org/nexus-letter"
          }
        ]
      },
      {
        "heading": "Transparency",
        "facts": [
          [
            "Organization",
            "ESBE Incorporated"
          ],
          [
            "Federal tax ID",
            "87-1218291"
          ],
          [
            "Federal status",
            "501(c)(3) nonprofit organization"
          ],
          [
            "Program relationship",
            "AIVA Claims is a program of ESBE Incorporated."
          ]
        ],
        "links": [
          {
            "text": "Read the IRS determination letter",
            "url": "https://apps.irs.gov/pub/epostcard/dl/FinalLetter_87-1218291_ESBEINCORPORATED_05012026_v1.0.pdf"
          },
          {
            "text": "Contact us about this guide",
            "url": "mailto:help@esbeincorporated.org?subject=ESBE%20Incorporated%20VA%20claim%20guide%20inquiry"
          }
        ]
      }
    ],
    "related": [
      {
        "text": "Nexus letters — what they are and when a claim needs one",
        "url": "https://esbeincorporated.org/nexus-letter"
      },
      {
        "text": "ESBE Incorporated home",
        "url": "https://esbeincorporated.org/"
      },
      {
        "text": "AIVA Claims — create your free account",
        "url": "https://aivaclaims.com/sign-up?utm_source=esbeincorporated.org&utm_medium=nonprofit_site&utm_campaign=programs_cta"
      }
    ]
  },
  {
    "path": "/nexus-letter",
    "mdPath": "/nexus-letter.md",
    "title": "Nexus Letters for VA Disability Claims | ESBE Incorporated",
    "h1": "Nexus letters: connecting your condition to your service",
    "description": "What a nexus letter is, when a VA disability claim needs one, what makes a medical nexus opinion credible, and how AIVA Claims — a program of ESBE Incorporated — helps veterans organize the records behind one, for free.",
    "aiSummary": "What a nexus letter is, when a VA disability claim needs one, what makes a medical nexus opinion credible, and how AIVA Claims — a program of ESBE Incorporated — helps veterans organize the records behind one, for free.",
    "lastUpdated": "2026-11-22",
    "sections": [
      {
        "heading": "What a nexus letter is",
        "paragraphs": [
          "To grant service connection, VA generally looks for three things: a current, diagnosed condition; an event, injury, illness, or symptom during your service; and a link between the two. That link is the nexus.",
          "A nexus letter is a written medical opinion, from a qualified medical professional, that explains the link. It gives the professional's opinion on whether your current condition is connected to your service — and, just as important, the reasoning and the records behind that opinion."
        ]
      },
      {
        "heading": "When a claim needs one",
        "paragraphs": [
          "A nexus opinion matters most when the connection between service and condition needs a medical explanation. That is often the case when:",
          "When the connection is already plain in the records — for example, an injury documented in service and treated continuously ever since — VA may grant service connection without one."
        ],
        "bullets": [
          "The condition was not diagnosed or documented while you were serving",
          "You are claiming a secondary condition — one caused or made worse by an already service-connected condition",
          "VA denied an earlier claim because the connection to service was not shown",
          "The condition was first diagnosed years after separation",
          "Your service records are incomplete"
        ]
      },
      {
        "heading": "What makes a nexus opinion credible",
        "paragraphs": [
          "VA weighs a medical opinion by the reasoning and records behind it. A short letter that states a conclusion with no rationale and no sign the writer saw your records usually carries little weight. A credible nexus opinion:"
        ],
        "bullets": [
          "Comes from a medical professional qualified to speak to the condition",
          "States that the writer reviewed your relevant records — service treatment records and your treatment history",
          "Gives a clear opinion in VA's standard terms: whether the condition is 'at least as likely as not' connected to service — VA's way of describing a probability of 50 percent or better",
          "Explains the medical reasoning instead of stating a bare conclusion",
          "Addresses your specific condition and history, not a generic template"
        ]
      },
      {
        "heading": "What a nexus letter cannot do",
        "paragraphs": [
          "A nexus letter is evidence, not a decision. VA makes the final call on service connection and on your rating, and no letter can guarantee an outcome. Be cautious of anyone who promises a specific result, or who offers to write an opinion about you without reviewing your records.",
          "AIVA Claims does not write medical opinions — those come from medical professionals. What we do is help you prepare everything around one."
        ]
      },
      {
        "heading": "How AIVA Claims helps",
        "paragraphs": [
          "AIVA Claims is a charitable program of ESBE Incorporated. We help veterans prepare VA disability claims for free: understanding when a claim needs a nexus opinion, organizing the service and medical records a medical professional would need to review, and preparing your claim package. You review, edit, and file everything yourself."
        ],
        "links": [
          {
            "text": "Create your free AIVA Claims account",
            "url": "https://aivaclaims.com/sign-up?utm_source=esbeincorporated.org&utm_medium=nonprofit_site&utm_campaign=programs_cta"
          },
          {
            "text": "How to file a VA disability claim — a step-by-step guide",
            "url": "https://esbeincorporated.org/va-claim-guide"
          }
        ]
      },
      {
        "heading": "Transparency",
        "facts": [
          [
            "Organization",
            "ESBE Incorporated"
          ],
          [
            "Federal tax ID",
            "87-1218291"
          ],
          [
            "Federal status",
            "501(c)(3) nonprofit organization"
          ],
          [
            "Program relationship",
            "AIVA Claims is a program of ESBE Incorporated."
          ]
        ],
        "links": [
          {
            "text": "Read the IRS determination letter",
            "url": "https://apps.irs.gov/pub/epostcard/dl/FinalLetter_87-1218291_ESBEINCORPORATED_05012026_v1.0.pdf"
          },
          {
            "text": "Contact us about this page",
            "url": "mailto:help@esbeincorporated.org?subject=ESBE%20Incorporated%20nexus%20letter%20inquiry"
          }
        ]
      }
    ],
    "related": [
      {
        "text": "How to file a VA disability claim — a step-by-step guide",
        "url": "https://esbeincorporated.org/va-claim-guide"
      },
      {
        "text": "ESBE Incorporated home",
        "url": "https://esbeincorporated.org/"
      },
      {
        "text": "AIVA Claims — create your free account",
        "url": "https://aivaclaims.com/sign-up?utm_source=esbeincorporated.org&utm_medium=nonprofit_site&utm_campaign=programs_cta"
      }
    ]
  },
  {
    "path": "/privacy",
    "mdPath": "/privacy.md",
    "title": "Privacy Policy | ESBE Incorporated",
    "h1": "Privacy Policy",
    "description": "Privacy policy for esbeincorporated.org and its public read-only MCP server: what is collected (standard request logs, Google Analytics), what is not (accounts, payment data), and who processes it.",
    "aiSummary": "Privacy policy for esbeincorporated.org and its public read-only MCP server: what is collected (standard request logs, Google Analytics), what is not (accounts, payment data), and who processes it.",
    "lastUpdated": "2026-10-30",
    "sections": [
      {
        "heading": "What this site is",
        "paragraphs": [
          "esbeincorporated.org is the website of ESBE Incorporated, a 501(c)(3) nonprofit organization (EIN 87-1218291). It publishes information about the organization, its programs - including AIVA Claims, its charitable program for veterans - its community work, and how to donate.",
          "The site also runs a public, read-only Model Context Protocol (MCP) server at /mcp that re-publishes the same public content to AI assistants."
        ]
      },
      {
        "heading": "Information collected",
        "paragraphs": [
          "This site has no user accounts and no sign-up forms. Donations are made on Every.org, not on this site, and AIVA Claims accounts are created on aivaclaims.com under that site's own privacy policy.",
          "Like every website, this site receives standard technical request data - IP address, browser user agent, the page or tool requested, and a timestamp - in server logs operated by Cloudflare, the hosting and security provider. Those logs are used for security, rate limiting, and operations.",
          "This site uses Google Analytics and Google advertising measurement tags, which may set cookies and collect usage data as described in Google's privacy policy. This data is used in aggregate to understand traffic and measure outreach. ESBE Incorporated does not sell personal information and does not share it with data brokers."
        ]
      },
      {
        "heading": "The MCP server",
        "paragraphs": [
          "The MCP server at /mcp requires no authentication and every tool is read-only: tools return only content already published on this site or in the server's discovery document. Tool requests are logged with the same technical data as page requests, for rate limiting and abuse prevention.",
          "Do not send personal or sensitive information in tool arguments. The tools neither need it nor use it."
        ]
      },
      {
        "heading": "Who processes data",
        "paragraphs": [
          "Cloudflare provides hosting, DNS, and security. Google provides analytics and advertising measurement. Every.org processes donations under its own privacy policy. Each provider's handling of data is governed by its own policy."
        ]
      },
      {
        "heading": "Contact and changes",
        "paragraphs": [
          "Questions about this policy: help@esbeincorporated.org or (802) 715-3723. If this policy changes, the updated version will be posted at this URL with a new Last updated date."
        ]
      }
    ],
    "related": [
      {
        "text": "ESBE Incorporated home",
        "url": "https://esbeincorporated.org/"
      },
      {
        "text": "Donate to ESBE Incorporated",
        "url": "https://esbeincorporated.org/donate"
      }
    ]
  },
  {
    "path": "/terms",
    "mdPath": "/terms.md",
    "title": "Terms of Use | ESBE Incorporated",
    "h1": "Terms of Use",
    "description": "Terms of use for esbeincorporated.org and its public read-only MCP server: content as-is and no professional advice, donations via Every.org, MCP acceptable use, liability, California law.",
    "aiSummary": "Terms of use for esbeincorporated.org and its public read-only MCP server: content as-is and no professional advice, donations via Every.org, MCP acceptable use, liability, California law.",
    "lastUpdated": "2026-10-30",
    "sections": [
      {
        "heading": "Acceptance",
        "paragraphs": [
          "By using esbeincorporated.org - including its MCP server at /mcp - you agree to these terms. If you do not agree, do not use the site or the server."
        ]
      },
      {
        "heading": "Content and no professional advice",
        "paragraphs": [
          "Content on this site is provided for general information and is provided as is, without warranties of any kind. It is not legal, tax, medical, or benefits advice, and it is not a substitute for advice from a qualified professional about your own situation.",
          "ESBE Incorporated is a 501(c)(3) nonprofit organization, EIN 87-1218291. AIVA Claims is a charitable program of ESBE Incorporated. ESBE Incorporated is not affiliated with the U.S. Department of Veterans Affairs, and nothing on this site or in the MCP server's responses implies endorsement by the VA or any government agency."
        ]
      },
      {
        "heading": "Donations",
        "paragraphs": [
          "Donations are processed by Every.org under its own terms. Whether a gift is tax-deductible, and to what extent, depends on your own circumstances; consult your tax advisor. Donation links on this site go to Every.org; ESBE Incorporated does not collect or store payment card information."
        ]
      },
      {
        "heading": "MCP server use",
        "paragraphs": [
          "The MCP server is a public, read-only interface to content already published on this site. You may call its tools within its published rate limits. You may not use it to attempt to access non-public data, disrupt the service, bypass rate limits or security controls, or misrepresent the identity of the server, ESBE Incorporated, or AIVA Claims.",
          "An AI assistant's interpretation, summary, or use of the server's content is the responsibility of that assistant's provider and its user, not of ESBE Incorporated."
        ]
      },
      {
        "heading": "Third-party links and liability",
        "paragraphs": [
          "This site links to third-party websites and services; their content and terms are their own, and no endorsement is implied. To the maximum extent permitted by law, ESBE Incorporated is not liable for damages arising from use of this site or its MCP server, including reliance on its content. These terms are governed by the laws of the State of California."
        ]
      },
      {
        "heading": "Changes and contact",
        "paragraphs": [
          "If these terms change, the updated version will be posted at this URL with a new Last updated date. Questions: help@esbeincorporated.org or (802) 715-3723."
        ]
      }
    ],
    "related": [
      {
        "text": "ESBE Incorporated home",
        "url": "https://esbeincorporated.org/"
      },
      {
        "text": "Donate to ESBE Incorporated",
        "url": "https://esbeincorporated.org/donate"
      }
    ]
  },
  {
    "path": "/about",
    "mdPath": "/about.md",
    "title": "About | ESBE Incorporated",
    "h1": "A San Francisco nonprofit built around clarity",
    "description": "About ESBE Incorporated, a 501(c)(3) nonprofit organization based in San Francisco, California: who we are, what we do, and the organization details behind esbeincorporated.org.",
    "aiSummary": "About ESBE Incorporated, a 501(c)(3) nonprofit organization based in San Francisco, California: who we are, what we do, and the organization details behind esbeincorporated.org.",
    "lastUpdated": "2026-11-23",
    "sections": [
      {
        "heading": "Who we are",
        "paragraphs": [
          "ESBE Incorporated is a 501(c)(3) nonprofit organization based in San Francisco, California. It builds practical tools and clear information for veterans and people navigating government-facing services.",
          "The organization was founded by Barklee Sanders, who leads it as chief executive. ESBE Incorporated is independent and does not speak for or act on behalf of any government agency."
        ]
      },
      {
        "heading": "Organization details",
        "facts": [
          [
            "Organization",
            "ESBE Incorporated"
          ],
          [
            "Federal status",
            "501(c)(3) nonprofit organization"
          ],
          [
            "Federal tax exemption effective",
            "May 1, 2026"
          ],
          [
            "California corporation number",
            "C4752548"
          ],
          [
            "Registered address",
            "1070 Bridgeview Way, Apt 1010, San Francisco, CA 94158"
          ],
          [
            "Chief executive",
            "Barklee Sanders"
          ],
          [
            "Government relationship",
            "Independent nonprofit; not a government agency."
          ]
        ],
        "links": [
          {
            "text": "Read the IRS determination letter",
            "url": "https://apps.irs.gov/pub/epostcard/dl/FinalLetter_87-1218291_ESBEINCORPORATED_05012026_v1.0.pdf"
          },
          {
            "text": "Search the IRS Tax Exempt Organization Search",
            "url": "https://apps.irs.gov/app/eos/"
          }
        ]
      },
      {
        "heading": "What we do",
        "paragraphs": [
          "Our work has two parts: AIVA Claims, free donor-funded help that helps veterans prepare VA disability claims they file themselves; and public-interest services — accessible technology and plain-language information that help people understand and use government-facing services."
        ],
        "links": [
          {
            "text": "Programs and services",
            "url": "https://esbeincorporated.org/programs"
          },
          {
            "text": "How to file a VA disability claim — a step-by-step guide",
            "url": "https://esbeincorporated.org/va-claim-guide"
          },
          {
            "text": "Community — Treasure Island community work",
            "url": "https://esbeincorporated.org/community"
          }
        ]
      },
      {
        "heading": "Transparency",
        "paragraphs": [
          "ESBE Incorporated publishes its organization details, its IRS determination letter, and its program relationships on this site so anyone can verify who operates esbeincorporated.org and aivaclaims.com.",
          "ESBE Incorporated is a 501(c)(3) nonprofit organization, EIN 87-1218291. AIVA Claims is a charitable program of ESBE Incorporated. ESBE Tech is a separate for-profit technology company. ESBE Incorporated is not affiliated with or endorsed by the U.S. Department of Veterans Affairs."
        ],
        "links": [
          {
            "text": "Request governance or filing information",
            "url": "mailto:help@esbeincorporated.org?subject=ESBE%20Incorporated%20transparency%20request"
          }
        ]
      }
    ],
    "related": [
      {
        "text": "Programs and services",
        "url": "https://esbeincorporated.org/programs"
      },
      {
        "text": "Contact ESBE Incorporated",
        "url": "https://esbeincorporated.org/contact"
      },
      {
        "text": "Donate to ESBE Incorporated",
        "url": "https://esbeincorporated.org/donate"
      }
    ]
  },
  {
    "path": "/programs",
    "mdPath": "/programs.md",
    "title": "Programs & Services | ESBE Incorporated",
    "h1": "Programs that help people move forward",
    "description": "ESBE Incorporated's programs and services: AIVA Claims, free donor-funded help preparing VA disability claims; public-interest services; and independent civic projects.",
    "aiSummary": "ESBE Incorporated's programs and services: AIVA Claims, free donor-funded help preparing VA disability claims; public-interest services; and independent civic projects.",
    "lastUpdated": "2026-11-23",
    "sections": [
      {
        "heading": "AIVA Claims (veteran support)",
        "paragraphs": [
          "AIVA Claims is ESBE Incorporated's veteran support program. It helps veterans understand and prepare VA disability claims at no cost to them; the work is funded by donations.",
          "AIVA Claims helps a veteran organize records, understand the claims process, and prepare claim materials. Veterans review, edit, and file everything themselves with the U.S. Department of Veterans Affairs — AIVA Claims does not file claims with the VA, and ESBE Incorporated is not affiliated with the VA."
        ],
        "bullets": [
          "Create your free account",
          "Upload your records",
          "Review your draft claim package",
          "File it yourself with the VA"
        ],
        "links": [
          {
            "text": "AIVA Claims — create your free account",
            "url": "https://aivaclaims.com/sign-up?utm_source=esbeincorporated.org&utm_medium=nonprofit_site&utm_campaign=programs_cta"
          },
          {
            "text": "How to file a VA disability claim — a step-by-step guide",
            "url": "https://esbeincorporated.org/va-claim-guide"
          },
          {
            "text": "Nexus letters — what they are and when a claim needs one",
            "url": "https://esbeincorporated.org/nexus-letter"
          }
        ]
      },
      {
        "heading": "Public-interest services",
        "paragraphs": [
          "Accessible technology and plain-language information that help people understand and use government-facing services.",
          "This work includes the public guides published on this site and the civic projects below."
        ]
      },
      {
        "heading": "Selected civic projects",
        "paragraphs": [
          "These independent public projects make government-facing information and reporting paths more understandable. They do not represent or act for a government agency."
        ],
        "links": [
          {
            "text": "Hospital Ledger",
            "url": "https://hospitalledger.com"
          },
          {
            "text": "San Francisco Permit Navigator",
            "url": "https://sf-permit-navigator.barkleesanders.workers.dev/"
          },
          {
            "text": "ImproveBayArea",
            "url": "https://improvebayarea.com"
          },
          {
            "text": "National Park Service Report",
            "url": "https://improvebayarea.com/nps-report"
          },
          {
            "text": "San Francisco Income Verify",
            "url": "https://sf-income-verify.barkleesanders.workers.dev/"
          },
          {
            "text": "Treasure Island Power",
            "url": "https://treasureislandsfpoweroutages.com"
          }
        ]
      },
      {
        "heading": "Community work",
        "paragraphs": [
          "ESBE Incorporated supports public documentation and accountability work for Treasure Island residents, including the Treasure Island Power outage tracker."
        ],
        "links": [
          {
            "text": "Community — Treasure Island community work",
            "url": "https://esbeincorporated.org/community"
          }
        ]
      },
      {
        "heading": "Transparency",
        "facts": [
          [
            "Organization",
            "ESBE Incorporated"
          ],
          [
            "Federal status",
            "501(c)(3) nonprofit organization"
          ],
          [
            "Registered address",
            "1070 Bridgeview Way, Apt 1010, San Francisco, CA 94158"
          ],
          [
            "Program relationship",
            "AIVA Claims is a program of ESBE Incorporated."
          ]
        ],
        "links": [
          {
            "text": "Read the IRS determination letter",
            "url": "https://apps.irs.gov/pub/epostcard/dl/FinalLetter_87-1218291_ESBEINCORPORATED_05012026_v1.0.pdf"
          }
        ]
      }
    ],
    "related": [
      {
        "text": "About ESBE Incorporated",
        "url": "https://esbeincorporated.org/about"
      },
      {
        "text": "Contact ESBE Incorporated",
        "url": "https://esbeincorporated.org/contact"
      },
      {
        "text": "Donate to ESBE Incorporated",
        "url": "https://esbeincorporated.org/donate"
      }
    ]
  },
  {
    "path": "/contact",
    "mdPath": "/contact.md",
    "title": "Contact | ESBE Incorporated",
    "h1": "Contact ESBE Incorporated",
    "description": "Contact ESBE Incorporated: email, phone, and the registered mailing address for public inquiries, governance requests, and nonprofit correspondence.",
    "aiSummary": "Contact ESBE Incorporated: email, phone, and the registered mailing address for public inquiries, governance requests, and nonprofit correspondence.",
    "lastUpdated": "2026-11-23",
    "sections": [
      {
        "heading": "How to reach us",
        "paragraphs": [
          "For public inquiries, governance requests, and nonprofit correspondence, reach us by email or phone.",
          "Email: help@esbeincorporated.org · Phone: (802) 715-3723",
          "Mailing and registered address: ESBE Incorporated, 1070 Bridgeview Way, Apt 1010, San Francisco, CA 94158."
        ],
        "links": [
          {
            "text": "Email ESBE Incorporated",
            "url": "mailto:help@esbeincorporated.org"
          },
          {
            "text": "Request governance or filing information",
            "url": "mailto:help@esbeincorporated.org?subject=ESBE%20Incorporated%20transparency%20request"
          }
        ]
      },
      {
        "heading": "AIVA Claims support",
        "paragraphs": [
          "AIVA Claims is a program of ESBE Incorporated. For help with an AIVA Claims account or with a claim you are preparing, start at AIVA Claims."
        ],
        "links": [
          {
            "text": "AIVA Claims",
            "url": "https://aivaclaims.com"
          },
          {
            "text": "AIVA Claims — create your free account",
            "url": "https://aivaclaims.com/sign-up?utm_source=esbeincorporated.org&utm_medium=nonprofit_site&utm_campaign=programs_cta"
          }
        ]
      },
      {
        "heading": "Organization details",
        "facts": [
          [
            "Organization",
            "ESBE Incorporated"
          ],
          [
            "Federal status",
            "501(c)(3) nonprofit organization"
          ],
          [
            "Registered address",
            "1070 Bridgeview Way, Apt 1010, San Francisco, CA 94158"
          ]
        ],
        "links": [
          {
            "text": "Read the IRS determination letter",
            "url": "https://apps.irs.gov/pub/epostcard/dl/FinalLetter_87-1218291_ESBEINCORPORATED_05012026_v1.0.pdf"
          }
        ]
      }
    ],
    "related": [
      {
        "text": "About ESBE Incorporated",
        "url": "https://esbeincorporated.org/about"
      },
      {
        "text": "Programs and services",
        "url": "https://esbeincorporated.org/programs"
      },
      {
        "text": "Donate to ESBE Incorporated",
        "url": "https://esbeincorporated.org/donate"
      }
    ]
  }
];
