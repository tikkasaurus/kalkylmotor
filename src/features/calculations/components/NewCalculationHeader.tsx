import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Home,
  FileText,
  Upload,
  Settings,
  Download,
  Save,
  X,
  FileSpreadsheet,
} from 'lucide-react'

interface NewCalculationHeaderProps {
  onClose: () => void
  onExportCSV: () => void
}

export function NewCalculationHeader({ onClose, onExportCSV }: NewCalculationHeaderProps) {
  return (
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
              <DropdownMenuItem onClick={onExportCSV}>
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
  )
}

