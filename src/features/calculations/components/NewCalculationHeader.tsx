import { useState } from 'react'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Home,
  FileText,
  Download,
  Save,
  X,
  FileSpreadsheet,
} from 'lucide-react'
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler'

interface NewCalculationHeaderProps {
  onClose: () => void
  onExportCSV: () => void
  onExportPDF?: () => void
  onSave?: (calculationName: string) => void
  initialCalculationName?: string
}

export function NewCalculationHeader({ 
  onClose, 
  onExportCSV,
  onExportPDF,
  onSave,
  initialCalculationName = 'Kalkylnamn',
}: NewCalculationHeaderProps) {
  const [calculationName, setCalculationName] = useState(initialCalculationName)

  const handleSave = () => {
    if (onSave) {
      onSave(calculationName)
    }
  }
  return (
    <div className="border-b bg-card">
      <div className="max-w-[1400px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="w-16 h-16 bg-orange-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xl">BRA</span>
            </div>
            <div className="text-left flex-1">
              <Input
                value={calculationName}
                required
                onChange={(e) => setCalculationName(e.target.value)}
                className="text-xxl font-semibold h-auto py-1 px-2 border-0 bg-transparent hover:bg-accent/50 focus:bg-background focus:border focus:border-input rounded-md mb-2 -ml-2 w-[400px] max-w-none"
                placeholder="Kalkylnamn"
              />
              <p className="text-sm text-muted-foreground">{new Date().toISOString().split('T')[0]}</p>
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
          <button 
          className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-lg transition-colors"
          onClick={onClose}
          >
            <Home className="w-4 h-4" />
            Hem
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-lg transition-colors">
                <Download className="w-4 h-4" />
                Exportera
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onExportPDF}>
                <FileText className="w-4 h-4" />
                Exportera som PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExportCSV}>
                <FileSpreadsheet className="w-4 h-4" />
                Exportera som Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="ml-auto flex items-center gap-3">
            <ShimmerButton onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Spara
            </ShimmerButton>
          </div>
        </div>
      </div>
    </div>
  )
}

