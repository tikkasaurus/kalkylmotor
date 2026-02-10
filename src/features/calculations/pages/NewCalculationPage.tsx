import { useState } from 'react'
import { motion } from 'motion/react'
import { CO2DatabaseModal } from '@/features/co2-database/components/CO2DatabaseModal'
import type {
  BudgetRowPayload,
  CalculationSection,
  CalculationSectionPayload,
  CalculationRow,
  CreateCalculationRequest,
  NewCalculationProps,
  OptionBudgetRowPayload,
} from '@/features/calculations/api/types'
import { useNewCalculationState } from '@/features/calculations/hooks/useNewCalculationState'
import { NewCalculationHeader } from '@/features/calculations/components/NewCalculationHeader'
import { RateSection } from '@/features/calculations/components/RateSection'
import { SummaryCards } from '@/features/calculations/components/SummaryCards'
import { SectionsTable } from '@/features/calculations/components/SectionsTable'
import { OptionsTable } from '@/features/calculations/components/OptionsTable'
import { exportToPDF } from '@/features/calculations/utils/pdfExport'
import { useCreateCalculation, useGetTenantIcon } from '../api/queries'
import { toast } from '@/components/ui/toast'
import { useAuth } from '@/lib/useAuth'

export function NewCalculationPage({ 
  template, 
  existingCalculation,
  existingCalculationLoading,
  existingCalculationError,
  costEstimateId,
  onClose,
  initialCalculationName = 'Kalkylnamn',
}: NewCalculationProps) {
  const state = useNewCalculationState(template, existingCalculation)
  const createCalculation = useCreateCalculation()
  const [calculationName, setCalculationName] = useState(initialCalculationName)
  const { data: tenantIcon } = useGetTenantIcon()
  const { account } = useAuth()

  const loadingExisting = !!existingCalculationLoading
  const existingError = existingCalculationError

  const parseAccountNo = (account: string): number => {
    if (!account || account === 'Välj konto') return 0
    // Preferred: account is just "4010"
    const direct = Number(account)
    if (Number.isFinite(direct) && direct > 0) return direct
    // Legacy: "4010 - Description"
    const match = account.match(/^\s*(\d+)\s*-/)
    if (match) return Number(match[1])
    return 0
  }

  const mapRowToPayload = (
    row: CalculationRow, 
    sectionId: number | undefined, 
    subsectionId: number | undefined,
    includeId: boolean,
    originalSections?: CalculationSectionPayload[],
    subSubsectionId?: number
  ): BudgetRowPayload => {
    const payload: BudgetRowPayload = {
      sectionId: sectionId || 0,
      accountNo: parseAccountNo(row.account),
      name: row.description,
      quantity: row.quantity,
      price: row.pricePerUnit,
      amount: row.quantity * row.pricePerUnit * (1 + row.waste),
      notes: row.note,
      co2CostId: row.co2CostId || 0,
      waste: row.waste,
    }
    
    // Only include ID if it exists in the original payload
    // Both sectionId and subsectionId must be defined to find the original row
    if (includeId && row.id && originalSections && sectionId !== undefined && subsectionId !== undefined) {
      const originalSection = originalSections.find(s => s.id === sectionId)
      const originalSubsection = originalSection?.subSections.find(sub => sub.id === subsectionId)
      const originalTargetSection =
        subSubsectionId !== undefined
          ? originalSubsection?.subSections.find(sub => sub.id === subSubsectionId)
          : originalSubsection
      const originalRow = originalTargetSection?.budgetRows.find(r => r.id === row.id)
      if (originalRow) {
        payload.id = row.id
      }
    }
    
    return payload
  }

  const mapSectionToPayload = (
    section: CalculationSection, 
    includeId: boolean,
    originalSections?: CalculationSectionPayload[]
  ): CalculationSectionPayload => {
    // Find the original section if it exists
    const originalSection = originalSections?.find(s => s.id === section.id)
    
    const payload: CalculationSectionPayload = {
      title: section.name,
      subSections: (section.subsections || []).map((subsection) => {
        // Check if subsection ID exists in original payload
        const originalSubsection = originalSection?.subSections.find(sub => sub.id === subsection.id)
        const subPayload: CalculationSectionPayload = {
          id: includeId && subsection.id && originalSubsection ? subsection.id : undefined,
          title: subsection.name,
          subSections: (subsection.subSubsections || []).map((subSub) => {
            const originalSubSub = originalSubsection?.subSections.find(sub => sub.id === subSub.id)
            const subSubPayload: CalculationSectionPayload = {
              id: includeId && subSub.id && originalSubSub ? subSub.id : undefined,
              title: subSub.name,
              subSections: [],
              budgetRows: (subSub.rows || []).map((row) =>
                mapRowToPayload(row, section.id, subsection.id, includeId, originalSections, subSub.id)
              ),
            }
            return subSubPayload
          }),
          budgetRows: (subsection.rows || []).map((row) =>
            mapRowToPayload(row, section.id, subsection.id, includeId, originalSections)
          ),
        }
        return subPayload
      }),
      budgetRows: [],
    }
    
    // Only include section ID if it exists in the original payload
    if (includeId && section.id && originalSection) {
      payload.id = section.id
    }
    
    return payload
  }

  const mapOptionsToPayload = (
    options: typeof state.options, 
    includeId: boolean,
    originalOptions?: OptionBudgetRowPayload[]
  ): OptionBudgetRowPayload[] =>
    options.map((option) => {
      const payload: OptionBudgetRowPayload = {
        accountNo: 0,
        name: option.description,
        quantity: option.quantity,
        price: option.pricePerUnit,
        amount: option.quantity * option.pricePerUnit,
      }
      
      // Only include ID if it exists in the original payload
      if (includeId && option.id && originalOptions) {
        const originalOption = originalOptions.find(o => o.id === option.id)
        if (originalOption) {
          payload.id = option.id
        }
      }
      
      return payload
    })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + ' kr'
  }

  const formatNumberForCSV = (num: number) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num)
  }

  const exportToCSV = () => {
    let csvContent = 'Nivå 1,Nivå 2,Nivå 3,Benämning,Antal,Enhet,Pris/enhet,Spill,Summa\n'

    state.sections.forEach((section) => {
      const sectionTotal = `"${formatNumberForCSV(section.amount)} kr"`
      csvContent += `"${section.name}",,,,,,,${sectionTotal}\n`

      if (section.subsections && section.subsections.length > 0) {
        section.subsections.forEach((subsection) => {
          const subsectionTotal = `"${formatNumberForCSV(subsection.amount)} kr"`
          csvContent += `"${section.name}","${subsection.name}",,,,,,${subsectionTotal}\n`

          if (subsection.rows && subsection.rows.length > 0) {
            subsection.rows.forEach((row) => {
              const rowTotal = row.quantity * row.pricePerUnit * (1 + row.waste)
              csvContent += `"${section.name}","${subsection.name}",,"${row.description}",${formatNumberForCSV(row.quantity)},${row.unit},"${formatNumberForCSV(row.pricePerUnit)} kr",${formatNumberForCSV(row.waste * 100)},"${formatNumberForCSV(rowTotal)} kr"\n`
            })
          }

          if (subsection.subSubsections && subsection.subSubsections.length > 0) {
            subsection.subSubsections.forEach((subSub) => {
              const subSubTotal = `"${formatNumberForCSV(subSub.amount)} kr"`
              csvContent += `"${section.name}","${subsection.name}","${subSub.name}",,,,,,${subSubTotal}\n`

              if (subSub.rows && subSub.rows.length > 0) {
                subSub.rows.forEach((row) => {
                  const rowTotal = row.quantity * row.pricePerUnit * (1 + row.waste)
                  csvContent += `"${section.name}","${subsection.name}","${subSub.name}","${row.description}",${formatNumberForCSV(row.quantity)},${row.unit},"${formatNumberForCSV(row.pricePerUnit)} kr",${formatNumberForCSV(row.waste * 100)},"${formatNumberForCSV(rowTotal)} kr"\n`
                })
              }
            })
          }
        })
      }
    })

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `${calculationName}_budget.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const fetchAsDataUrl = async (url?: string): Promise<string | undefined> => {
    if (!url) return undefined
    const res = await fetch(url)
    const blob = await res.blob()
    return await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(blob)
    })
  }

  const handleExportPDF = async () => {
    try {
      const tenantLogoDataUrl = await fetchAsDataUrl(tenantIcon)
      exportToPDF({
        calculationName,
        date: new Date().toISOString().split('T')[0],
        createdBy: account?.name || account?.username || 'Okänd',
        rate: state.rate,
        area: state.area,
        co2Budget: state.co2Budget,
        budgetExclRate: state.budgetExclRate,
        fixedRate: state.fixedRate,
        bidAmount: state.bidAmount,
        sections: state.sections,
        options: state.options,
        tenantLogoDataUrl,
      })
    } catch (error) {
      console.error('Error exporting PDF:', error)
      toast.error('Kunde inte exportera PDF. Försök igen.')
    }
  }

  const handleSave = async (calcName: string) => {
    setCalculationName(calcName)
    const estimateId = costEstimateId || existingCalculation?.id;
    if (!estimateId) {
      toast.error('Ingen kalkyl är vald.')
      return
    }

    // Determine if we're creating new (from template) vs copying/editing existing
    const isNewCalculation = !existingCalculation

    try {
      const payload: CreateCalculationRequest = {
        name: calcName,
        co2Budget: state.co2Budget,
        budget: state.budgetExclRate,
        amount: state.bidAmount,
        calculatedFeeAmount: state.bidAmount - state.budgetExclRate,
        fee: state.bidAmount - state.budgetExclRate,
        squareMeter: state.area,
        customerId: state.selectedCustomer?.id,
        customer: state.selectedCustomer ?? undefined,
        sections: state.sections.map((section) => 
          mapSectionToPayload(section, !isNewCalculation, existingCalculation?.sections)
        ),
        optionBudgetRows: mapOptionsToPayload(
          state.options, 
          !isNewCalculation, 
          existingCalculation?.optionBudgetRows
        ),
      }

      await createCalculation.mutateAsync({
        costEstimateId: String(estimateId),
        data: payload,
      })

      toast.success('Kalkylen sparades framgångsrikt!')
    } catch (error) {
      toast.error('Kunde inte spara kalkylen. Försök igen.')
      console.error('Error saving calculation:', error)
    }
  }

  if (loadingExisting) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
        <p className="text-muted-foreground">Laddar kalkyl...</p>
      </div>
    )
  }

  if (existingError) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
        <div className="text-center space-y-2">
          <p className="text-destructive font-medium">Kunde inte hämta kalkylen.</p>
          <button className="underline" onClick={onClose}>Stäng</button>
        </div>
      </div>
    )
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="fixed inset-0 bg-background z-50 overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
          <NewCalculationHeader 
            onClose={onClose} 
            onExportCSV={exportToCSV}
            onExportPDF={handleExportPDF}
            onSave={handleSave}
            initialCalculationName={calculationName}
          />

          <div className="max-w-[2000px] mx-auto px-6 py-8">
            <RateSection
              rate={state.rate}
              area={state.area}
              co2Budget={state.co2Budget}
              totalCO2={state.totalCO2}
              bidAmount={state.bidAmount}
              selectedCustomer={state.selectedCustomer}
              onChangeRate={state.setRate}
              onChangeArea={state.setArea}
              onChangeCo2Budget={state.setCo2Budget}
              onCustomerChange={state.setSelectedCustomer}
            />

            <SummaryCards
              budgetExclRate={state.budgetExclRate}
              fixedRate={state.fixedRate}
              bidAmount={state.bidAmount}
              rate={state.rate}
              totalCO2={state.totalCO2}
              co2Budget={state.co2Budget}
              area={state.area}
              formatCurrency={formatCurrency}
            />

        <SectionsTable
          sections={state.sections}
          formatCurrency={formatCurrency}
          toggleSection={state.toggleSection}
          toggleSubsection={state.toggleSubsection}
          toggleSubSubsection={state.toggleSubSubsection}
          expandAll={state.expandAll}
          collapseAll={state.collapseAll}
          addNewSection={state.addNewSection}
          addNewSubsection={state.addNewSubsection}
          addNewSubSubsection={state.addNewSubSubsection}
          addNewRow={state.addNewRow}
          updateSectionName={state.updateSectionName}
          updateSubsectionName={state.updateSubsectionName}
          updateSubSubsectionName={state.updateSubSubsectionName}
          updateRowField={state.updateRowField}
          updateRowFormulaAndQuantity={state.updateRowFormulaAndQuantity}
          updateRowCO2={state.updateRowCO2}
          openCO2Modal={state.openCO2Modal}
          deleteSection={state.deleteSection}
          deleteSubsection={state.deleteSubsection}
          deleteSubSubsection={state.deleteSubSubsection}
          deleteRow={state.deleteRow}
        />

            <OptionsTable
              options={state.options}
              formatCurrency={formatCurrency}
              addNewOption={state.addNewOption}
              updateOptionField={state.updateOptionField}
              deleteOption={state.deleteOption}
            />
          </div>
          
          <CO2DatabaseModal 
            open={state.co2ModalOpen} 
            onOpenChange={state.setCo2ModalOpen}
            onSelect={state.handleCO2Select}
          />
      </motion.div>
    </>
  )
}
