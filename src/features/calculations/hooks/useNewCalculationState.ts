import { useState, useMemo } from 'react'
import type {
  CalculationTemplate,
  CalculationSection,
  CalculationSubsection,
  CalculationRow,
  OptionRow,
} from '@/features/calculations/api/types'

// Factory function to create sections from template
function createSectionsFromTemplate(template: CalculationTemplate): CalculationSection[] {
  return template.sections.map((section, index) => {
    // For now, create a default subsection with all rows
    // This can be enhanced later to support subsections in templates
    const rows: CalculationRow[] = (section.rows || []).map((row, rowIndex) => ({
      id: rowIndex + 1,
      description: row.description,
      quantity: row.quantity,
      unit: row.unit,
      pricePerUnit: row.pricePerUnit,
      co2: row.co2 || 0,
      account: row.account || 'Välj konto',
      resource: row.resource || '',
      note: row.note || '',
    }))

    const subsectionAmount = rows.reduce((sum, row) => sum + (row.quantity * row.pricePerUnit), 0)

    const subsection: CalculationSubsection = {
      id: 1,
      name: 'Undersektion 1',
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

export function useNewCalculationState(template?: CalculationTemplate) {
  // Use template if provided, otherwise use empty default
  const defaultSections: CalculationSection[] = template 
    ? createSectionsFromTemplate(template)
    : [
        { 
          id: 1, 
          name: 'Section 1', 
          amount: 0, 
          expanded: false, 
          subsections: [
            { id: 1, name: 'Undersektion 1', amount: 0, expanded: false, rows: [] }
          ]
        },
      ]
  
  const [sections, setSections] = useState(defaultSections)
  const [options, setOptions] = useState<OptionRow[]>([])
  const [rate, setRate] = useState(8)
  const [area, setArea] = useState(0)
  const [co2Budget, setCo2Budget] = useState(0)
  const [co2ModalOpen, setCo2ModalOpen] = useState(false)
  const [selectedRowForCO2, setSelectedRowForCO2] = useState<{ sectionId: number; subsectionId: number; rowId: number } | null>(null)

  const toggleSection = (id: number) => {
    setSections(
      sections.map((section) =>
        section.id === id ? { ...section, expanded: !section.expanded } : section
      )
    )
  }

  const toggleSubsection = (sectionId: number, subsectionId: number) => {
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

  const expandAll = () => {
    setSections(
      sections.map((section) => ({
        ...section,
        expanded: true,
        subsections: section.subsections?.map((subsection) => ({
          ...subsection,
          expanded: true,
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
        })),
      }))
    )
  }

  const openCO2Modal = (sectionId: number, subsectionId: number, rowId: number) => {
    setSelectedRowForCO2({ sectionId, subsectionId, rowId })
    setCo2ModalOpen(true)
  }

  const handleCO2Select = (item: { co2Varde: number }) => {
    if (selectedRowForCO2) {
      setSections(
        sections.map((section) =>
          section.id === selectedRowForCO2.sectionId
            ? {
                ...section,
                subsections: section.subsections?.map((subsection) =>
                  subsection.id === selectedRowForCO2.subsectionId
                    ? {
                        ...subsection,
                        rows: subsection.rows?.map((row) =>
                          row.id === selectedRowForCO2.rowId
                            ? { ...row, co2: item.co2Varde }
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

  const updateRowCO2 = (sectionId: number, subsectionId: number, rowId: number, co2Value: number) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              subsections: section.subsections?.map((subsection) =>
                subsection.id === subsectionId
                  ? {
                      ...subsection,
                      rows: subsection.rows?.map((row) =>
                        row.id === rowId ? { ...row, co2: co2Value } : row
                      ),
                    }
                  : subsection
              ),
            }
          : section
      )
    )
  }

  const updateRowField = (sectionId: number, subsectionId: number, rowId: number, field: keyof CalculationRow, value: string | number) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              subsections: section.subsections?.map((subsection) =>
                subsection.id === subsectionId
                  ? {
                      ...subsection,
                      rows: subsection.rows?.map((row) =>
                        row.id === rowId ? { ...row, [field]: value } : row
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
    setSections(
      sections.map((section) => {
        if (section.id === sectionId) {
          const newSubsectionId = Math.max(0, ...(section.subsections?.map(s => s.id) || [])) + 1
          const newSubsection: CalculationSubsection = {
            id: newSubsectionId,
            name: `Undersektion ${newSubsectionId}`,
            amount: 0,
            expanded: false,
            rows: [],
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

  const addNewRow = (sectionId: number, subsectionId: number) => {
    setSections(
      sections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            subsections: section.subsections?.map((subsection) => {
              if (subsection.id === subsectionId) {
                const newRowId = Math.max(0, ...(subsection.rows?.map(r => r.id) || [])) + 1
                const newRow: CalculationRow = {
                  id: newRowId,
                  description: '',
                  quantity: 0,
                  unit: 'm2',
                  pricePerUnit: 0,
                  co2: 0,
                  account: 'Välj konto',
                  resource: '',
                  note: '',
                }
                return {
                  ...subsection,
                  rows: [...(subsection.rows || []), newRow],
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
    const newSectionId = Math.max(0, ...sections.map(s => s.id)) + 1
    const newSection: CalculationSection = {
      id: newSectionId,
      name: `Sektion ${newSectionId}`,
      amount: 0,
      expanded: true,
      subsections: [
        { id: 1, name: 'Undersektion 1', amount: 0, expanded: false, rows: [] }
      ],
    }
    setSections([...sections, newSection])
  }

  const updateSectionName = (sectionId: number, newName: string) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId ? { ...section, name: newName } : section
      )
    )
  }

  const deleteSection = (sectionId: number) => {
    setSections(sections.filter((section) => section.id !== sectionId))
  }

  const deleteRow = (sectionId: number, subsectionId: number, rowId: number) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              subsections: section.subsections?.map((subsection) =>
                subsection.id === subsectionId
                  ? {
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
    const newOptionId = Math.max(0, ...options.map(o => o.id)) + 1
    const newOption: OptionRow = {
      id: newOptionId,
      description: '',
      quantity: 0,
      unit: 'm2',
      pricePerUnit: 0,
    }
    setOptions([...options, newOption])
  }

  const updateOptionField = (optionId: number, field: keyof OptionRow, value: string | number) => {
    setOptions(
      options.map((option) =>
        option.id === optionId ? { ...option, [field]: value } : option
      )
    )
  }

  const deleteOption = (optionId: number) => {
    setOptions(options.filter((option) => option.id !== optionId))
  }

  // Recalculate subsection and section amounts based on rows
  const sectionsWithAmounts = useMemo(() => {
    return sections.map((section) => {
      const subsectionsWithAmounts = (section.subsections || []).map((subsection) => {
        const subsectionAmount = (subsection.rows || []).reduce(
          (sum, row) => sum + (row.quantity * row.pricePerUnit),
          0
        )
        return { ...subsection, amount: subsectionAmount }
      })
      
      const sectionAmount = subsectionsWithAmounts.reduce(
        (sum, subsection) => sum + subsection.amount,
        0
      )
      
      return { ...section, amount: sectionAmount, subsections: subsectionsWithAmounts }
    })
  }, [sections])

  // Calculate options total
  const optionsTotal = useMemo(() => {
    return options.reduce((sum, option) => sum + (option.quantity * option.pricePerUnit), 0)
  }, [options])

  // Derived values - includes both sections and options
  const budgetExclRate = sectionsWithAmounts.reduce((sum, section) => sum + section.amount, 0) + optionsTotal
  const fixedRate = budgetExclRate * (rate / 100)
  const bidAmount = budgetExclRate + fixedRate

  return {
    sections: sectionsWithAmounts,
    options,
    rate,
    area,
    co2Budget,
    co2ModalOpen,
    selectedRowForCO2,
    setRate,
    setArea,
    setCo2Budget,
    setCo2ModalOpen,
    toggleSection,
    toggleSubsection,
    expandAll,
    collapseAll,
    addNewRow,
    addNewSubsection,
    addNewSection,
    updateSectionName,
    updateSubsectionName,
    updateRowField,
    updateRowCO2,
    addNewOption,
    updateOptionField,
    openCO2Modal,
    handleCO2Select,
    deleteSection,
    deleteSubsection,
    deleteRow,
    deleteOption,
    budgetExclRate,
    fixedRate,
    bidAmount,
  }
}

