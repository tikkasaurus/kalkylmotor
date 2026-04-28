import { useState, useMemo, useEffect, useRef } from 'react'
import type {
  CalculationTemplate,
  CalculationSection,
  CalculationSubsection,
  CalculationRow,
  CalculationSubSubsection,
  OptionRow,
  CreateCalculationRequest,
  GetCalculationsReponse,
  CalculationSectionPayload,
  BudgetRowPayload,
  OptionBudgetRowPayload,
  Customer,
} from '@/features/calculations/api/types'
import type { Project } from '@/features/calculations/components/ProjectSearchCombobox'
import { useGetCO2Database } from '@/features/calculations/api/queries'

function applyRowFieldUpdate(row: CalculationRow, field: keyof CalculationRow, value: string | number): CalculationRow {
  if (field === 'customerPrice' || field === 'markupAmount' || field === 'markupPercent') {
    const numValue = (typeof value === 'number' ? value : Number(value)) || 0
    if (numValue === 0) {
      // Just clear this field, keep the others untouched
      return { ...row, [field]: null }
    }
    // Non-zero: set this field and clear the others
    return {
      ...row,
      customerPrice: field === 'customerPrice' ? numValue : null,
      markupAmount: field === 'markupAmount' ? numValue : null,
      markupPercent: field === 'markupPercent' ? numValue : null,
    }
  }
  return { ...row, [field]: value }
}

function computeRowRevenue(row: CalculationRow): number {
  const cost = row.quantity * row.pricePerUnit * (1 + row.waste)
  if (row.customerPrice != null && row.customerPrice !== 0) {
    return row.quantity * row.customerPrice
  }
  if (row.markupAmount != null && row.markupAmount !== 0) {
    return cost + row.markupAmount
  }
  if (row.markupPercent != null && row.markupPercent !== 0) {
    return cost * (1 + row.markupPercent / 100)
  }
  // No pricing set: revenue equals cost
  return cost
}

function computeOptionRevenue(option: OptionRow): number {
  const cost = option.quantity * option.pricePerUnit
  if (option.customerPrice != null && option.customerPrice !== 0) {
    return option.quantity * option.customerPrice
  }
  if (option.markupAmount != null && option.markupAmount !== 0) {
    return cost + option.markupAmount
  }
  if (option.markupPercent != null && option.markupPercent !== 0) {
    return cost * (1 + option.markupPercent / 100)
  }
  // No pricing set: revenue equals cost
  return cost
}

// Factory function to create sections from template
function createSectionsFromTemplate(template: CalculationTemplate): CalculationSection[] {
  return template.sections.map((section, index) => {
    // For now, create a default subsection with all rows
    // This can be enhanced later to support subsections in templates
    const rows: CalculationRow[] = (section.rows || []).map((row, rowIndex) => ({
      id: rowIndex + 1,
      description: row.description,
      quantity: row.quantity,
      formula: '',
      unit: row.unit,
      pricePerUnit: row.pricePerUnit,
      co2: row.co2 || 0,
      co2CostId: 0,
      account: row.account || 'Välj konto',
      resource: row.resource || '',
      note: row.note || '',
      waste: 0,
      customerPrice: null,
      markupAmount: null,
      markupPercent: null,
      revenue: 0,
    }))

    const subsectionAmount = rows.reduce((sum, row) => sum + (row.quantity * row.pricePerUnit * (1 + row.waste)), 0)

    const subsection: CalculationSubsection = {
      id: 1,
      name: 'Nivå 2',
      amount: subsectionAmount,
      expanded: false,
      rows,
    }

    return {
      id: index + 1,
      name: section.name,
      amount: subsectionAmount,
      expanded: false,
      subsections: [subsection],
    }
  })
}

function mapBudgetRowToCalculationRow(row: BudgetRowPayload): CalculationRow {
  return {
    id: row.id,
    description: row.name,
    quantity: row.quantity,
    formula: row.formula || '',
    unit: 'st',
    pricePerUnit: row.price,
    co2: 0,
    co2CostId: row.co2CostId || 0,
    account: row.accountNo ? String(row.accountNo) : 'Välj konto',
    resource: '',
    note: row.notes,
    waste: row.waste || 0,
    customerPrice: row.customerPrice ?? null,
    markupAmount: row.markupAmount ?? null,
    markupPercent: (row as any).markupPercent ?? null,
    revenue: row.revenue || 0,
  }
}

