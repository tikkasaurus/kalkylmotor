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
  clientKey: string
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
  waste: number
  customerPrice: number | null
  markupAmount: number | null
  markupPercent: number | null
  revenue: number
}

export interface CalculationSubSubsection {
  id?: number
  clientKey: string
  name: string
  amount: number
  expanded?: boolean
  rows?: CalculationRow[]
}

export interface OptionRow {
  id?: number
  clientKey: string
  description: string
  quantity: number
  unit: string
  pricePerUnit: number
  customerPrice: number | null
  markupAmount: number | null
  markupPercent: number | null
  revenue: number
}

export interface CalculationSubsection {
  id?: number
  clientKey: string
  name: string
  amount: number
  expanded?: boolean
  rows?: CalculationRow[]
  subSubsections?: CalculationSubSubsection[]
}

export interface CalculationSection {
  id?: number
  clientKey: string
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
  defaultProject?: { id: number; name: string } | null
  /**
   * When set, the editor opens in read-only mode showing the specified version.
   * Hides save UI, disables autosave, and shows a banner with an option to make this version current.
   */
  viewVersionId?: number
  /**
   * Called when the user picks a different version from the in-editor dropdown.
   * Parent should update its `viewVersionId` so the editor refetches and re-renders.
   */
  onSelectVersion?: (versionId: number) => void
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
  customerName: string,
  versionName: string,
  versionNo: string,
  versionAmount: string,
  versions?: CostEstimateVersion[]
}[];

export type CostEstimateVersion = {
  id: number,
  versionNo: string,
  versionName: string,
  amount: string,
  created: string,
  createdBy: string,
  createdByName: string,
  isCurrent: boolean
};

export type InitializeCostEstimateRequest = {
  id?: number
  name?: string
  currentVersionId?: number
  currentVersionName?: string
  projectId?: number
  customerId?: number
  status?: "Created"
}

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

export interface Customer {
  id: number
  name: string
  legalEntityType?: "Company" | string
  organizationNo?: string
  customerNo?: string
  deliveryPostalArea?: string
  deliveryPostalAddress?: string
  deliveryPostalNo?: string
  hasFTax?: boolean
  hasVAT?: boolean
  hasWarning?: boolean
  hasEmployerContributions?: boolean
  ediNumber?: string
  glnNumber?: string
  peppolId?: string
  contactEmail?: string
  linkUrl?: string
}

export interface CustomerSearchResponse {
  count: number
  data: Customer[]
}

export type CreateCalculationRequest = {
  name: string
  co2Budget: number
  budget: number
  amount: number
  calculatedFeeAmount: number
  calculatedFeePercent: number
  fee: number
  feeGoal: number
  showFeeGoal: boolean
  squareMeter: number
  customerId?: number
  customerName?: string
  customer?: Customer
  projectId?: number
  projectName?: string
  sections: CalculationSectionPayload[]
  optionBudgetRows: OptionBudgetRowPayload[]
}

export type GetCalculationsReponse = CreateCalculationRequest & {
  id: number
  currentVersionId?: number
  loadedVersionId?: number
  loadedVersionNo?: number
  versionNo?: string
  versionName?: string
  versions?: CostEstimateVersion[]
};

export type CopyCostEstimateResponse = GetCalculationsReponse;

export const DiffOperation = {
  NoOp: 0,
  Add: 1,
  Update: 2,
  Delete: 3,
} as const

export type DiffOperation = (typeof DiffOperation)[keyof typeof DiffOperation]

export type CalculationSectionPayload = {
  id?: number
  title: string
  subSections: CalculationSectionPayload[]
  budgetRows: BudgetRowPayload[]
  operation?: DiffOperation
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
  waste: number
  formula?: string
  customerPrice?: number | null
  markupAmount?: number | null
  markupPercent?: number | null
  revenue: number
  operation?: DiffOperation
}

export type OptionBudgetRowPayload = {
  id?: number
  accountNo: number
  name: string
  quantity: number
  price: number
  amount: number
  customerPrice?: number | null
  markupAmount?: number | null
  markupPercent?: number | null
  revenue: number
  operation?: DiffOperation
}