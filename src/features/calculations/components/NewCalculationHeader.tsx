import { useState } from 'react'
import { Input } from '@/components/ui/input'
import {
  Home,
  FileText,
  Save,
  GitBranchPlus,
  ChevronDown,
  Check,
  X,
  // FileSpreadsheet,
} from 'lucide-react'
import { useGetTenantIcon } from '../api/queries'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { CostEstimateVersion } from '../api/types'

interface NewCalculationHeaderProps {
  onClose: () => void
  onExportCSV: () => void
  onExportPDF?: (format: 'a4' | 'full') => void
  onSave?: (calculationName: string) => Promise<void> | void
  onSaveDiff?: (calculationName: string) => Promise<void> | void
  canSaveDiff?: boolean
  onSaveAsVersion?: () => void
  canSaveAsVersion?: boolean
  calculationName: string
  onCalculationNameChange: (value: string) => void
  readOnly?: boolean
  versions?: CostEstimateVersion[]
  currentVersionId?: number
  loadedVersionId?: number
  onSelectVersion?: (versionId: number) => void
}

export function NewCalculationHeader({
  onClose,
  // onExportCSV,
  onExportPDF,
  onSave,
  onSaveDiff,
  canSaveDiff = false,
  onSaveAsVersion,
  canSaveAsVersion = false,
  calculationName,
  onCalculationNameChange,
  readOnly = false,
  versions,
  currentVersionId,
  loadedVersionId,
  onSelectVersion,
}: NewCalculationHeaderProps) {
  const sortedVersions = versions ? [...versions].sort((a, b) => Number(a.versionNo) - Number(b.versionNo)) : []
  const activeVersion = loadedVersionId
    ? sortedVersions.find((v) => v.id === loadedVersionId)
    : sortedVersions.find((v) => v.id === currentVersionId)
  const showVersionDropdown = !!onSelectVersion && sortedVersions.length > 0
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

  const handleSaveDiff = async () => {
    if (!onSaveDiff || isSaving) return
    try {
      setIsSaving(true)
      await onSaveDiff(calculationName)
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
                disabled={readOnly}
                onChange={(e) => onCalculationNameChange(e.target.value)}
                className="!text-xl md:!text-xl font-bold h-auto py-2 px-2 border-0 bg-transparent hover:bg-accent/50 focus:bg-background focus:border focus:border-input mb-1 -ml-2 w-[500px] max-w-none"
                placeholder="Kalkylnamn"
              />
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>{new Date().toISOString().split('T')[0]}</span>
                {showVersionDropdown && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-1.5 rounded px-2 py-1 hover:bg-accent transition-colors text-foreground">
                        <span className="font-medium">
                          Revision {activeVersion?.versionNo ?? '?'}
                          {activeVersion?.versionName ? ` – ${activeVersion.versionName}` : ''}
                        </span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="min-w-[240px]">
                      <DropdownMenuLabel>Versioner</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {sortedVersions.map((v) => {
                        const isActive = v.id === activeVersion?.id
                        const isCurrent = v.id === currentVersionId
                        return (
                          <DropdownMenuItem
                            key={v.id}
                            onSelect={() => onSelectVersion?.(v.id)}
                            className="flex items-center justify-between gap-2"
                          >
                            <span className="flex items-center gap-2">
                              {isActive ? <Check className="w-3.5 h-3.5" /> : <span className="w-3.5" />}
                              <span>Rev {v.versionNo}{v.versionName ? ` – ${v.versionName}` : ''}</span>
                            </span>
                            {isCurrent && (
                              <span className="text-xs text-muted-foreground">Aktuell</span>
                            )}
                          </DropdownMenuItem>
                        )
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
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
            {!readOnly && onSaveAsVersion && (
              <Button
                variant="outline"
                onClick={onSaveAsVersion}
                disabled={!canSaveAsVersion || isSaving}
                title={canSaveAsVersion ? 'Skapa en ny version som kopia av den nuvarande' : 'Spara kalkylen först för att kunna skapa en ny version'}
              >
                <GitBranchPlus className="w-4 h-4 mr-2" />
                Spara som ny version
              </Button>
            )}
            {!readOnly && (
              <div className="inline-flex">
                <Button
                  variant="default"
                  onClick={handleSave}
                  disabled={isSaving}
                  className={onSaveDiff ? 'rounded-r-none' : ''}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Sparar...' : 'Spara'}
                </Button>
                {onSaveDiff && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="default"
                        disabled={isSaving}
                        className="rounded-l-none border-l border-white/20 px-2"
                        aria-label="Fler sparalternativ"
                        title="Fler sparalternativ"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-[240px]">
                      <DropdownMenuItem
                        disabled={!canSaveDiff || isSaving}
                        onSelect={(e) => {
                          e.preventDefault()
                          handleSaveDiff()
                        }}
                      >
                        Spara endast ändringar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            )}
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

