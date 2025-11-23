import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
} from 'lucide-react'

interface CalculationSection {
  id: number
  name: string
  amount: number
  expanded?: boolean
}

interface CalculationViewProps {
  templateId: string
  onClose: () => void
}

const initialSections: CalculationSection[] = [
  { id: 1, name: 'Mark', amount: 5117400, expanded: false },
  { id: 3, name: 'Stomme', amount: 19323900, expanded: false },
  { id: 4, name: 'Yttertak', amount: 0, expanded: false },
  { id: 5, name: 'Fasader', amount: 0, expanded: false },
  { id: 6, name: 'Stomkompl./rumsbildn.', amount: 1261000, expanded: false },
  { id: 7, name: 'Inv ytskikt/rumskompl.', amount: 0, expanded: false },
  { id: 8, name: 'UE', amount: 10290000, expanded: false },
]

export function CalculationView({ templateId, onClose }: CalculationViewProps) {
  const [sections, setSections] = useState(initialSections)
  const [arvode, setArvode] = useState(8)
  const [area, setArea] = useState(0)
  const [co2Budget, setCo2Budget] = useState(0)

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
                  <div className="p-4 bg-muted/30 border-t">
                    <p className="text-sm text-muted-foreground">
                      Detaljerad information om {section.name}...
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

