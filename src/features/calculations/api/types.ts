export interface Calculation {
  id: number
  name: string
  url: string
  project: string
  status: 'Aktiv' | 'Avslutad'
  amount: string
  created: string
  createdBy: string
  revision?: string
}

export interface CalculationTemplate {
  name: string
  sections: TemplateSection[]
}

export interface TemplateSection {
  name: string
  rows?: TemplateRow[]
}

export interface TemplateRow {
  description: string
  quantity: number
  unit: string
  pricePerUnit: number
  co2?: number
  account?: string
  resource?: string
  note?: string
}

