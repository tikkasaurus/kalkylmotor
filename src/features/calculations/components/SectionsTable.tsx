import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Calculator,
  ChevronRight,
  ChevronDown,
  Search,
  Plus,
  X,
} from 'lucide-react'
import type { CalculationSection, CalculationRow } from '@/features/calculations/api/types'
import { Button } from '@/components/ui/button'
import { useGetBookkeepingAccounts, useGetUnitTypes } from '@/features/calculations/api/queries'

interface SectionsTableProps {
  sections: CalculationSection[]
  formatCurrency: (amount: number) => string
  toggleSection: (id: number) => void
  toggleSubsection: (sectionId: number, subsectionId: number) => void
  expandAll: () => void
  collapseAll: () => void
  addNewSection: () => void
  addNewSubsection: (sectionId: number) => void
  addNewRow: (sectionId: number, subsectionId: number) => void
  updateSectionName: (sectionId: number, name: string) => void
  updateSubsectionName: (sectionId: number, subsectionId: number, name: string) => void
  updateRowField: (sectionId: number, subsectionId: number, rowId: number, field: keyof CalculationRow, value: string | number) => void
  updateRowCO2: (sectionId: number, subsectionId: number, rowId: number, value: number) => void
  openCO2Modal: (sectionId: number, subsectionId: number, rowId: number) => void
  deleteSection: (sectionId: number) => void
  deleteSubsection: (sectionId: number, subsectionId: number) => void
  deleteRow: (sectionId: number, subsectionId: number, rowId: number) => void
}

