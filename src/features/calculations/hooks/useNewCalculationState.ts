import { useState, useMemo } from 'react'
import type {
  CalculationTemplate,
  CalculationSection,
  CalculationRow,
  OptionRow,
} from '@/features/calculations/api/types'

// Factory function to create sections from template
function createSectionsFromTemplate(template: CalculationTemplate): CalculationSection[] {
  return template.sections.map((section, index) => {
    const rows: CalculationRow[] = (section.rows || []).map((row, rowIndex) => ({
      id: rowIndex + 1,
      description: row.description,
      quantity: row.quantity,
      unit: row.unit,
      pricePerUnit: row.pricePerUnit,
      co2: row.co2 || 0,
      account: row.account || 'Välj konto',
      resource: row.resource || 'Resurs...',
      note: row.note || 'Anteckning...',
    }))

    const sectionAmount = rows.reduce((sum, row) => sum + (row.quantity * row.pricePerUnit), 0)

    return {
      id: index + 1,
      name: section.name,
      amount: sectionAmount,
      expanded: false,
      rows,
    }
  })
}

export function useNewCalculationState(template?: CalculationTemplate) {
  // Use template if provided, otherwise use empty default
  const defaultSections: CalculationSection[] = template 
    ? createSectionsFromTemplate(template)
    : [
        { id: 1, name: 'Section 1', amount: 0, expanded: false, rows: [] },
      ]
  
  const [sections, setSections] = useState(defaultSections)
  const [options, setOptions] = useState<OptionRow[]>([])
  const [arvode, setArvode] = useState(8)
  const [area, setArea] = useState(0)
  const [co2Budget, setCo2Budget] = useState(0)
  const [co2ModalOpen, setCo2ModalOpen] = useState(false)
  const [selectedRowForCO2, setSelectedRowForCO2] = useState<{ sectionId: number; rowId: number } | null>(null)

  const toggleSection = (id: number) => {
    setSections(
      sections.map((section) =>
        section.id === id ? { ...section, expanded: !section.expanded } : section
      )
    )
  }

  const expandAll = () => {
    setSections(sections.map((section) => ({ ...section, expanded: true })))
  }

  const collapseAll = () => {
    setSections(sections.map((section) => ({ ...section, expanded: false })))
  }

  const openCO2Modal = (sectionId: number, rowId: number) => {
    setSelectedRowForCO2({ sectionId, rowId })
    setCo2ModalOpen(true)
  }

  const handleCO2Select = (item: { co2Varde: number }) => {
    if (selectedRowForCO2) {
      setSections(
        sections.map((section) =>
          section.id === selectedRowForCO2.sectionId
            ? {
                ...section,
                rows: section.rows?.map((row) =>
                  row.id === selectedRowForCO2.rowId
                    ? { ...row, co2: item.co2Varde }
                    : row
                ),
              }
            : section
        )
      )
    }
  }

  const updateRowCO2 = (sectionId: number, rowId: number, co2Value: number) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              rows: section.rows?.map((row) =>
                row.id === rowId ? { ...row, co2: co2Value } : row
              ),
            }
          : section
      )
    )
  }

  const updateRowField = (sectionId: number, rowId: number, field: keyof CalculationRow, value: string | number) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              rows: section.rows?.map((row) =>
                row.id === rowId ? { ...row, [field]: value } : row
              ),
            }
          : section
      )
    )
  }

  const addNewRow = (sectionId: number) => {
    setSections(
      sections.map((section) => {
        if (section.id === sectionId) {
          const newRowId = Math.max(0, ...(section.rows?.map(r => r.id) || [])) + 1
          const newRow: CalculationRow = {
            id: newRowId,
            description: '',
            quantity: 0,
            unit: 'm2',
            pricePerUnit: 0,
            co2: 0,
            account: 'Välj konto',
            resource: 'Resurs...',
            note: 'Anteckning...',
          }
          return {
            ...section,
            rows: [...(section.rows || []), newRow],
          }
        }
        return section
      })
    )
  }

  const addNewSection = () => {
    const newSectionId = Math.max(...sections.map(s => s.id)) + 1
    const newSection: CalculationSection = {
      id: newSectionId,
      name: `Avsnitt ${newSectionId}`,
      amount: 0,
      expanded: true,
      rows: [],
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

  // Recalculate section amounts based on rows
  const sectionsWithAmounts = useMemo(() => {
    return sections.map((section) => {
      const sectionAmount = (section.rows || []).reduce(
        (sum, row) => sum + (row.quantity * row.pricePerUnit),
        0
      )
      return { ...section, amount: sectionAmount }
    })
  }, [sections])

  // Derived values
  const budgetExclArvode = sectionsWithAmounts.reduce((sum, section) => sum + section.amount, 0)
  const fastArvode = budgetExclArvode * (arvode / 100)
  const anbudssumma = budgetExclArvode + fastArvode

  return {
    sections: sectionsWithAmounts,
    options,
    arvode,
    area,
    co2Budget,
    co2ModalOpen,
    selectedRowForCO2,
    setArvode,
    setArea,
    setCo2Budget,
    setCo2ModalOpen,
    toggleSection,
    expandAll,
    collapseAll,
    addNewRow,
    addNewSection,
    updateSectionName,
    updateRowField,
    updateRowCO2,
    addNewOption,
    updateOptionField,
    openCO2Modal,
    handleCO2Select,
    budgetExclArvode,
    fastArvode,
    anbudssumma,
  }
}

