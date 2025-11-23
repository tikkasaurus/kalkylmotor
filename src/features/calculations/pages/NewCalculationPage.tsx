import { CO2DatabaseModal } from '@/features/co2-database/components/CO2DatabaseModal'
import type { NewCalculationProps } from '@/features/calculations/api/types'
import { useNewCalculationState } from '@/features/calculations/hooks/useNewCalculationState'
import { NewCalculationHeader } from '@/features/calculations/components/NewCalculationHeader'
import { RateSection } from '@/features/calculations/components/RateSection'
import { SummaryCards } from '@/features/calculations/components/SummaryCards'
import { SectionsTable } from '@/features/calculations/components/SectionsTable'
import { OptionsTable } from '@/features/calculations/components/OptionsTable'

export function NewCalculationPage({ template, onClose }: NewCalculationProps) {
  const state = useNewCalculationState(template)

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
    let csvContent = 'Avsnitt,Benämning,Antal,Enhet,Pris/enhet,Summa\n'

    state.sections.forEach((section) => {
      // Section row
      const sectionTotal = `"${formatNumberForCSV(section.amount)} kr"`
      csvContent += `${section.id},${section.name},,,${sectionTotal}\n`

      // Section rows
      if (section.rows && section.rows.length > 0) {
        section.rows.forEach((row) => {
          const rowTotal = row.quantity * row.pricePerUnit
          csvContent += `,${row.description},${formatNumberForCSV(row.quantity)},${row.unit},"${formatNumberForCSV(row.pricePerUnit)} kr","${formatNumberForCSV(rowTotal)} kr"\n`
        })
      }
    })

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', 'Tosito__Nässjö__Centrallager_Trafikverket_budget.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-auto">
      <NewCalculationHeader onClose={onClose} onExportCSV={exportToCSV} />

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
          expandAll={state.expandAll}
          collapseAll={state.collapseAll}
          addNewSection={state.addNewSection}
          addNewRow={state.addNewRow}
          updateSectionName={state.updateSectionName}
          updateRowField={state.updateRowField}
          updateRowCO2={state.updateRowCO2}
          openCO2Modal={state.openCO2Modal}
        />

        <OptionsTable
          options={state.options}
          formatCurrency={formatCurrency}
          addNewOption={state.addNewOption}
          updateOptionField={state.updateOptionField}
        />
      </div>
      
      <CO2DatabaseModal 
        open={state.co2ModalOpen} 
        onOpenChange={state.setCo2ModalOpen}
        onSelect={state.handleCO2Select}
      />
    </div>
  )
}
