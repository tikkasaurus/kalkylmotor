import { useState } from 'react'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import { Input } from '@/components/ui/input'
import {
  Home,
  FileText,
  Save,
  X,
  FileSpreadsheet,
} from 'lucide-react'
import { useGetTenantIcon } from '../api/queries'

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
  const { data: tenantIcon } = useGetTenantIcon()

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
            {tenantIcon && (
              <img 
                src={tenantIcon} 
                alt="Tenant logo" 
                className="w-24 object-contain"
              />
            )}
            <div className="text-left flex-1">
              <Input
                value={calculationName}
                required
                onChange={(e) => setCalculationName(e.target.value)}
                className="!text-xl md:!text-xl font-bold h-auto py-2 px-2 border-0 bg-transparent hover:bg-accent/50 focus:bg-background focus:border focus:border-input mb-1 -ml-2 w-[500px] max-w-none"
                placeholder="Kalkylnamn"
              />
              <p className="text-sm text-muted-foreground">{new Date().toISOString().split('T')[0]}</p>
            </div>  
          </div>

          {/* Right side buttons */}
          <div className="flex items-center gap-3">
            <button 
              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
              onClick={onClose}
            >
              <Home className="w-4 h-4" />
              Hem
            </button>
            <button 
              onClick={onExportPDF}
              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
            >
              <FileText className="w-4 h-4" />
              Exportera som PDF
            </button>
            <button 
              onClick={onExportCSV}
              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Exportera som Excel
            </button>
            <ShimmerButton onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Spara
            </ShimmerButton>
            <button
              onClick={onClose}
              className="p-2 hover:bg-accent transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

