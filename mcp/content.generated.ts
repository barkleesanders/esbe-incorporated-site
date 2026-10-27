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
    "lastUpdated": "2026-09-22",
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
  }
];