export function SectionsTable({
  sections,
  formatCurrency,
  toggleSection,
  toggleSubsection,
  expandAll,
  collapseAll,
  addNewSection,
  addNewSubsection,
  addNewRow,
  updateSectionName,
  updateSubsectionName,
  updateRowField,
  updateRowCO2,
  openCO2Modal,
  deleteSection,
  deleteSubsection,
  deleteRow,
}: SectionsTableProps) {
  const { data: accounts = [] } = useGetBookkeepingAccounts()
  const { data: unitTypes = [] } = useGetUnitTypes()
  
  return (
    <div className="bg-card border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Kostnadskalkyl</h2>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={expandAll}
            className="text-sm text-gray-600 font-medium hover:text-foreground transition-colors"
          >
            Expandera alla
          </button>
          <button
            onClick={collapseAll}
            className="text-sm text-gray-600 font-medium hover:text-foreground transition-colors"
          >
            Kollapsa alla
          </button>
          <Button 
            onClick={addNewSection}
            variant="outline"
            className="text-sm flex items-center gap-1 text-gray-600 hover:text-foreground transition-colors"
          >
            <span>+</span> Lägg till avsnitt
          </Button>
        </div>
      </div>

      {/* Sections List */}
      <div className="space-y-4">
        {sections.map((section) => (
          <div key={section.id} className="border overflow-hidden">
            <div 
              className="w-full flex items-center justify-between p-4 bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors"
              onClick={() => toggleSection(section.id ?? 0)}
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="hover:bg-accent p-1 transition-colors pointer-events-none">
                  {section.expanded ? (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <span className="text-muted-foreground w-6">{section.id}</span>
                <Input
                  type="text"
                  value={section.name}
                  onChange={(e) => updateSectionName(section.id ?? 0, e.target.value)}
                  className="h-8 font-medium border-0 bg-transparent hover:bg-accent focus:bg-background px-2 max-w-xs"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{formatCurrency(section.amount)}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteSection(section.id ?? 0)
                  }}
                  className="h-6 w-6 flex items-center justify-center hover:bg-destructive/10 hover:text-destructive transition-colors"
                  title="Ta bort sektion"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            {section.expanded && (
              <div className="bg-card border-t">
                {section.subsections?.map((subsection) => (
                  <div key={subsection.id} className="border-b last:border-b-0 border-l-4 border-l-primary/20">
                    {/* Subsection Header */}
                    <div 
                      className="w-full flex items-center justify-between p-3 bg-background cursor-pointer hover:bg-muted/30 transition-colors pl-8"
                      onClick={() => toggleSubsection(section.id ?? 0, subsection.id ?? 0)}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="hover:bg-accent p-1 transition-colors pointer-events-none">
                          {subsection.expanded ? (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <Input
                          type="text"
                          value={subsection.name}
                          onChange={(e) => updateSubsectionName(section.id ?? 0, subsection.id ?? 0, e.target.value)}
                          className="h-7 font-medium border-0 bg-transparent hover:bg-accent focus:bg-background px-2 max-w-xs text-sm"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{formatCurrency(subsection.amount)}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteSubsection(section.id ?? 0, subsection.id ?? 0)
                          }}
                          className="h-5 w-5 flex items-center justify-center hover:bg-destructive/10 hover:text-destructive transition-colors"
                          title="Ta bort undersektion"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Subsection Rows */}
                    {subsection.expanded && (
                      <div className="bg-card pl-8">
                        <Table className="border border-border">
                          <TableHeader>
                            <TableRow className="border-b border-border">
                              <TableHead className="text-gray-600 w-[200px] border-r border-border bg-muted/50 font-semibold">BENÄMNING</TableHead>
                              <TableHead className="text-gray-600 w-[100px] text-right border-r border-border bg-muted/50 font-semibold">ANTAL</TableHead>
                              <TableHead className="text-gray-600 w-[120px] border-r border-border bg-muted/50 font-semibold">ENHET</TableHead>
                              <TableHead className="text-gray-600 w-[120px] text-right border-r border-border bg-muted/50 font-semibold">PRIS/ENHET</TableHead>
                              <TableHead className="text-gray-600 w-[80px] text-center border-r border-border bg-muted/50 font-semibold">CO2</TableHead>
                              <TableHead className="text-gray-600 w-[130px] text-right border-r border-border bg-muted/50 font-semibold">SUMMA</TableHead>
                              <TableHead className="text-gray-600 w-[150px] border-r border-border bg-muted/50 font-semibold">KONTO</TableHead>
                              <TableHead className="text-gray-600 w-[120px] border-r border-border bg-muted/50 font-semibold">RESURS</TableHead>
                              <TableHead className="text-gray-600 w-[150px] border-r border-border bg-muted/50 font-semibold">ANTECKNING</TableHead>
                              <TableHead className="w-[50px] bg-muted/50 font-semibold"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {subsection.rows?.map((row) => (
                              <TableRow key={row.id} className="hover:bg-muted/30 border-b border-border">
                                <TableCell className="font-medium border-r border-border p-0 h-10 align-middle">
                                  <Input 
                                    type="text" 
                                    value={row.description} 
                                    onChange={(e) => updateRowField(section.id, subsection.id, row.id, 'description', e.target.value)}
                                    className="!h-10 w-full border-0 rounded-none px-2 !py-0 focus:bg-accent focus:outline-none"
                                    placeholder="Benämning"
                                  />
                                </TableCell>
                                <TableCell className="text-right border-r border-border p-0 h-10 align-middle">
                                  <Input 
                                    type="number" 
                                    min="0"
                                    value={row.quantity} 
                                    onChange={(e) => {
                                      const value = Number(e.target.value)
                                      if (value >= 0 || e.target.value === '') {
                                        updateRowField(section.id, subsection.id, row.id, 'quantity', value)
                                      }
                                    }}
                                    className="!h-10 w-full text-right border-0 rounded-none px-2 !py-0 focus:bg-accent focus:outline-none"
                                  />
                                </TableCell>
                                <TableCell className="border-r border-border p-0 h-10 align-middle">
                                  <select 
                                    value={row.unit}
                                    onChange={(e) => updateRowField(section.id, subsection.id, row.id, 'unit', e.target.value)}
                                    className="h-10 w-full border-0 rounded-none bg-background px-2 py-0 text-sm focus:bg-accent focus:outline-none"
                                  >
                                    {unitTypes?.map((unit) => (
                                      <option key={unit.id} value={unit.name}>
                                        {unit.shortName}
                                      </option>
                                    ))}
                                  </select>
                                </TableCell>
                                <TableCell className="text-right border-r border-border p-0 h-10 align-middle">
                                  <Input 
                                    type="number" 
                                    min="0"
                                    value={row.pricePerUnit} 
                                    onChange={(e) => {
                                      const value = Number(e.target.value)
                                      if (value >= 0 || e.target.value === '') {
                                        updateRowField(section.id, subsection.id, row.id, 'pricePerUnit', value)
                                      }
                                    }}
                                    className="!h-10 w-full text-right border-0 rounded-none px-2 !py-0 focus:bg-accent focus:outline-none"
                                  />
                                </TableCell>
                                <TableCell className="text-center border-r border-border p-0 h-10 align-middle">
                                  <div className="flex items-center gap-1 h-10 px-2">
                                    <Input 
                                      type="number" 
                                      min="0"
                                      value={row.co2} 
                                      onChange={(e) => {
                                        const value = Number(e.target.value)
                                        if (value >= 0 || e.target.value === '') {
                                          updateRowCO2(section.id, subsection.id, row.id, value)
                                        }
                                      }}
                                      className="!h-10 text-right w-20 border-0 rounded-none focus:bg-accent focus:outline-none !py-0"
                                      placeholder="0"
                                    />
                                    <button 
                                      onClick={() => openCO2Modal(section.id, subsection.id, row.id)}
                                      className="h-8 w-8 flex items-center justify-center hover:bg-accent flex-shrink-0"
                                    >
                                      <Search className="w-4 h-4" />
                                    </button>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right font-semibold border-r border-border h-10 px-2 align-middle">
                                  {formatCurrency(row.quantity * row.pricePerUnit)}
                                </TableCell>
                                <TableCell className="border-r border-border p-0 h-10 align-middle">
                                  <select 
                                    value={row.account}
                                    onChange={(e) => updateRowField(section.id, subsection.id, row.id, 'account', e.target.value)}
                                    className="h-10 w-full border-0 rounded-none bg-background px-2 py-0 text-sm focus:bg-accent focus:outline-none"
                                  >
                                    <option value="Välj konto">Välj konto</option>
                                    {accounts.map((account) => (
                                      <option key={account.id} value={`${account.accountNumber} - ${account.description}`}>
                                        {account.accountNumber} - {account.description}
                                      </option>
                                    ))}
                                  </select>
                                </TableCell>
                                <TableCell className="border-r border-border p-0 h-10 align-middle">
                                  <Input 
                                    type="text" 
                                    value={row.resource} 
                                    onChange={(e) => updateRowField(section.id, subsection.id, row.id, 'resource', e.target.value)}
                                    className="!h-10 w-full text-sm border-0 rounded-none px-2 !py-0 focus:bg-accent focus:outline-none"
                                    placeholder="Resurs..."
                                  />
                                </TableCell>
                                <TableCell className="border-r border-border p-0 h-10 align-middle">
                                  <Input 
                                    type="text" 
                                    value={row.note} 
                                    onChange={(e) => updateRowField(section.id, subsection.id, row.id, 'note', e.target.value)}
                                    className="!h-10 w-full text-sm border-0 rounded-none px-2 !py-0 focus:bg-accent focus:outline-none"
                                    placeholder="Anteckning..."
                                  />
                                </TableCell>
                                <TableCell className="p-0 h-10 align-middle">
                                  <button
                                    onClick={() => deleteRow(section.id, subsection.id, row.id)}
                                    className="h-full w-full flex items-center justify-center hover:bg-destructive/10 hover:text-destructive transition-colors"
                                    title="Ta bort rad"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        <div className="py-4">
                          <Button 
                            onClick={() => addNewRow(section.id, subsection.id)}
                            variant="outline"
                            className="flex items-center gap-2 text-sm hover:text-foreground"
                          >
                            <Plus className="w-4 h-4" />
                            Lägg till rad
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div className="p-4 border-t pl-8">
                  <Button 
                    onClick={() => addNewSubsection(section.id)}
                    variant="outline"
                    className="flex items-center gap-2 text-sm hover:text-foreground"
                  >
                    <Plus className="w-4 h-4" />
                    Lägg till undersektion
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

