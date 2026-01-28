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

export type BookkeepingAccountResponse = {
  count: number
  data: {
    accountNo: number
    name: string
    accountGroupId: number
    accountGroupName: string
    aggregateToAccountNo: number
    prevAccountNo: number
    accountGroupSortOrder: number
  }[]
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
  id?: number
  description: string
  quantity: number
  formula?: string
  unit: string
  pricePerUnit: number
  co2: number
  co2CostId: number
  account: string
  resource: string
  note: string
}

export interface CalculationSubSubsection {
  id?: number
  name: string
  amount: number
  expanded?: boolean
  rows?: CalculationRow[]
}

export interface OptionRow {
  id?: number
  description: string
  quantity: number
  unit: string
  pricePerUnit: number
}

export interface CalculationSubsection {
  id?: number
  name: string
  amount: number
  expanded?: boolean
  rows?: CalculationRow[]
  subSubsections?: CalculationSubSubsection[]
}

export interface CalculationSection {
  id?: number
  name: string
  amount: number
  expanded?: boolean
  subsections?: CalculationSubsection[]
}

export interface NewCalculationProps {
  template?: CalculationTemplate
  existingCalculation?: GetCalculationsReponse
  existingCalculationLoading?: boolean
  existingCalculationError?: unknown
  costEstimateId?: string
  onClose: () => void
  initialCalculationName?: string
}



export type CostEstimateResponse = {
  id: number,
  name: string,
  currentVersionId: number,
  projectId: number,
  projectName: string,
  status: "Active" | "Created",
  createdBy: string,
  createdByName: string,
  created: string,
  versionName: string,
  versionNo: string,
  versionAmount: string
}[];

export type InitializeCostEstimateResponse = {
  id: number
}

export type UnitTypeResponse = {
  "count": number,
  "data": [
    {
      "id": number,
      "name": string,
      "shortName": string
    }
  ]
};

export type ProjectsResponse = {
  "count": number,
  "data": [
    {
      "id": number,
      "name": string
    }
  ]
};

export type CO2Response = {
  "count": number,
  "data": [
    {
      id: number,
      name: string,
      value: number,
      unitTypeName: string,
      categoryName: string,
      unitTypeCo2Name: string
    },
  ]
};

export type CreateCalculationRequest = {
  name: string
  co2Budget: number
  budget: number
  amount: number
  calculatedFeeAmount: number
  fee: number
  squareMeter: number
  sections: CalculationSectionPayload[]
  optionBudgetRows: OptionBudgetRowPayload[]
}

export type GetCalculationsReponse = CreateCalculationRequest & {
  id: number
};

export type CopyCostEstimateResponse = GetCalculationsReponse;

export type CalculationSectionPayload = {
  id?: number
  title: string
  subSections: CalculationSectionPayload[]
  budgetRows: BudgetRowPayload[]
}

export type BudgetRowPayload = {
  id?: number
  sectionId: number
  accountNo: number
  name: string
  quantity: number
  price: number
  amount: number
  notes: string
  co2CostId: number
}

export type OptionBudgetRowPayload = {
  id?: number
  accountNo: number
  name: string
  quantity: number
  price: number
  amount: number
}