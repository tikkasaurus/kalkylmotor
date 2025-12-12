import { useState, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import { Plus, ArrowLeft, Check, FileText } from 'lucide-react'
import { useGetProjects, useCostEstimatesQuery, useGetAccounts } from '@/features/calculations/api/queries'
import { apiClient } from '@/lib/api-client'
import type { GetCalculationsReponse, BudgetRowPayload, OptionBudgetRowPayload, CalculationSectionPayload } from '@/features/calculations/api/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface BudgetOverviewPageProps {
  onClose: () => void
}

interface ProgressStep {
  id: 'project' | 'calculation' | 'preview'
  label: string
}

function ProgressIndicator({ currentStep }: { currentStep: 'project' | 'calculation' | 'preview' }) {
  const steps: ProgressStep[] = [
    { id: 'project', label: 'Välj projekt' },
    { id: 'calculation', label: 'Välj kalkyl' },
    { id: 'preview', label: 'Översikt av kalkyl' },
  ]

  const getStepIndex = (step: string) => {
    return steps.findIndex((s) => s.id === step)
  }

  const currentIndex = getStepIndex(currentStep)

  return (
    <div className="mb-8">
      <div className="flex items-center justify-center">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex
          const isCurrent = index === currentIndex

          return (
            <div key={step.id} className="flex items-center">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    isCurrent
                      ? 'bg-blue-500 text-primary-foreground border-blue-500'
                      : isCompleted
                      ? 'bg-blue-500 text-primary-foreground border-blue-500'
                      : 'bg-background border-muted-foreground text-muted-foreground'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </div>
                <span
                  className={`mt-2 text-sm font-medium ${
                    isCurrent ? 'text-foreground' : isCompleted ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`w-24 h-0.5 mx-4 transition-colors ${
                    isCompleted ? 'bg-blue-500' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface SelectableItem {
  id: number
  name: string
}

interface SelectableListProps {
  title: string
  items: SelectableItem[]
  isLoading: boolean
  selectedId: number | null
  onSelect: (id: number) => void
}

function SelectableList({ title, items, isLoading, selectedId, onSelect }: SelectableListProps) {
  return (
    <div className="border bg-card">
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4 text-left">{title}</h2>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Laddar...
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Inga tillgängliga
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelect(item.id)}
                className="flex items-center justify-between gap-4 p-4 border border-border hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <div className="font-medium text-left">{item.name}</div>
                <Button
                  variant={selectedId === item.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelect(item.id)
                  }}
                  className="flex-shrink-0"
                >
                  {selectedId === item.id ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Vald
                    </>
                  ) : (
                    'Välj'
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface AccountGroup {
  accountNo: number
  accountName: string
  rows: (BudgetRowPayload | OptionBudgetRowPayload)[]
  totalAmount: number
}

function flattenBudgetRows(calculationData: GetCalculationsReponse): (BudgetRowPayload | OptionBudgetRowPayload)[] {
  const rows: (BudgetRowPayload | OptionBudgetRowPayload)[] = []
  
  const flattenSection = (section: CalculationSectionPayload) => {
    rows.push(...section.budgetRows)
    section.subSections?.forEach((subSection) => {
      rows.push(...subSection.budgetRows)
    })
  }
  
  calculationData.sections?.forEach(flattenSection)
  rows.push(...(calculationData.optionBudgetRows || []))
  
  return rows
}

function BudgetPreview({ calculationData }: { calculationData: GetCalculationsReponse }) {
  const { data: accounts = [] } = useGetAccounts()
  
  const accountGroups = useMemo(() => {
    const rows = flattenBudgetRows(calculationData)
    const grouped = new Map<number, AccountGroup>()
    
    rows.forEach((row) => {
      if (row.accountNo === 0) return
      
      if (!grouped.has(row.accountNo)) {
        const account = accounts.find((a) => a.accountNumber === row.accountNo.toString())
        grouped.set(row.accountNo, {
          accountNo: row.accountNo,
          accountName: account ? `${row.accountNo} ${account.description}` : `${row.accountNo}`,
          rows: [],
          totalAmount: 0,
        })
      }
      
      const group = grouped.get(row.accountNo)!
      group.rows.push(row)
      group.totalAmount += row.amount
    })
    
    return Array.from(grouped.values()).sort((a, b) => a.accountNo - b.accountNo)
  }, [calculationData, accounts])
  
  const totalRows = useMemo(() => {
    return flattenBudgetRows(calculationData).length
  }, [calculationData])
  
  const totalCost = useMemo(() => {
    return accountGroups.reduce((sum, group) => sum + group.totalAmount, 0)
  }, [accountGroups])
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount).replace(' kr', ' kr')
  }
  
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="border bg-card p-4">
          <div className="text-sm text-muted-foreground mb-1">Totalt antal rader</div>
          <div className="text-2xl font-semibold">{totalRows}</div>
        </div>
        <div className="border bg-card p-4">
          <div className="text-sm text-muted-foreground mb-1">Total kostnad</div>
          <div className="text-2xl font-semibold">{formatCurrency(totalCost)}</div>
        </div>
        <div className="border bg-card p-4">
          <div className="text-sm text-muted-foreground mb-1">Antal konton</div>
          <div className="text-2xl font-semibold">{accountGroups.length}</div>
        </div>
      </div>
      
      {/* Account Groups */}
      {accountGroups.map((group) => (
        <div key={group.accountNo} className="border bg-card">
          {/* Account Header */}
          <div className="bg-muted/50 p-4 flex items-center justify-between border-b">
            <div className="font-semibold">{group.accountName}</div>
            <div className="text-sm text-muted-foreground">
              {group.rows.length} {group.rows.length === 1 ? 'rad' : 'rader'} {formatCurrency(group.totalAmount)}
            </div>
          </div>
          
          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left">BENÄMNING</TableHead>
                <TableHead className="text-right">ANTAL</TableHead>
                <TableHead className="text-left">ENHET</TableHead>
                <TableHead className="text-right">ENHETSPRIS</TableHead>
                <TableHead className="text-right font-semibold">SUMMA</TableHead>
                <TableHead className="text-left">AKTIVITET</TableHead>
                <TableHead className="text-left">NOTERINGAR</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {group.rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="text-left">{row.name}</TableCell>
                  <TableCell className="text-right">{row.quantity}</TableCell>
                  <TableCell className="text-left">st</TableCell>
                  <TableCell className="text-right">{formatCurrency(row.price)}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(row.amount)}</TableCell>
                  <TableCell className="text-left">-</TableCell>
                  <TableCell className="text-left">{row.notes || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  )
}

export function BudgetOverviewPage({ onClose }: BudgetOverviewPageProps) {
  const queryClient = useQueryClient()
  const [step, setStep] = useState<'project' | 'calculation' | 'preview'>('project')
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null)
  const [selectedCalculationId, setSelectedCalculationId] = useState<number | null>(null)
  const [calculationData, setCalculationData] = useState<GetCalculationsReponse | null>(null)
  const { data: projects = [], isLoading: projectsLoading } = useGetProjects()
  const { data: costEstimates = [], isLoading: costEstimatesLoading } = useCostEstimatesQuery()

  const selectedProject = projects.find((p) => p.id === selectedProjectId)

  const handleSelectProject = (id: number) => {
    setSelectedProjectId(id)
  }

  const handleSelectCalculation = (id: number) => {
    setSelectedCalculationId(id)
  }

  const handleNext = () => {
    if (selectedProjectId) {
      setStep('calculation')
    }
  }

  const handleNextCalculation = async () => {
    if (selectedCalculationId) {
      try {
        const data = await queryClient.fetchQuery({
          queryKey: ['calculation', selectedCalculationId.toString()],
          queryFn: () =>
            apiClient.get<GetCalculationsReponse>(`/CostEstimate/${selectedCalculationId}/calculations`),
        })
        setCalculationData(data)
        setStep('preview')
      } catch (error) {
        console.error('Error fetching calculation:', error)
      }
    }
  }

  const handleBack = () => {
    if (step === 'calculation') {
      setStep('project')
    } else if (step === 'preview') {
      setStep('calculation')
    }
  }

  return (
    <div className="min-h-screen bg-background p-8 pb-32">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={step === 'preview' ? handleBack : onClose}
              className="p-2 hover:bg-accent rounded transition-colors"
              title="Tillbaka"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            {step === 'preview' ? (
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6" />
                <h1 className="text-3xl font-bold">Kalkyl som kommer importeras</h1>
              </div>
            ) : (
              <h1 className="text-3xl font-bold">Budgetöversikt</h1>
            )}
          </div>
        </div>

        {/* Selected Project Display (when in calculation step) */}
        {step === 'calculation' && selectedProject && (
          <div className="border bg-card p-4 mb-6">
            <div className="text-sm text-muted-foreground mb-1 text-left">Valt projekt</div>
            <div className="text-lg font-semibold text-left">{selectedProject.name}</div>
          </div>
        )}

        {/* Projects List */}
        {step === 'project' && (
          <>
            <SelectableList
              title="Välj projekt"
              items={projects}
              isLoading={projectsLoading}
              selectedId={selectedProjectId}
              onSelect={handleSelectProject}
            />
            <div className="mt-6 flex justify-end">
              <Button onClick={handleNext} size="lg" disabled={!selectedProjectId}>
                Nästa
              </Button>
            </div>
          </>
        )}

        {/* Calculations List */}
        {step === 'calculation' && (
          <>
            <SelectableList
              title="Välj kalkyl"
              items={costEstimates.map((calc) => ({
                id: calc.id,
                name: calc.name,
              }))}
              isLoading={costEstimatesLoading}
              selectedId={selectedCalculationId}
              onSelect={handleSelectCalculation}
            />
            <div className="mt-6 flex items-center justify-between">
              <Button onClick={handleBack} size="lg" variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Tillbaka
              </Button>
              <Button onClick={handleNextCalculation} size="lg" disabled={!selectedCalculationId}>
                Nästa
              </Button>
            </div>
          </>
        )}

        {/* Budget Preview */}
        {step === 'preview' && calculationData && (
          <>
            <BudgetPreview calculationData={calculationData} />
            <div className="mt-6 flex items-center justify-between">
              <Button onClick={handleBack} size="lg" variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Tillbaka
              </Button>
              <Button onClick={() => {
                // TODO: Handle import/final step
              }} size="lg">
                Importera kalkyl
              </Button>
            </div>
          </>
        )}
      </div>
      
      {/* Progress Indicator - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-6">
        <div className="max-w-[1400px] mx-auto">
          <ProgressIndicator currentStep={step} />
        </div>
      </div>
    </div>
  )
}

