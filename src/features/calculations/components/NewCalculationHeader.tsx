import { useState } from 'react'
import { Input } from '@/components/ui/input'
import {
  Home,
  FileText,
  Save,
  X,
  FileSpreadsheet,
} from 'lucide-react'
import { useGetTenantIcon } from '../api/queries'
import { Button } from '@/components/ui/button'

interface NewCalculationHeaderProps {
  onClose: () => void
  onExportCSV: () => void
  onExportPDF?: (format: 'a4' | 'full') => void
  onSave?: (calculationName: string) => Promise<void> | void
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
  const [isSaving, setIsSaving] = useState(false)
  const { data: tenantIcon } = useGetTenantIcon()

  const handleSave = async () => {
    if (!onSave || isSaving) return
    try {
      setIsSaving(true)
      await onSave(calculationName)
    } finally {
      setIsSaving(false)
    }
  }
  return (
    <div className="border-b bg-card">
      <div className="max-w-[2000px] mx-auto px-6 py-4">
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
              onClick={() => onExportPDF?.('a4')}
              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
            >
              <FileText className="w-4 h-4" />
              Exportera som PDF (A4)
            </button>
            <button
              onClick={() => onExportPDF?.('full')}
              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
            >
              <FileText className="w-4 h-4" />
              Exportera som PDF (Full)
            </button>
            {/*<button */}
            {/*  onClick={onExportCSV}*/}
            {/*  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"*/}
            {/*>*/}
            {/*  <FileSpreadsheet className="w-4 h-4" />*/}
            {/*  Exportera som Excel*/}
            {/*</button>*/}
            <Button variant="default" onClick={handleSave} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Sparar...' : 'Spara'}
            </Button>
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

