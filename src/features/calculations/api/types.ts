export interface Calculation {
  id: number
  name: string
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

export interface CalculationRow {
  id: number
  description: string
  quantity: number
  unit: string
  pricePerUnit: number
  co2: number
  account: string
  resource: string
  note: string
}

export interface OptionRow {
  id: number
  description: string
  quantity: number
  unit: string
  pricePerUnit: number
}

export interface CalculationSection {
  id: number
  name: string
  amount: number
  expanded?: boolean
  rows?: CalculationRow[]
}

export interface NewCalculationProps {
  template?: CalculationTemplate
  onClose: () => void
  onSaveSuccess?: () => void
  initialCalculationName?: string
  initialProjectName?: string
}

