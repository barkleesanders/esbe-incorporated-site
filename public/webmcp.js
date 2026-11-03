const sections = {
  mission: 'Our mission: veteran support and public-interest access to government-facing services.',
  programs:
    'AIVA Claims plus selected public civic projects: Hospital Ledger, SF Permit Navigator, ImproveBayArea, NPS Report, SF Income Verify, and Treasure Island Power.',
  transparency: 'ESBE Incorporated identity, EIN, and transparency resources.',
  contact:
    'Public contact for ESBE Incorporated: help@esbeincorporated.org and (802) 715-3723. Use these for public inquiries, governance requests, and nonprofit correspondence.',
};

const response = (text) => ({ content: [{ type: 'text', text }] });
const context = document.modelContext;

if (context?.registerTool) {
  const safeRegister = async (tool) => {
    try {
      await context.registerTool(tool);
    } catch (error) {
      console.debug('WebMCP registration unavailable', error);
    }
  };

  safeRegister({
    name: 'get_esbe_site_overview',
    description:
      'Returns a concise public overview of ESBE Incorporated, its mission, and available sections.',
    execute: () =>
      response(
        `ESBE Incorporated is a 501(c)(3) nonprofit organization (EIN 87-1218291). It operates AIVA Claims for disabled veterans and develops public-interest tools and information that make government-facing services easier to understand. Its site also lists selected independent civic projects: Hospital Ledger, SF Permit Navigator, ImproveBayArea, NPS Report, SF Income Verify, and Treasure Island Power. ESBE is independent and not a government agency. Sections: ${Object.keys(sections).join(', ')}.`,
      ),
  });

  safeRegister({
    name: 'open_esbe_section',
    description:
      'Navigates the visible public page to a requested section. This tool only scrolls the page; it does not submit, send, donate, or change data.',
    inputSchema: {
      type: 'object',
      properties: {
        section: {
          type: 'string',
          enum: Object.keys(sections),
          description: 'Public site section to open.',
        },
      },
      required: ['section'],
    },
    execute: ({ section }) => {
      const target = document.getElementById(section);
      if (!target) return response(`Section "${section}" is not available.`);
      history.pushState(null, '', `#${section}`);
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      target.focus({ preventScroll: true });
      return response(`Opened ${section}: ${sections[section]}`);
    },
  });
}
