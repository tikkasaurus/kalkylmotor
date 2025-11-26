import { useState } from 'react'
import { motion } from 'motion/react'
import { CO2DatabaseModal } from '@/features/co2-database/components/CO2DatabaseModal'
import type { NewCalculationProps } from '@/features/calculations/api/types'
import { useNewCalculationState } from '@/features/calculations/hooks/useNewCalculationState'
import { NewCalculationHeader } from '@/features/calculations/components/NewCalculationHeader'
import { SaveCalculationDialog } from '@/features/calculations/components/SaveCalculationDialog'
import { RateSection } from '@/features/calculations/components/RateSection'
import { SummaryCards } from '@/features/calculations/components/SummaryCards'
import { SectionsTable } from '@/features/calculations/components/SectionsTable'
import { OptionsTable } from '@/features/calculations/components/OptionsTable'
import { exportToPDF } from '@/features/calculations/utils/pdfExport'

export function NewCalculationPage({ 
  template, 
  onClose,
  onSaveSuccess,
  initialCalculationName = 'Kalkylnamn',
  initialProjectName = '',
}: NewCalculationProps) {
  const state = useNewCalculationState(template)
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false)
  const [calculationName, setCalculationName] = useState(initialCalculationName)
  const [projectName, setProjectName] = useState(initialProjectName)

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
    // CSV header
    let csvContent = 'Avsnitt,Undersektion,Benämning,Antal,Enhet,Pris/enhet,Summa\n'

    state.sections.forEach((section) => {
      // Section row
      const sectionTotal = `"${formatNumberForCSV(section.amount)} kr"`
      csvContent += `${section.id},${section.name},,,,${sectionTotal}\n`

      // Subsections
      if (section.subsections && section.subsections.length > 0) {
        section.subsections.forEach((subsection) => {
          // Subsection row
          const subsectionTotal = `"${formatNumberForCSV(subsection.amount)} kr"`
          csvContent += `,${subsection.id},${subsection.name},,,${subsectionTotal}\n`

          // Subsection rows
          if (subsection.rows && subsection.rows.length > 0) {
            subsection.rows.forEach((row) => {
              const rowTotal = row.quantity * row.pricePerUnit
              csvContent += `,,${row.description},${formatNumberForCSV(row.quantity)},${row.unit},"${formatNumberForCSV(row.pricePerUnit)} kr","${formatNumberForCSV(rowTotal)} kr"\n`
            })
          }
        })
      }
    })

    // Create blob and download
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
      projectName,
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

  const handleSave = (calcName: string, projName: string) => {
    setCalculationName(calcName)
    setProjectName(projName)
    setIsSaveDialogOpen(true)
  }

  const handleSaveSuccess = () => {
    // Trigger confetti animation before closing
    onSaveSuccess?.()
    // Small delay to ensure confetti is visible before closing
    setTimeout(() => {
      onClose()
    }, 100)
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
            initialProjectName={projectName}
          />

          <div className="max-w-[1400px] mx-auto px-6 py-8">
            <RateSection
              rate={state.rate}
              area={state.area}
              co2Budget={state.co2Budget}
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

          <SaveCalculationDialog
            open={isSaveDialogOpen}
            onOpenChange={setIsSaveDialogOpen}
            bidAmount={state.bidAmount}
            formatCurrency={formatCurrency}
            onSuccess={handleSaveSuccess}
            hasSections={state.sections.length > 0}
            calculationName={calculationName}
            projectName={projectName}
          />
      </motion.div>
    </>
  )
}