function buildSubsectionsFromPayload(
  section: CalculationSectionPayload,
  counter: { current: number }
): CalculationSubsection[] {
  const subsections: CalculationSubsection[] = []

  // section.subSections are the first level ("subsections")
  ;(section.subSections || []).forEach((payloadSubsection) => {
    const rows = (payloadSubsection.budgetRows || []).map(mapBudgetRowToCalculationRow)
    const subsectionOwnRowsAmount = rows.reduce((sum, row) => sum + row.quantity * row.pricePerUnit * (1 + row.waste), 0)

    const subSubsections: CalculationSubSubsection[] = (payloadSubsection.subSections || []).map(
      (payloadSubSubsection) => {
        const subRows = (payloadSubSubsection.budgetRows || []).map(mapBudgetRowToCalculationRow)
        const subAmount = subRows.reduce((sum, row) => sum + row.quantity * row.pricePerUnit * (1 + row.waste), 0)

        return {
          id: payloadSubSubsection.id ?? counter.current++,
          name: payloadSubSubsection.title || 'Nivå 3',
          amount: subAmount,
          expanded: false,
          rows: subRows,
        }
      }
    )

    const subSubAmount = subSubsections.reduce((sum, s) => sum + s.amount, 0)
    const subsectionAmount = subsectionOwnRowsAmount + subSubAmount

    subsections.push({
      id: payloadSubsection.id ?? counter.current++,
      name: payloadSubsection.title || 'Nivå 2',
      amount: subsectionAmount,
      expanded: false,
      rows,
      subSubsections,
    })
  })

  return subsections
}

function buildSectionsFromPayload(payload?: CreateCalculationRequest): CalculationSection[] {
  if (!payload?.sections || payload.sections.length === 0) {
    return [];
  }

  return payload.sections.map((section) => {
    const counter = { current: 1 }
    const subsections = buildSubsectionsFromPayload(section, counter)
    const sectionAmount = subsections.reduce((sum, sub) => sum + sub.amount, 0)

    return {
      id: section.id,
      name: section.title,
      amount: sectionAmount,
      expanded: false,
      subsections,
    }
  })
}

function mapOptionsFromPayload(optionBudgetRows?: OptionBudgetRowPayload[]): OptionRow[] {
  if (!optionBudgetRows) return []

  return optionBudgetRows.map((row) => ({
    id: row.id,
    description: row.name,
    quantity: row.quantity,
    unit: 'st',
    pricePerUnit: row.price,
    customerPrice: row.customerPrice ?? null,
    markupAmount: row.markupAmount ?? null,
    markupPercent: (row as any).markupPercent ?? null,
    revenue: row.revenue || 0,
  }))
}

