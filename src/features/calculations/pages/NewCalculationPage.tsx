import { useState } from 'react'
import { motion } from 'motion/react'
import { CO2DatabaseModal } from '@/features/co2-database/components/CO2DatabaseModal'
import type {
  BudgetRowPayload,
  CalculationSection,
  CalculationSectionPayload,
  CalculationRow,
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
import { useCreateCalculation } from '../api/queries'
import { toast } from '@/components/ui/toast'

export function NewCalculationPage({ 
  template, 
  existingCalculation,
  existingCalculationLoading,
  existingCalculationError,
  costEstimateId,
  onClose,
  onSaveSuccess,
  initialCalculationName = 'Kalkylnamn',
}: NewCalculationProps) {
  const state = useNewCalculationState(template, existingCalculation)
  const createCalculation = useCreateCalculation()
  const [calculationName, setCalculationName] = useState(initialCalculationName)

  const loadingExisting = !!existingCalculationLoading
  const existingError = existingCalculationError

  const mapRowToPayload = (row: CalculationRow, sectionId: number, includeId: boolean): BudgetRowPayload => {
    const payload: BudgetRowPayload = {
      sectionId,
      accountNo: Number(row.account) || 0,
      name: row.description,
      quantity: row.quantity,
      price: row.pricePerUnit,
      amount: row.quantity * row.pricePerUnit,
      markupAmount: 0,
      markupPercent: 0,
      waste: 0,
      notes: row.note,
      budgetActivityId: 0,
      budgetLocationId: 0,
      co2CostId: 0,
    }
    if (includeId) {
      payload.id = row.id
    }
    return payload
  }

  const mapSectionToPayload = (section: CalculationSection, includeId: boolean): CalculationSectionPayload => {
    const payload: CalculationSectionPayload = {
      title: section.name,
      subSections: (section.subsections || []).map((subsection) => {
        const subPayload: CalculationSectionPayload = {
          title: subsection.name,
          subSections: [],
          budgetRows: (subsection.rows || []).map((row) => mapRowToPayload(row, section?.id || 0, includeId)),
        }
        if (includeId) {
          subPayload.id = subsection.id
        }
        return subPayload
      }),
      budgetRows: [],
    }
    if (includeId) {
      payload.id = section.id
    }
    return payload
  }

  const mapOptionsToPayload = (options: typeof state.options, includeId: boolean): OptionBudgetRowPayload[] =>
    options.map((option) => {
      const payload: OptionBudgetRowPayload = {
        sectionId: 0,
        accountNo: 0,
        name: option.description,
        quantity: option.quantity,
        price: option.pricePerUnit,
        amount: option.quantity * option.pricePerUnit,
        markupAmount: 0,
        markupPercent: 0,
        waste: 0,
        notes: '',
        budgetActivityId: 0,
        budgetLocationId: 0,
        co2CostId: 0,
      }
      if (includeId && option.id) {
        payload.id = option.id
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
    let csvContent = 'Avsnitt,Undersektion,Benämning,Antal,Enhet,Pris/enhet,Summa\n'

    state.sections.forEach((section) => {
      const sectionTotal = `"${formatNumberForCSV(section.amount)} kr"`
      csvContent += `${section.id},${section.name},,,,${sectionTotal}\n`

      if (section.subsections && section.subsections.length > 0) {
        section.subsections.forEach((subsection) => {
          const subsectionTotal = `"${formatNumberForCSV(subsection.amount)} kr"`
          csvContent += `,${subsection.id},${subsection.name},,,${subsectionTotal}\n`

          if (subsection.rows && subsection.rows.length > 0) {
            subsection.rows.forEach((row) => {
              const rowTotal = row.quantity * row.pricePerUnit
              csvContent += `,,${row.description},${formatNumberForCSV(row.quantity)},${row.unit},"${formatNumberForCSV(row.pricePerUnit)} kr","${formatNumberForCSV(rowTotal)} kr"\n`
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

  const handleExportPDF = () => {
    exportToPDF({
      calculationName,
      date: new Date().toISOString().split('T')[0],
      rate: state.rate,
      area: state.area,
      co2Budget: state.co2Budget,
      budgetExclRate: state.budgetExclRate,
      fixedRate: state.fixedRate,
      bidAmount: state.bidAmount,
      sections: state.sections.map(section => ({ ...section, expanded: true })), // All sections expanded
      options: state.options,
    })
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
      const payload = {
        name: calcName,
        co2Budget: state.co2Budget,
        budget: state.budgetExclRate,
        amount: state.bidAmount,
        calculatedFeeAmount: state.bidAmount - state.budgetExclRate,
        fee: state.bidAmount - state.budgetExclRate,
        squareMeter: state.area,
        sections: state.sections.map((section) => mapSectionToPayload(section, !isNewCalculation)),
        optionBudgetRows: mapOptionsToPayload(state.options, !isNewCalculation),
      }

      await createCalculation.mutateAsync({
        costEstimateId: estimateId,
        data: payload,
      })

      toast.success('Kalkylen sparades framgångsrikt!')
      onSaveSuccess?.()
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

          <div className="max-w-[1400px] mx-auto px-6 py-8">
            <RateSection
              rate={state.rate}
              area={state.area}
              co2Budget={state.co2Budget}
              totalCO2={state.totalCO2}
              onChangeRate={state.setRate}
              onChangeArea={state.setArea}
              onChangeCo2Budget={state.setCo2Budget}
            />

            <SummaryCards
              budgetExclRate={state.budgetExclRate}
              fixedRate={state.fixedRate}
              bidAmount={state.bidAmount}
              rate={state.rate}
              formatCurrency={formatCurrency}
            />

        <SectionsTable
          sections={state.sections}
          formatCurrency={formatCurrency}
          toggleSection={state.toggleSection}
          toggleSubsection={state.toggleSubsection}
          expandAll={state.expandAll}
          collapseAll={state.collapseAll}
          addNewSection={state.addNewSection}
          addNewSubsection={state.addNewSubsection}
          addNewRow={state.addNewRow}
          updateSectionName={state.updateSectionName}
          updateSubsectionName={state.updateSubsectionName}
          updateRowField={state.updateRowField}
          updateRowCO2={state.updateRowCO2}
          openCO2Modal={state.openCO2Modal}
          deleteSection={state.deleteSection}
          deleteSubsection={state.deleteSubsection}
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
