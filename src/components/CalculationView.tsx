import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CO2DatabaseModal } from './CO2DatabaseModal'
import {
  Home,
  FileText,
  Upload,
  Settings,
  Download,
  Save,
  ChevronRight,
  ChevronDown,
  Calculator,
  X,
  Search,
  Plus,
  FileSpreadsheet,
} from 'lucide-react'

interface CalculationRow {
  id: number
  description: string
  quantity: number
  unit: string
  pricePerUnit: number
  co2: number
  account: string
  resource: string
  note: string
}

interface OptionRow {
  id: number
  description: string
  quantity: number
  unit: string
  pricePerUnit: number
}

interface CalculationSection {
  id: number
  name: string
  amount: number
  expanded?: boolean
  rows?: CalculationRow[]
}

interface TemplateRow {
  description: string
  quantity: number
  unit: string
  pricePerUnit: number
  co2?: number
  account?: string
  resource?: string
  note?: string
}

interface TemplateSection {
  name: string
  rows?: TemplateRow[]
}

export interface CalculationTemplate {
  name: string
  sections: TemplateSection[]
}

interface CalculationViewProps {
  template?: CalculationTemplate
  onClose: () => void
}

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

export function CalculationView({ template, onClose }: CalculationViewProps) {
  // Use template if provided, otherwise use empty default
  const defaultSections: CalculationSection[] = template 
    ? createSectionsFromTemplate(template)
    : [
        { id: 1, name: 'Section 1', amount: 0, expanded: false, rows: [] },
        { id: 2, name: 'Section 2', amount: 0, expanded: false, rows: [] },
        { id: 3, name: 'Section 3', amount: 0, expanded: false, rows: [] },
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

  const budgetExclArvode = sections.reduce((sum, section) => sum + section.amount, 0)
  const fastArvode = budgetExclArvode * (arvode / 100)
  const anbudssumma = budgetExclArvode + fastArvode

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

    sections.forEach((section) => {
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
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Logo */}
              <div className="w-16 h-16 bg-orange-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xl">BRA</span>
              </div>
              {/* Project Info */}
              <div className="text-left">
                <h1 className="text-xl font-semibold">
                  Tosito, Nässjö: Centrallager Trafikverket
                </h1>
                <p className="text-sm text-muted-foreground">2025-05-10</p>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-6 mt-4">
            <button className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-lg transition-colors">
              <Home className="w-4 h-4" />
              Hem
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-lg transition-colors">
              <Upload className="w-4 h-4" />
              Importera CO2-data
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-lg transition-colors">
              <Settings className="w-4 h-4" />
              Inställningar
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                  Exportera
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <FileText className="w-4 h-4" />
                  Exportera som PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToCSV}>
                  <FileSpreadsheet className="w-4 h-4" />
                  Exportera som Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" className="ml-auto">
              <Save className="w-4 h-4 mr-2" />
              Spara
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Arvode Section */}
        <div className="bg-card border rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Arvode</h2>
          <div className="grid grid-cols-3 gap-6 mb-4">
            <div>
              <Label htmlFor="arvode">Arvode (%)</Label>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  id="arvode"
                  type="number"
                  value={arvode}
                  onChange={(e) => setArvode(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-muted-foreground">%</span>
              </div>
            </div>
            <div>
              <Label htmlFor="area">Area (kvm)</Label>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  id="area"
                  type="number"
                  value={area}
                  onChange={(e) => setArea(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-muted-foreground">kvm</span>
              </div>
            </div>
            <div>
              <Label htmlFor="co2">CO2 Budget</Label>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  id="co2"
                  type="number"
                  value={co2Budget}
                  onChange={(e) => setCo2Budget(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-muted-foreground">kg/kvm</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Procentuellt arvode på totalkostnaden
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-card border rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Budget exkl. arvode</p>
            <p className="text-2xl font-semibold">{formatCurrency(budgetExclArvode)}</p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Fastarvode {arvode}%</p>
            <p className="text-2xl font-semibold">{formatCurrency(fastArvode)}</p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <p className="text-sm text-blue-600 mb-1">Anbudssumma</p>
            <p className="text-2xl font-semibold text-blue-600">
              {formatCurrency(anbudssumma)}
            </p>
          </div>
        </div>

        {/* Cost Calculation */}
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Kostnadskalkyl</h2>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={expandAll}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Expandera alla
              </button>
              <button
                onClick={collapseAll}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Kollapsa alla
              </button>
              <button 
                onClick={addNewSection}
                className="text-sm flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <span>+</span> Lägg till avsnitt
              </button>
            </div>
          </div>

          {/* Sections List */}
          <div className="space-y-2">
            {sections.map((section) => (
              <div key={section.id} className="border rounded-lg overflow-hidden">
                <div className="w-full flex items-center justify-between p-4">
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="hover:bg-accent rounded p-1 transition-colors"
                    >
                      {section.expanded ? (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      )}
                    </button>
                    <span className="text-muted-foreground w-6">{section.id}</span>
                    <Input
                      type="text"
                      value={section.name}
                      onChange={(e) => updateSectionName(section.id, e.target.value)}
                      className="h-8 font-medium border-0 bg-transparent hover:bg-accent focus:bg-background px-2 max-w-xs"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <span className="font-semibold">{formatCurrency(section.amount)}</span>
                </div>
                {section.expanded && (
                  <div className="bg-muted/30 border-t">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[200px]">BENÄMNING</TableHead>
                          <TableHead className="w-[100px] text-right">ANTAL</TableHead>
                          <TableHead className="w-[120px]">ENHET</TableHead>
                          <TableHead className="w-[120px] text-right">PRIS/ENHET</TableHead>
                          <TableHead className="w-[80px] text-center">CO2</TableHead>
                          <TableHead className="w-[130px] text-right">SUMMA</TableHead>
                          <TableHead className="w-[150px]">KONTO</TableHead>
                          <TableHead className="w-[120px]">RESURS</TableHead>
                          <TableHead className="w-[150px]">ANTECKNING</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {section.rows?.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell className="font-medium">
                              <Input 
                                type="text" 
                                value={row.description} 
                                onChange={(e) => updateRowField(section.id, row.id, 'description', e.target.value)}
                                className="h-8"
                                placeholder="Benämning"
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <Input 
                                type="number" 
                                value={row.quantity} 
                                onChange={(e) => updateRowField(section.id, row.id, 'quantity', Number(e.target.value))}
                                className="h-8 text-right"
                              />
                            </TableCell>
                            <TableCell>
                              <select 
                                value={row.unit}
                                onChange={(e) => updateRowField(section.id, row.id, 'unit', e.target.value)}
                                className="h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                              >
                                <option value="m2">m2</option>
                                <option value="m3">m3</option>
                                <option value="m">m</option>
                                <option value="st">st</option>
                              </select>
                            </TableCell>
                            <TableCell className="text-right">
                              <Input 
                                type="number" 
                                value={row.pricePerUnit} 
                                onChange={(e) => updateRowField(section.id, row.id, 'pricePerUnit', Number(e.target.value))}
                                className="h-8 text-right"
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center gap-1">
                                <Input 
                                  type="number" 
                                  value={row.co2} 
                                  onChange={(e) => updateRowCO2(section.id, row.id, Number(e.target.value))}
                                  className="h-8 text-right w-20"
                                  placeholder="0"
                                />
                                <button 
                                  onClick={() => openCO2Modal(section.id, row.id)}
                                  className="h-8 w-8 flex items-center justify-center hover:bg-accent rounded flex-shrink-0"
                                >
                                  <Search className="w-4 h-4" />
                                </button>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {formatCurrency(row.quantity * row.pricePerUnit)}
                            </TableCell>
                            <TableCell>
                              <select 
                                value={row.account}
                                onChange={(e) => updateRowField(section.id, row.id, 'account', e.target.value)}
                                className="h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                              >
                                <option value="Välj konto">Välj konto</option>
                                <option value="4010 -...">4010 -...</option>
                                <option value="4020 -...">4020 -...</option>
                              </select>
                            </TableCell>
                            <TableCell>
                              <Input 
                                type="text" 
                                value={row.resource} 
                                onChange={(e) => updateRowField(section.id, row.id, 'resource', e.target.value)}
                                className="h-8 text-sm"
                                placeholder="Resurs..."
                              />
                            </TableCell>
                            <TableCell>
                              <Input 
                                type="text" 
                                value={row.note} 
                                onChange={(e) => updateRowField(section.id, row.id, 'note', e.target.value)}
                                className="h-8 text-sm"
                                placeholder="Anteckning..."
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="p-4">
                      <button 
                        onClick={() => addNewRow(section.id)}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Lägg till rad
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Option</h2>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">BENÄMNING</TableHead>
                <TableHead className="w-[150px] text-right">ANTAL</TableHead>
                <TableHead className="w-[150px]">ENHET</TableHead>
                <TableHead className="w-[150px] text-right">PRIS/ENHET</TableHead>
                <TableHead className="w-[150px] text-right">SUMMA</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {options.map((option) => (
                <TableRow key={option.id}>
                  <TableCell>
                    <Input 
                      type="text" 
                      value={option.description} 
                      onChange={(e) => updateOptionField(option.id, 'description', e.target.value)}
                      className="h-8"
                      placeholder="Lägg till option..."
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Input 
                      type="number" 
                      value={option.quantity} 
                      onChange={(e) => updateOptionField(option.id, 'quantity', Number(e.target.value))}
                      className="h-8 text-right"
                    />
                  </TableCell>
                  <TableCell>
                    <select 
                      value={option.unit}
                      onChange={(e) => updateOptionField(option.id, 'unit', e.target.value)}
                      className="h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                    >
                      <option value="m2">m2</option>
                      <option value="m3">m3</option>
                      <option value="m">m</option>
                      <option value="st">st</option>
                    </select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Input 
                      type="number" 
                      value={option.pricePerUnit} 
                      onChange={(e) => updateOptionField(option.id, 'pricePerUnit', Number(e.target.value))}
                      className="h-8 text-right"
                    />
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(option.quantity * option.pricePerUnit)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <div className="mt-4">
            <button 
              onClick={addNewOption}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Plus className="w-4 h-4" />
              Lägg till option
            </button>
          </div>
        </div>
      </div>
      
      <CO2DatabaseModal 
        open={co2ModalOpen} 
        onOpenChange={setCo2ModalOpen}
        onSelect={handleCO2Select}
      />
    </div>
  )
}