export function useNewCalculationState(
  template?: CalculationTemplate,
  existingCalculation?: CreateCalculationRequest,
  defaultProject?: { id: number; name: string } | null,
) {
  // Use template if provided, otherwise prefer existing calculation, otherwise default
  const defaultSections: CalculationSection[] = template
    ? createSectionsFromTemplate(template)
    : buildSectionsFromPayload(existingCalculation)
  
  const [sections, setSections] = useState(defaultSections)
  const [options, setOptions] = useState<OptionRow[]>(
    template ? [] : mapOptionsFromPayload(existingCalculation?.optionBudgetRows)
  )
  const [rateGoal, setRateGoal] = useState(existingCalculation?.feeGoal ?? 8)
  const [showRateGoal, setShowRateGoal] = useState(existingCalculation?.showFeeGoal ?? false)
  const [area, setArea] = useState(0)
  const [co2Budget, setCo2Budget] = useState(0)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    existingCalculation?.customer ||
    (existingCalculation?.customerId && existingCalculation?.customerName
      ? { id: existingCalculation.customerId, name: existingCalculation.customerName }
      : null)
  )
  const [selectedProject, setSelectedProject] = useState<Project | null>(
    existingCalculation?.projectId && existingCalculation?.projectName
      ? { id: existingCalculation.projectId, name: existingCalculation.projectName }
      : defaultProject || null
  )
  const [co2ModalOpen, setCo2ModalOpen] = useState(false)
  const [selectedRowForCO2, setSelectedRowForCO2] = useState<{
    sectionId: number
    subsectionId: number
    subSubsectionId?: number
    rowId: number
  } | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const markDirty = () => setIsDirty(true)
  const markSaved = () => setIsDirty(false)
  const lastInitializedIdRef = useRef<number | undefined>(undefined)
  const { data: co2Items = [] } = useGetCO2Database()
  const co2ValueById = useMemo(() => {
    const map = new Map<number, number>()
    for (const item of co2Items) {
      map.set(item.id, item.co2Value)
    }
    return map
  }, [co2Items])

  useEffect(() => {
    if (!existingCalculation) return
    const calcId = (existingCalculation as { id?: number }).id
    if (calcId !== undefined && calcId === lastInitializedIdRef.current) return
    lastInitializedIdRef.current = calcId

    setSections(buildSectionsFromPayload(existingCalculation))
    setOptions(mapOptionsFromPayload(existingCalculation.optionBudgetRows))
    setArea(existingCalculation.squareMeter ?? 0)
    setRateGoal(existingCalculation.feeGoal ?? 8)
    setShowRateGoal(existingCalculation.showFeeGoal ?? false)
    setCo2Budget(existingCalculation.co2Budget ?? 0)
    setSelectedCustomer(
      existingCalculation.customer ||
      (existingCalculation.customerId && existingCalculation.customerName
        ? { id: existingCalculation.customerId, name: existingCalculation.customerName }
        : null)
    )
    setSelectedProject(
      existingCalculation.projectId && existingCalculation.projectName
        ? { id: existingCalculation.projectId, name: existingCalculation.projectName }
        : defaultProject || null
    )
    setIsDirty(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingCalculation])

  const wrappedSetRateGoal = (value: number) => { markDirty(); setRateGoal(value) }
  const wrappedSetArea = (value: number) => { markDirty(); setArea(value) }
  const wrappedSetCo2Budget = (value: number) => { markDirty(); setCo2Budget(value) }
  const wrappedSetSelectedCustomer = (value: Customer | null) => { markDirty(); setSelectedCustomer(value) }
  const wrappedSetSelectedProject = (value: Project | null) => { markDirty(); setSelectedProject(value) }

  const toggleSection = (id: number) => {
    markDirty()
    setSections(
      sections.map((section) =>
        section.id === id ? { ...section, expanded: !section.expanded } : section
      )
    )
  }

  const toggleSubsection = (sectionId: number, subsectionId: number) => {
    markDirty()
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              subsections: section.subsections?.map((subsection) =>
                subsection.id === subsectionId
                  ? { ...subsection, expanded: !subsection.expanded }
                  : subsection
              ),
            }
          : section
      )
    )
  }

  const toggleSubSubsection = (sectionId: number, subsectionId: number, subSubsectionId: number) => {
    markDirty()
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              subsections: section.subsections?.map((subsection) =>
                subsection.id === subsectionId
                  ? {
                      ...subsection,
                      subSubsections: subsection.subSubsections?.map((subSub) =>
                        subSub.id === subSubsectionId ? { ...subSub, expanded: !subSub.expanded } : subSub
                      ),
                    }
                  : subsection
              ),
            }
          : section
      )
    )
  }

  const expandAll = () => {
    setSections(
      sections.map((section) => ({
        ...section,
        expanded: true,
        subsections: section.subsections?.map((subsection) => ({
          ...subsection,
          expanded: true,
          subSubsections: subsection.subSubsections?.map((subSub) => ({
            ...subSub,
            expanded: true,
          })),
        })),
      }))
    )
  }

  const collapseAll = () => {
    setSections(
      sections.map((section) => ({
        ...section,
        expanded: false,
        subsections: section.subsections?.map((subsection) => ({
          ...subsection,
          expanded: false,
          subSubsections: subsection.subSubsections?.map((subSub) => ({
            ...subSub,
            expanded: false,
          })),
        })),
      }))
    )
  }

  const openCO2Modal = (sectionId: number, subsectionId: number, rowId: number, subSubsectionId?: number) => {
    setSelectedRowForCO2({ sectionId, subsectionId, subSubsectionId, rowId })
    setCo2ModalOpen(true)
  }

  const handleCO2Select = (item: { id: number; co2Value: number }) => {
    markDirty()
    if (selectedRowForCO2) {
      setSections(
        sections.map((section) =>
          section.id === selectedRowForCO2.sectionId
            ? {
                ...section,
                subsections: section.subsections?.map((subsection) =>
                  subsection.id === selectedRowForCO2.subsectionId
                    ? selectedRowForCO2.subSubsectionId !== undefined
                      ? {
                          ...subsection,
                          subSubsections: subsection.subSubsections?.map((subSub) =>
                            subSub.id === selectedRowForCO2.subSubsectionId
                              ? {
                                  ...subSub,
                                  rows: subSub.rows?.map((row) =>
                                    row.id === selectedRowForCO2.rowId
                                      ? { ...row, co2: item.co2Value, co2CostId: item.id }
                                      : row
                                  ),
                                }
                              : subSub
                          ),
                        }
                      : {
                          ...subsection,
                          rows: subsection.rows?.map((row) =>
                            row.id === selectedRowForCO2.rowId
                              ? { ...row, co2: item.co2Value, co2CostId: item.id }
                              : row
                          ),
                        }
                    : subsection
                ),
              }
            : section
        )
      )
    }
  }

  const updateRowCO2 = (sectionId: number, subsectionId: number, rowId: number, co2Value: number, subSubsectionId?: number) => {
    markDirty()
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              subsections: section.subsections?.map((subsection) =>
                subsection.id === subsectionId
                  ? subSubsectionId !== undefined
                    ? {
                        ...subsection,
                        subSubsections: subsection.subSubsections?.map((subSub) =>
                          subSub.id === subSubsectionId
                            ? {
                                ...subSub,
                                rows: subSub.rows?.map((row) =>
                                  row.id === rowId ? { ...row, co2: co2Value, co2CostId: 0 } : row
                                ),
                              }
                            : subSub
                        ),
                      }
                    : {
                        ...subsection,
                        rows: subsection.rows?.map((row) =>
                          row.id === rowId ? { ...row, co2: co2Value, co2CostId: 0 } : row
                        ),
                      }
                  : subsection
              ),
            }
          : section
      )
    )
  }

  const updateRowField = (
    sectionId: number,
    subsectionId: number,
    rowId: number,
    field: keyof CalculationRow,
    value: string | number,
    subSubsectionId?: number
  ) => {
    markDirty()
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              subsections: section.subsections?.map((subsection) =>
                subsection.id === subsectionId
                  ? subSubsectionId !== undefined
                    ? {
                        ...subsection,
                        subSubsections: subsection.subSubsections?.map((subSub) =>
                          subSub.id === subSubsectionId
                            ? {
                                ...subSub,
                                rows: subSub.rows?.map((row) => (row.id === rowId ? applyRowFieldUpdate(row, field, value) : row)),
                              }
                            : subSub
                        ),
                      }
                    : {
                        ...subsection,
                        rows: subsection.rows?.map((row) => (row.id === rowId ? applyRowFieldUpdate(row, field, value) : row)),
                      }
                  : subsection
              ),
            }
          : section
      )
    )
  }

  const updateRowFormulaAndQuantity = (
    sectionId: number,
    subsectionId: number,
    rowId: number,
    formula: string,
    quantity?: number,
    subSubsectionId?: number
  ) => {
    markDirty()
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              subsections: section.subsections?.map((subsection) =>
                subsection.id === subsectionId
                  ? subSubsectionId !== undefined
                    ? {
                        ...subsection,
                        subSubsections: subsection.subSubsections?.map((subSub) =>
                          subSub.id === subSubsectionId
                            ? {
                                ...subSub,
                                rows: subSub.rows?.map((row) =>
                                  row.id === rowId
                                    ? {
                                        ...row,
                                        formula,
                                        ...(quantity !== undefined ? { quantity } : {}),
                                      }
                                    : row
                                ),
                              }
                            : subSub
                        ),
                      }
                    : {
                        ...subsection,
                        rows: subsection.rows?.map((row) =>
                          row.id === rowId
                            ? {
                                ...row,
                                formula,
                                ...(quantity !== undefined ? { quantity } : {}),
                              }
                            : row
                        ),
                      }
                  : subsection
              ),
            }
          : section
      )
    )
  }

  const addNewSubsection = (sectionId: number) => {
    markDirty()
    setSections(
      sections.map((section) => {
        if (section.id === sectionId) {
          const newSubsectionId = Math.max(0, ...(section.subsections?.map(s => s.id || 0) || [])) + 1
          const newSubsection: CalculationSubsection = {
            id: newSubsectionId,
            name: 'Nivå 2',
            amount: 0,
            expanded: false,
            rows: [],
            subSubsections: [],
          }
          return {
            ...section,
            subsections: [...(section.subsections || []), newSubsection],
          }
        }
        return section
      })
    )
  }

  const addNewSubSubsection = (sectionId: number, subsectionId: number) => {
    markDirty()
    setSections(
      sections.map((section) => {
        if (section.id !== sectionId) return section

        return {
          ...section,
          subsections: section.subsections?.map((subsection) => {
            if (subsection.id !== subsectionId) return subsection

            const existingIds =
              subsection.subSubsections?.map((s) => s.id).filter((id): id is number => id !== undefined) || []
            const newId = existingIds.length > 0 ? Math.max(0, ...existingIds) + 1 : 1

            const newSubSub: CalculationSubSubsection = {
              id: newId,
              name: 'Nivå 3',
              amount: 0,
              expanded: false,
              rows: [],
            }

            return {
              ...subsection,
              subSubsections: [...(subsection.subSubsections || []), newSubSub],
              expanded: true,
            }
          }),
        }
      })
    )
  }

  const updateSubSubsectionName = (sectionId: number, subsectionId: number, subSubsectionId: number, newName: string) => {
    markDirty()
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              subsections: section.subsections?.map((subsection) =>
                subsection.id === subsectionId
                  ? {
                      ...subsection,
                      subSubsections: subsection.subSubsections?.map((subSub) =>
                        subSub.id === subSubsectionId ? { ...subSub, name: newName } : subSub
                      ),
                    }
                  : subsection
              ),
            }
          : section
      )
    )
  }

  const deleteSubSubsection = (sectionId: number, subsectionId: number, subSubsectionId: number) => {
    markDirty()
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              subsections: section.subsections?.map((subsection) =>
                subsection.id === subsectionId
                  ? {
                      ...subsection,
                      subSubsections: subsection.subSubsections?.filter((s) => s.id !== subSubsectionId),
                    }
                  : subsection
              ),
            }
          : section
      )
    )
  }

  const addNewRow = (sectionId: number, subsectionId: number, subSubsectionId?: number) => {
    markDirty()
    setSections(
      sections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            subsections: section.subsections?.map((subsection) => {
              if (subsection.id === subsectionId) {
                const targetRows =
                  subSubsectionId !== undefined
                    ? subsection.subSubsections?.find((s) => s.id === subSubsectionId)?.rows
                    : subsection.rows

                const existingIds = targetRows?.map((r) => r.id).filter((id): id is number => id !== undefined) || []
                const newRowId = existingIds.length > 0 ? Math.max(0, ...existingIds) + 1 : 1
                const newRow: CalculationRow = {
                  id: newRowId,
                  description: '',
                  quantity: 0,
                  formula: '',
                  unit: 'm2',
                  pricePerUnit: 0,
                  co2: 0,
                  co2CostId: 0,
                  account: 'Välj konto',
                  resource: '',
                  note: '',
                  waste: 0,
                  customerPrice: null,
                  markupAmount: null,
                  markupPercent: null,
                  revenue: 0,
                }
                return subSubsectionId !== undefined
                  ? {
                      ...subsection,
                      subSubsections: subsection.subSubsections?.map((subSub) =>
                        subSub.id === subSubsectionId
                          ? { ...subSub, rows: [...(subSub.rows || []), newRow], expanded: true }
                          : subSub
                      ),
                      expanded: true,
                    }
                  : {
                      ...subsection,
                      rows: [...(subsection.rows || []), newRow],
                      expanded: true,
                    }
              }
              return subsection
            }),
          }
        }
        return section
      })
    )
  }

  const updateSubsectionName = (sectionId: number, subsectionId: number, newName: string) => {
    markDirty()
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              subsections: section.subsections?.map((subsection) =>
                subsection.id === subsectionId
                  ? { ...subsection, name: newName }
                  : subsection
              ),
            }
          : section
      )
    )
  }

  const deleteSubsection = (sectionId: number, subsectionId: number) => {
    markDirty()
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              subsections: section.subsections?.filter(
                (subsection) => subsection.id !== subsectionId
              ),
            }
          : section
      )
    )
  }

  const addNewSection = () => {
    markDirty()
    const newSectionId = Math.max(0, ...sections.map(s => s.id || 0)) + 1
    const newSection: CalculationSection = {
      id: newSectionId,
      name: 'Nivå 1',
      amount: 0,
      expanded: true,
      subsections: [
        { id: 1, name: 'Nivå 2', amount: 0, expanded: false, rows: [], subSubsections: [] }
      ],
    }
    setSections([...sections, newSection])
  }

  const updateSectionName = (sectionId: number, newName: string) => {
    markDirty()
    setSections(
      sections.map((section) =>
        section.id === sectionId ? { ...section, name: newName } : section
      )
    )
  }

  const deleteSection = (sectionId: number) => {
    markDirty()
    setSections(sections.filter((section) => section.id !== sectionId))
  }

  const deleteRow = (sectionId: number, subsectionId: number, rowId: number, subSubsectionId?: number) => {
    markDirty()
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              subsections: section.subsections?.map((subsection) =>
                subsection.id === subsectionId
                  ? subSubsectionId !== undefined
                    ? {
                        ...subsection,
                        subSubsections: subsection.subSubsections?.map((subSub) =>
                          subSub.id === subSubsectionId
                            ? { ...subSub, rows: subSub.rows?.filter((row) => row.id !== rowId) || [] }
                            : subSub
                        ),
                      }
                    : {
                        ...subsection,
                        rows: subsection.rows?.filter((row) => row.id !== rowId) || [],
                      }
                  : subsection
              ),
            }
          : section
      )
    )
  }

  const addNewOption = () => {
    markDirty()
    const newOptionId = Math.max(0, ...options.map(o => o.id || 0)) + 1
    const newOption: OptionRow = {
      id: newOptionId,
      description: '',
      quantity: 0,
      unit: 'm2',
      pricePerUnit: 0,
      customerPrice: null,
      markupAmount: null,
      markupPercent: null,
      revenue: 0,
    }
    setOptions([...options, newOption])
  }

  const updateOptionField = (optionId: number, field: keyof OptionRow, value: string | number) => {
    markDirty()
    setOptions(
      options.map((option) => {
        if (option.id !== optionId) return option
        if (field === 'customerPrice' || field === 'markupAmount' || field === 'markupPercent') {
          const numValue = (typeof value === 'number' ? value : Number(value)) || 0
          if (numValue === 0) {
            return { ...option, [field]: null }
          }
          return {
            ...option,
            customerPrice: field === 'customerPrice' ? numValue : null,
            markupAmount: field === 'markupAmount' ? numValue : null,
            markupPercent: field === 'markupPercent' ? numValue : null,
          }
        }
        return { ...option, [field]: value }
      })
    )
  }

  const deleteOption = (optionId: number) => {
    markDirty()
    setOptions(options.filter((option) => option.id !== optionId))
  }

  const applyMarkupPercentToAll = (percent: number) => {
    markDirty()
    setSections((prev) =>
      prev.map((section) => ({
        ...section,
        subsections: (section.subsections || []).map((subsection) => ({
          ...subsection,
          rows: (subsection.rows || []).map((row) => ({
            ...row,
            customerPrice: null,
            markupAmount: null,
            markupPercent: percent,
          })),
          subSubsections: (subsection.subSubsections || []).map((subSub) => ({
            ...subSub,
            rows: (subSub.rows || []).map((row) => ({
              ...row,
              customerPrice: null,
              markupAmount: null,
              markupPercent: percent,
            })),
          })),
        })),
      }))
    )
    setOptions((prev) =>
      prev.map((option) => ({
        ...option,
        customerPrice: null,
        markupAmount: null,
        markupPercent: percent,
      }))
    )
  }

  const stampRowMarkup = (row: CalculationRow, percent: number): CalculationRow => ({
    ...row,
    customerPrice: null,
    markupAmount: null,
    markupPercent: percent,
  })

  const applyMarkupPercentToSection = (sectionId: number, percent: number) => {
    markDirty()
    setSections((prev) =>
      prev.map((section) =>
        section.id !== sectionId
          ? section
          : {
              ...section,
              subsections: (section.subsections || []).map((subsection) => ({
                ...subsection,
                rows: (subsection.rows || []).map((row) => stampRowMarkup(row, percent)),
                subSubsections: (subsection.subSubsections || []).map((subSub) => ({
                  ...subSub,
                  rows: (subSub.rows || []).map((row) => stampRowMarkup(row, percent)),
                })),
              })),
            }
      )
    )
  }

  const applyMarkupPercentToSubsection = (sectionId: number, subsectionId: number, percent: number) => {
    markDirty()
    setSections((prev) =>
      prev.map((section) =>
        section.id !== sectionId
          ? section
          : {
              ...section,
              subsections: (section.subsections || []).map((subsection) =>
                subsection.id !== subsectionId
                  ? subsection
                  : {
                      ...subsection,
                      rows: (subsection.rows || []).map((row) => stampRowMarkup(row, percent)),
                      subSubsections: (subsection.subSubsections || []).map((subSub) => ({
                        ...subSub,
                        rows: (subSub.rows || []).map((row) => stampRowMarkup(row, percent)),
                      })),
                    }
              ),
            }
      )
    )
  }

  const applyMarkupPercentToSubSubsection = (
    sectionId: number,
    subsectionId: number,
    subSubsectionId: number,
    percent: number
  ) => {
    markDirty()
    setSections((prev) =>
      prev.map((section) =>
        section.id !== sectionId
          ? section
          : {
              ...section,
              subsections: (section.subsections || []).map((subsection) =>
                subsection.id !== subsectionId
                  ? subsection
                  : {
                      ...subsection,
                      subSubsections: (subsection.subSubsections || []).map((subSub) =>
                        subSub.id !== subSubsectionId
                          ? subSub
                          : {
                              ...subSub,
                              rows: (subSub.rows || []).map((row) => stampRowMarkup(row, percent)),
                            }
                      ),
                    }
              ),
            }
      )
    )
  }

  // Recalculate subsection and section amounts based on rows
  const sectionsWithAmounts = useMemo(() => {
    const resolveRowCO2 = (row: CalculationRow): CalculationRow => {
      if (row.co2CostId > 0) {
        const resolved = co2ValueById.get(row.co2CostId)
        if (resolved !== undefined) {
          return { ...row, co2: resolved }
        }
      }
      return row
    }

    const resolveRow = (row: CalculationRow): CalculationRow => {
      const resolved = resolveRowCO2(row)
      return { ...resolved, revenue: computeRowRevenue(resolved) }
    }

    return sections.map((section) => {
      const subsectionsWithAmounts = (section.subsections || []).map((subsection) => {
        const subSubsectionsWithAmounts = (subsection.subSubsections || []).map((subSub) => {
          const resolvedRows = (subSub.rows || []).map(resolveRow)
          const subSubAmount = resolvedRows.reduce((sum, row) => sum + row.quantity * row.pricePerUnit * (1 + row.waste), 0)
          return { ...subSub, amount: subSubAmount, rows: resolvedRows }
        })

        const resolvedSubsectionRows = (subsection.rows || []).map(resolveRow)
        const subsectionRowsAmount = resolvedSubsectionRows.reduce((sum, row) => sum + row.quantity * row.pricePerUnit * (1 + row.waste), 0)
        const subsectionAmount = subsectionRowsAmount + subSubsectionsWithAmounts.reduce((sum, s) => sum + s.amount, 0)

        return {
          ...subsection,
          amount: subsectionAmount,
          rows: resolvedSubsectionRows,
          subSubsections: subSubsectionsWithAmounts,
        }
      })
      
      const sectionAmount = subsectionsWithAmounts.reduce(
        (sum, subsection) => sum + subsection.amount,
        0
      )
      
      return { ...section, amount: sectionAmount, subsections: subsectionsWithAmounts }
    })
  }, [sections, co2ValueById])

  // Compute revenue for options
  const optionsWithRevenue = useMemo(() => {
    return options.map((option) => ({ ...option, revenue: computeOptionRevenue(option) }))
  }, [options])

  // Calculate options total
  const optionsTotal = useMemo(() => {
    return options.reduce((sum, option) => sum + (option.quantity * option.pricePerUnit), 0)
  }, [options])

  // Calculate total CO2 from all rows (use original sections to ensure we get actual CO2 values)
  const totalCO2 = useMemo(() => {
    return sectionsWithAmounts.reduce((sum, section) => {
      return (
        sum +
        (section.subsections || []).reduce((subsectionSum, subsection) => {
          const rowsCO2 = (subsection.rows || []).reduce((rowSum, row) => rowSum + (row.co2 || 0), 0)
          const subSubCO2 = (subsection.subSubsections || []).reduce((subSubSum, subSub) => {
            return subSubSum + (subSub.rows || []).reduce((rowSum, row) => rowSum + (row.co2 || 0), 0)
          }, 0)
          return subsectionSum + rowsCO2 + subSubCO2
        }, 0)
      )
    }, 0)
  }, [sectionsWithAmounts])

  // Derived values - includes both sections and options
  const budgetExclRate = sectionsWithAmounts.reduce((sum, section) => sum + section.amount, 0) + optionsTotal

  // Total revenue = sum of all Kalkylerad intäkt from all rows
  const totalRevenue = useMemo(() => {
    const sectionsRevenue = sectionsWithAmounts.reduce((sum, section) => {
      return sum + (section.subsections || []).reduce((subSum, subsection) => {
        const rowsRevenue = (subsection.rows || []).reduce((rSum, row) => rSum + row.revenue, 0)
        const subSubRevenue = (subsection.subSubsections || []).reduce((ssSum, subSub) => {
          return ssSum + (subSub.rows || []).reduce((rSum, row) => rSum + row.revenue, 0)
        }, 0)
        return subSum + rowsRevenue + subSubRevenue
      }, 0)
    }, 0)
    const optionsRevenue = optionsWithRevenue.reduce((sum, option) => sum + option.revenue, 0)
    return sectionsRevenue + optionsRevenue
  }, [sectionsWithAmounts, optionsWithRevenue])

  const bidAmount = totalRevenue
  const fixedRate = totalRevenue - budgetExclRate
  const derivedRate = budgetExclRate > 0 ? ((totalRevenue / budgetExclRate) - 1) * 100 : 0

  // After save: patch IDs from the BE response by position without touching expanded state or values
  const mergeIdsFromSave = (response: GetCalculationsReponse) => {
    setSections((prev) =>
      prev.map((section, si) => {
        const rSection = response.sections?.[si]
        if (!rSection) return section
        return {
          ...section,
          id: rSection.id ?? section.id,
          subsections: (section.subsections || []).map((subsection, subi) => {
            const rSub = rSection.subSections?.[subi]
            if (!rSub) return subsection
            return {
              ...subsection,
              id: rSub.id ?? subsection.id,
              rows: (subsection.rows || []).map((row, ri) => {
                const rRow = rSub.budgetRows?.[ri]
                return rRow?.id !== undefined ? { ...row, id: rRow.id } : row
              }),
              subSubsections: (subsection.subSubsections || []).map((subSub, ssi) => {
                const rSubSub = rSub.subSections?.[ssi]
                if (!rSubSub) return subSub
                return {
                  ...subSub,
                  id: rSubSub.id ?? subSub.id,
                  rows: (subSub.rows || []).map((row, ri) => {
                    const rRow = rSubSub.budgetRows?.[ri]
                    return rRow?.id !== undefined ? { ...row, id: rRow.id } : row
                  }),
                }
              }),
            }
          }),
        }
      })
    )
    setOptions((prev) =>
      prev.map((option, i) => {
        const rOption = response.optionBudgetRows?.[i]
        return rOption?.id !== undefined ? { ...option, id: rOption.id } : option
      })
    )
    // Update the initialized ref so close+reopen picks up the fresh cache
    lastInitializedIdRef.current = response.id
  }

  return {
    sections: sectionsWithAmounts,
    options: optionsWithRevenue,
    rateGoal,
    showRateGoal,
    area,
    co2Budget,
    totalCO2,
    selectedCustomer,
    selectedProject,
    co2ModalOpen,
    selectedRowForCO2,
    isDirty,
    markSaved,
    mergeIdsFromSave,
    setRateGoal: wrappedSetRateGoal,
    setShowRateGoal,
    setArea: wrappedSetArea,
    setCo2Budget: wrappedSetCo2Budget,
    setSelectedCustomer: wrappedSetSelectedCustomer,
    setSelectedProject: wrappedSetSelectedProject,
    setCo2ModalOpen,
    toggleSection,
    toggleSubsection,
    toggleSubSubsection,
    expandAll,
    collapseAll,
    addNewRow,
    addNewSubsection,
    addNewSubSubsection,
    addNewSection,
    updateSectionName,
    updateSubsectionName,
    updateSubSubsectionName,
    updateRowField,
    updateRowFormulaAndQuantity,
    updateRowCO2,
    addNewOption,
    updateOptionField,
    applyMarkupPercentToAll,
    applyMarkupPercentToSection,
    applyMarkupPercentToSubsection,
    applyMarkupPercentToSubSubsection,
    openCO2Modal,
    handleCO2Select,
    deleteSection,
    deleteSubsection,
    deleteRow,
    deleteSubSubsection,
    deleteOption,
    budgetExclRate,
    fixedRate,
    bidAmount,
    derivedRate,
  }
}

