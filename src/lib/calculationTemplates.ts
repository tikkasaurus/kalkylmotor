import type { CalculationTemplate } from '@/components/CalculationView'

export interface TemplateMetadata {
  id: string
  title: string
  description: string
  popular: boolean
  template: CalculationTemplate
}

export const calculationTemplates: TemplateMetadata[] = [
  {
    id: 'empty',
    title: 'Tom kalkyl',
    description: 'Starta från en tom kalkyl och bygg upp ditt projekt från grunden',
    popular: false,
    template: {
      name: 'Empty Template',
      sections: [
        { name: 'Section 1' },
        { name: 'Section 2' },
        { name: 'Section 3' },
      ],
    },
  },
  {
    id: 'generalContracting',
    title: 'General Contracting',
    description: 'Komplett mall för byggprojekt med mark, stomme och installationer',
    popular: true,
    template: {
      name: 'General Contracting',
      sections: [
        {
          name: 'Mark',
          rows: [
            { description: 'Markarbeten', quantity: 3400, unit: 'm2', pricePerUnit: 280 },
            { description: 'Betongplatta på mark', quantity: 3400, unit: 'm2', pricePerUnit: 890, account: '4010 -...' },
            { description: 'Schaktning', quantity: 2800, unit: 'm3', pricePerUnit: 145 },
            { description: 'Dränering', quantity: 420, unit: 'm', pricePerUnit: 320 },
            { description: 'Återfyllning', quantity: 1200, unit: 'm3', pricePerUnit: 95 },
            { description: 'VA-anslutningar', quantity: 1, unit: 'st', pricePerUnit: 485000 },
          ],
        },
        { name: 'Stomme' },
        { name: 'Yttertak' },
        { name: 'Fasader' },
        { name: 'Stomkompl./rumsbildn.' },
        { name: 'Inv ytskikt/rumskompl.' },
        { name: 'UE' },
      ],
    },
  },
  {
    id: 'residential',
    title: 'Bostäder flerfamiljshus',
    description: 'Optimerad för bostadsprojekt med standardrum och installationer',
    popular: true,
    template: {
      name: 'Residential Building',
      sections: [
        {
          name: 'Mark',
          rows: [
            { description: 'Markberedning', quantity: 1000, unit: 'm2', pricePerUnit: 45 },
            { description: 'Schaktning', quantity: 600, unit: 'm3', pricePerUnit: 180 },
            { description: 'Grusbädd', quantity: 400, unit: 'm3', pricePerUnit: 320 },
          ],
        },
        {
          name: 'Grund',
          rows: [
            { description: 'Betongplatta', quantity: 500, unit: 'm2', pricePerUnit: 890, account: '4010 -...' },
            { description: 'Armering', quantity: 5, unit: 'ton', pricePerUnit: 12000, co2: 1850 },
          ],
        },
        { name: 'Stomme' },
        { name: 'Tak' },
        { name: 'Fasad' },
        { name: 'Innerväggar' },
        { name: 'VS' },
        { name: 'El' },
        { name: 'Ventilation' },
        { name: 'Ytskikt' },
      ],
    },
  },
  {
    id: 'renovation',
    title: 'Renovering & ombyggnad',
    description: 'Anpassad för renoveringsprojekt med rivning och befintliga konstruktioner',
    popular: false,
    template: {
      name: 'Renovation',
      sections: [
        {
          name: 'Rivning',
          rows: [
            { description: 'Rivning innerväggar', quantity: 150, unit: 'm2', pricePerUnit: 450 },
            { description: 'Sanering', quantity: 200, unit: 'm2', pricePerUnit: 320 },
          ],
        },
        { name: 'Stomkomplettering' },
        { name: 'Nya innerväggar' },
        { name: 'Ytskikt' },
        { name: 'VS' },
        { name: 'El' },
        { name: 'Ventilation' },
      ],
    },
  },
  {
    id: 'industrial',
    title: 'Industribyggnad',
    description: 'Mall för industribyggnader med kompletta sektioner och standardvärden',
    popular: true,
    template: {
      name: 'Industrial Building',
      sections: [
        {
          name: 'Mark och grund',
          rows: [
            { description: 'Markarbeten', quantity: 5000, unit: 'm2', pricePerUnit: 65 },
            { description: 'Betongplatta', quantity: 4500, unit: 'm2', pricePerUnit: 950 },
          ],
        },
        {
          name: 'Stomme',
          rows: [
            { description: 'Stålstomme', quantity: 80, unit: 'ton', pricePerUnit: 25000 },
            { description: 'Fasadbalkar', quantity: 40, unit: 'ton', pricePerUnit: 28000 },
          ],
        },
        { name: 'Tak' },
        { name: 'Fasad' },
        { name: 'Portar' },
        { name: 'Kontor och social del' },
        { name: 'Installationer' },
      ],
    },
  },
  {
    id: 'office',
    title: 'Kontorsbyggnad',
    description: 'Mall för kontorsprojekt med fokus på inredning och tekniska system',
    popular: false,
    template: {
      name: 'Office Building',
      sections: [
        { name: 'Mark' },
        { name: 'Grund' },
        { name: 'Stomme' },
        { name: 'Tak' },
        { name: 'Fasad' },
        {
          name: 'Innerväggar och dörrar',
          rows: [
            { description: 'Gipsväggar', quantity: 800, unit: 'm2', pricePerUnit: 850 },
            { description: 'Glaspartier', quantity: 120, unit: 'm2', pricePerUnit: 3500 },
          ],
        },
        { name: 'Tak och golv' },
        { name: 'VS' },
        { name: 'El' },
        { name: 'Ventilation' },
        { name: 'IT-infrastruktur' },
      ],
    },
  },
  {
    id: 'infrastructure',
    title: 'Infrastruktur',
    description: 'Mall för infrastrukturprojekt med vägar, ledningar och anläggningar',
    popular: false,
    template: {
      name: 'Infrastructure',
      sections: [
        {
          name: 'Markarbeten',
          rows: [
            { description: 'Schakt och fyllning', quantity: 5000, unit: 'm3', pricePerUnit: 180 },
            { description: 'Befintlig ledning', quantity: 500, unit: 'm', pricePerUnit: 1200 },
          ],
        },
        { name: 'Väg och gata' },
        { name: 'VA-ledningar' },
        { name: 'Dränering' },
        { name: 'Belysning' },
        { name: 'Grönområden' },
      ],
    },
  },
]

// Helper to get template by ID
export function getTemplateById(templateId: string): CalculationTemplate | undefined {
  const metadata = calculationTemplates.find((t) => t.id === templateId)
  return metadata?.template
}

// Helper to get template metadata by ID
export function getTemplateMetadata(templateId: string): TemplateMetadata | undefined {
  return calculationTemplates.find((t) => t.id === templateId)
}

// Get all template metadata (for listing in UI)
export function getAllTemplateMetadata(): TemplateMetadata[] {
  return calculationTemplates
}

// Legacy support - get template by old name
export function getTemplate(templateName: string): CalculationTemplate | undefined {
  return getTemplateById(templateName)
}

// Get all template names
export function getTemplateNames(): string[] {
  return calculationTemplates.map((t) => t.id)
}

// Create a custom template
export function createCustomTemplate(
  name: string,
  sectionNames: string[]
): CalculationTemplate {
  return {
    name,
    sections: sectionNames.map((sectionName) => ({ name: sectionName })),
  }
}

