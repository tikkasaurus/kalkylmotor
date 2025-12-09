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

export interface CalculationSubsection {
  id: number
  name: string
  amount: number
  expanded?: boolean
  rows?: CalculationRow[]
}

export interface CalculationSection {
  id: number
  name: string
  amount: number
  expanded?: boolean
  subsections?: CalculationSubsection[]
}

export interface NewCalculationProps {
  template?: CalculationTemplate
  existingCalculation?: CreateCalculationRequest
  existingCalculationLoading?: boolean
  existingCalculationError?: unknown
  costEstimateId?: string
  onClose: () => void
  onSaveSuccess?: () => void
  initialCalculationName?: string
}



export type CostEstimateResponse = {
  id: number
  name: string
  currentVersionId: number
  currentVersionName: string
  currentVersionNo: string
  projectId: number
  status: string
  revision: string
  amount: string
  projectName: string
  createdBy: string
  created: string
}[];

export type CreateCalculationRequest = {
  sections: CalculationSectionPayload[]
  optionBudgetRows: OptionBudgetRowPayload[]
}

export type CalculationSectionPayload = {
  id: number
  title: string
  subSections: CalculationSectionPayload[]
  budgetRows: BudgetRowPayload[]
}

export type BudgetRowPayload = {
  id: number
  sectionId: number
  accountNo: number
  name: string
  quantity: number
  price: number
  amount: number
  markupAmount: number
  markupPercent: number
  waste: number
  notes: string
  budgetActivityId: number
  budgetLocationId: number
  co2CostId: number
}

export type OptionBudgetRowPayload = {
  id: number
  sectionId: number
  accountNo: number
  name: string
  quantity: number
  price: number
  amount: number
  markupAmount: number
  markupPercent: number
  waste: number
  notes: string
  budgetActivityId: number
  budgetLocationId: number
  co2CostId: number
}