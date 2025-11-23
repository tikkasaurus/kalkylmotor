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

interface CalculationSection {
  id: number
  name: string
  amount: number
  expanded?: boolean
  rows?: CalculationRow[]
}

interface CalculationViewProps {
  templateId?: string
  onClose: () => void
}

const initialSections: CalculationSection[] = [
  { 
    id: 1, 
    name: 'Mark', 
    amount: 5117400, 
    expanded: false,
    rows: [
      { id: 1, description: 'Markarbeten', quantity: 3400, unit: 'm2', pricePerUnit: 280, co2: 0, account: 'Välj konto', resource: 'Resurs...', note: 'Anteckning...' },
      { id: 2, description: 'Betongplatta på mark', quantity: 3400, unit: 'm2', pricePerUnit: 890, co2: 0, account: '4010 -...', resource: 'Resurs...', note: 'Anteckning...' },
      { id: 3, description: 'Schaktning', quantity: 2800, unit: 'm3', pricePerUnit: 145, co2: 0, account: 'Välj konto', resource: 'Resurs...', note: 'Anteckning...' },
      { id: 4, description: 'Dränering', quantity: 420, unit: 'm', pricePerUnit: 320, co2: 0, account: 'Välj konto', resource: 'Resurs...', note: 'Anteckning...' },
      { id: 5, description: 'Återfyllning', quantity: 1200, unit: 'm3', pricePerUnit: 95, co2: 0, account: 'Välj konto', resource: 'Resurs...', note: 'Anteckning...' },
      { id: 6, description: 'VA-anslutningar', quantity: 1, unit: 'st', pricePerUnit: 485000, co2: 0, account: 'Välj konto', resource: 'Resurs...', note: 'Anteckning...' },
    ]
  },
  { id: 3, name: 'Stomme', amount: 19323900, expanded: false, rows: [] },
  { id: 4, name: 'Yttertak', amount: 0, expanded: false, rows: [] },
  { id: 5, name: 'Fasader', amount: 0, expanded: false, rows: [] },
  { id: 6, name: 'Stomkompl./rumsbildn.', amount: 1261000, expanded: false, rows: [] },
  { id: 7, name: 'Inv ytskikt/rumskompl.', amount: 0, expanded: false, rows: [] },
  { id: 8, name: 'UE', amount: 10290000, expanded: false, rows: [] },
]

export function CalculationView({ onClose }: CalculationViewProps) {
  const [sections, setSections] = useState(initialSections)
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
              <div>
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
              <FileText className="w-4 h-4" />
              General Contracting
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-lg transition-colors">
              <Upload className="w-4 h-4" />
              Importera CO2 data
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-lg transition-colors">
              <Settings className="w-4 h-4" />
              Inställningar
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-lg transition-colors">
              <Download className="w-4 h-4" />
              Exportera
            </button>
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
              <h2 className="text-lg font-semibold">Cost Calculation</h2>
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
                Kollaps alla
              </button>
              <button className="text-sm flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                <span>+</span> Lägg till avsnitt
              </button>
            </div>
          </div>

          {/* Sections List */}
          <div className="space-y-2">
            {sections.map((section) => (
              <div key={section.id} className="border rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-accent transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    {section.expanded ? (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    )}
                    <span className="text-muted-foreground w-6">{section.id}</span>
                    <span className="font-medium">{section.name}</span>
                  </div>
                  <span className="font-semibold">{formatCurrency(section.amount)}</span>
                </button>
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
                            <TableCell className="font-medium">{row.description}</TableCell>
                            <TableCell className="text-right">
                              <Input 
                                type="number" 
                                value={row.quantity} 
                                className="h-8 text-right"
                              />
                            </TableCell>
                            <TableCell>
                              <select className="h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm">
                                <option>{row.unit}</option>
                                <option>m2</option>
                                <option>m3</option>
                                <option>m</option>
                                <option>st</option>
                              </select>
                            </TableCell>
                            <TableCell className="text-right">
                              <Input 
                                type="number" 
                                value={row.pricePerUnit} 
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
                              <select className="h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm">
                                <option>{row.account}</option>
                                <option>4010 -...</option>
                                <option>4020 -...</option>
                              </select>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {row.resource}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {row.note}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="p-4">
                      <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
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
      </div>
      
      <CO2DatabaseModal 
        open={co2ModalOpen} 
        onOpenChange={setCo2ModalOpen}
        onSelect={handleCO2Select}
      />
    </div>
  )
}

