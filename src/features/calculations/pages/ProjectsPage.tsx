import { useState, useEffect, useRef, Fragment } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TextAnimate } from '@/components/ui/text-animate'
import { Highlighter } from '@/components/ui/highlighter'
import NewCalculationPage from './NewCalculationPage'
import { BudgetOverviewPage } from './BudgetOverviewPage'
import { NewCalculationModal } from '../components/NewCalculationModal'
import { useCostEstimatesQuery, useCreateTemplate, useGetCalculation, useInitializeCostEstimate, useCopyCostEstimate, useDeleteCostEstimate, useGetTenantIcon } from '../api/queries'
import { getTemplateById } from '@/lib/calculationTemplates'
import type { GetCalculationsReponse } from '../api/types'
import { FileText, Trash, ChevronRight } from 'lucide-react'
import { toast } from '@/components/ui/toast'

interface GroupedCalculations {
  [projectId: string]: {
    projectId: number | null
    projectName: string
    calculations: any[]
  }
}

export function ProjectsPage() {
  const { data: costEstimates = [], isLoading, error } = useCostEstimatesQuery()
  const { mutate: createTemplate } = useCreateTemplate()
  const { mutate: initializeCostEstimate } = useInitializeCostEstimate()
  const { mutate: copyCostEstimate } = useCopyCostEstimate()
  const { mutate: deleteCostEstimate } = useDeleteCostEstimate()
  const { data: tenantIcon, isLoading: isLoadingTenantIcon } = useGetTenantIcon()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showCalculationView, setShowCalculationView] = useState(false)
  const [showBudgetOverview, setShowBudgetOverview] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null)
  const [selectedCalculation, setSelectedCalculation] = useState<{ id: number; name: string; projectId?: number; projectName?: string } | null>(null)
  const [newCostEstimateId, setNewCostEstimateId] = useState<string | null>(null)
  const [copiedCalculationData, setCopiedCalculationData] = useState<GetCalculationsReponse | null>(null)
  const [animationKey, setAnimationKey] = useState(0)
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())
  const [expandedCalcs, setExpandedCalcs] = useState<Set<number>>(new Set())
  const [contextMenu, setContextMenu] = useState<{
    open: boolean
    x: number
    y: number
    calculation: { id: number; name: string } | null
  }>({
    open: false,
    x: 0,
    y: 0,
    calculation: null,
  })
  const contextMenuRef = useRef<HTMLDivElement>(null)

  // Separate calculations with and without project
  const withProject = costEstimates.filter(calc => calc.projectId)
  const withoutProject = costEstimates.filter(calc => !calc.projectId)

  // Group calculations that have a project
  const groupedCalculations: GroupedCalculations = withProject.reduce((acc, calc) => {
    const projectKey = calc.projectId.toString()
    if (!acc[projectKey]) {
      acc[projectKey] = {
        projectId: calc.projectId,
        projectName: calc.projectName || 'Utan projekt',
        calculations: []
      }
    }
    acc[projectKey].calculations.push(calc)
    return acc
  }, {} as GroupedCalculations)

  // Filter by search term (project name or any calc name within the group)
  const q = searchTerm.toLowerCase()
  const filteredGroups = Object.entries(groupedCalculations).filter(([_, group]) =>
    !searchTerm ||
    group.projectName.toLowerCase().includes(q) ||
    group.calculations.some(c => c.name.toLowerCase().includes(q))
  )

  const filteredUngrouped = searchTerm
    ? withoutProject.filter(calc => calc.name.toLowerCase().includes(q))
    : withoutProject

  // Re-trigger animation while loading
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setAnimationKey((prev) => prev + 1)
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [isLoading])

  const toggleCalc = (calcId: number) => {
    setExpandedCalcs(prev => {
      const next = new Set(prev)
      next.has(calcId) ? next.delete(calcId) : next.add(calcId)
      return next
    })
  }

  const toggleProject = (projectKey: string) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev)
      if (newSet.has(projectKey)) {
        newSet.delete(projectKey)
      } else {
        newSet.add(projectKey)
      }
      return newSet
    })
  }

  const handleTemplateSelect = (templateId: number | string) => {
    const templateIdStr = String(templateId)
    setIsModalOpen(false)

    if (templateIdStr === 'empty') {
      initializeCostEstimate(undefined, {
        onSuccess: (response) => {
          setNewCostEstimateId(String(response.id))
          setCopiedCalculationData(null)
          setSelectedTemplate(null)
          setSelectedCalculation(null)
          setShowCalculationView(true)
        },
        onError: (error) => {
          console.error('Error initializing cost estimate:', error)
        },
      })
    } else {
      const costEstimateId = Number(templateIdStr)
      copyCostEstimate(costEstimateId, {
        onSuccess: (response) => {
          setCopiedCalculationData(response)
          setNewCostEstimateId(null)
          setSelectedTemplate(null)
          setSelectedCalculation(null)
          setShowCalculationView(true)
        },
        onError: (error) => {
          console.error('Error copying cost estimate:', error)
        },
      })
    }
  }

  const handleCloseCalculationView = () => {
    setShowCalculationView(false)
    setSelectedTemplate(null)
    setSelectedCalculation(null)
    setNewCostEstimateId(null)
    setCopiedCalculationData(null)
  }

  const handleCloseBudgetOverview = () => {
    setShowBudgetOverview(false)
  }

  const handleCalculationClick = (calc: { id: number; name: string; projectId?: number; projectName?: string }) => {
    setSelectedTemplate(null)
    setSelectedCalculation({ id: calc.id, name: calc.name, projectId: calc.projectId, projectName: calc.projectName })
    setShowCalculationView(true)
  }

  const handleContextMenu = (e: React.MouseEvent, calc: { id: number; name: string }) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({
      open: true,
      x: e.clientX,
      y: e.clientY,
      calculation: calc,
    })
  }

  const handleCreateTemplate = async () => {
    if (contextMenu.calculation) {
      await createTemplate({
        costEstimateId: contextMenu.calculation.id,
        templateName: contextMenu.calculation.name
      });
      setContextMenu({ open: false, x: 0, y: 0, calculation: null })
      toast.success('Mall skapad')
    }
  }

  const handleConfirmDeleteOpen = () => {
    if (!contextMenu.calculation) return
    setDeleteTarget(contextMenu.calculation)
    setShowDeleteConfirm(true)
    setContextMenu({ open: false, x: 0, y: 0, calculation: null })
  }

  const handleDeleteCostEstimate = async () => {
    if (!deleteTarget) return

    deleteCostEstimate(deleteTarget.id, {
      onSuccess: () => {
        setShowDeleteConfirm(false)
        setDeleteTarget(null)
        if (selectedCalculation?.id === deleteTarget.id) {
          handleCloseCalculationView()
        }
      },
      onError: (err) => {
        console.error('Error deleting cost estimate:', err)
      },
    })
  }

  const costEstimateId = selectedCalculation?.id ? String(selectedCalculation.id) : ''
  const {
    data: existingCalculationData,
    isLoading: isLoadingCalculation,
    error: existingCalculationError,
  } = useGetCalculation(costEstimateId)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setContextMenu({ open: false, x: 0, y: 0, calculation: null })
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setContextMenu({ open: false, x: 0, y: 0, calculation: null })
      }
    }

    if (contextMenu.open) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [contextMenu.open])

  if (showBudgetOverview) {
    return <BudgetOverviewPage onClose={handleCloseBudgetOverview} />
  }

  return (
    <>
      <div className="bg-background p-4 md:p-8">
      <div className="max-w-[2000px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="text-left">
              {tenantIcon ? (
                <img
                  src={tenantIcon}
                  alt="Tenant logo"
                  className="h-12 w-auto object-contain"
                />
              ) : isLoadingTenantIcon ? null : (
                <>
                  <h1 className="text-3xl font-bold mb-2">
                    <Highlighter action="underline" color="#0099FF">
                      Projekt
                    </Highlighter>
                  </h1>
                  <TextAnimate
                    as="p"
                    className="text-muted-foreground"
                    delay={0.2}
                  >
                    Hantera projektkalkyler grupperade per projekt
                  </TextAnimate>
                </>
              )}
              <input
                type="text"
                placeholder="Sök projekt eller kalkyl..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-4 w-full max-w-md px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="default"
                onClick={() => setIsModalOpen(true)}
              >
                <span className="mr-2">+</span> Starta ny kalkyl
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowBudgetOverview(true)}
              >
                Importera kalkyl till budget
              </Button>
            </div>
          </div>
        </div>

        {/* Grouped Table */}
        <div className="bg-card border overflow-x-auto">
          {isLoading ? (
            <div className="text-center text-muted-foreground py-8">
              <motion.div
                animate={{
                  opacity: [1, 0.6, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <TextAnimate
                  key={animationKey}
                  by="character"
                  animation="blurIn"
                  startOnView={false}
                  once={false}
                >
                  Laddar kalkyler...
                </TextAnimate>
              </motion.div>
            </div>
          ) : error ? (
            <div className="text-center text-destructive py-8">
              <p className="font-medium">Fel vid hämtning av kalkyler</p>
              <p className="text-sm text-muted-foreground mt-1">
                {error instanceof Error ? error.message : 'Okänt fel'}
              </p>
            </div>
          ) : filteredGroups.length === 0 && filteredUngrouped.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              {searchTerm ? 'Inga kalkyler matchar sökningen' : 'Inga kalkyler skapade ännu'}
            </div>
          ) : (
            <Table className="min-w-[860px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-left min-w-[180px]">KalkylNamn</TableHead>
                  <TableHead className="text-left min-w-[150px]">Projekt</TableHead>
                  <TableHead className="text-left min-w-[90px]">Status</TableHead>
                  <TableHead className="text-left min-w-[130px]">Kalkylsumma</TableHead>
                  <TableHead className="text-left min-w-[140px]">Kund</TableHead>
                  <TableHead className="text-left min-w-[100px]">Skapad</TableHead>
                  <TableHead className="text-left min-w-[100px]">Skapad av</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Grouped calculations */}
                {filteredGroups.map(([projectKey, group]) => (
                  <Fragment key={projectKey}>
                    {/* Project group header row */}
                    <tr
                      className="bg-muted/50 hover:bg-muted/70 cursor-pointer border-b border-t"
                      onClick={() => toggleProject(projectKey)}
                    >
                      <td colSpan={7} className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <ChevronRight
                            className={`w-4 h-4 transition-transform ${
                              expandedProjects.has(projectKey) ? 'rotate-90' : ''
                            }`}
                          />
                          <span className="font-semibold text-sm">{group.projectName}</span>
                        </div>
                      </td>
                    </tr>

                    {/* Calculation rows */}
                    {expandedProjects.has(projectKey) && group.calculations.map((calc) => (
                      <Fragment key={calc.id}>
                        <TableRow
                          className="hover:bg-muted/30 data-[state=selected]:bg-muted border-b transition-colors cursor-pointer border-l-2 border-l-transparent hover:border-l-primary/30"
                          onClick={() => handleCalculationClick(calc)}
                          onContextMenu={(e) => handleContextMenu(e, calc)}
                        >
                          <TableCell className="text-left pl-6">
                            <div className="flex items-center gap-2">
                              {calc.versions && calc.versions.length > 0 ? (
                                <button
                                  onClick={(e) => { e.stopPropagation(); toggleCalc(calc.id) }}
                                  className="p-0.5 rounded hover:bg-muted shrink-0"
                                >
                                  <ChevronRight className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${expandedCalcs.has(calc.id) ? 'rotate-90' : ''}`} />
                                </button>
                              ) : (
                                <span className="w-5 shrink-0" />
                              )}
                              <span className="font-medium">{calc.name}</span>
                              {calc.versions && calc.versions.length > 0 && (
                                <Badge variant="outline" className="text-xs text-muted-foreground">{calc.versions.length} rev</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-left text-muted-foreground">{calc.projectName || '-'}</TableCell>
                          <TableCell className="text-left">
                            <Badge variant={calc.status === 'Active' ? 'default' : 'secondary'}>
                              {calc.status === 'Active' ? 'Aktiv' : 'Avslutad'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-left font-medium">{calc.versionAmount}</TableCell>
                          <TableCell className="text-left text-muted-foreground">{calc.customerName || '-'}</TableCell>
                          <TableCell className="text-left text-muted-foreground">{calc.created.split('T')[0]}</TableCell>
                          <TableCell className="text-left text-muted-foreground">{calc.createdByName}</TableCell>
                        </TableRow>
                      </Fragment>
                    ))}
                  </Fragment>
                ))}

                {/* Ungrouped calculations (no project) */}
                {filteredUngrouped.map((calc) => (
                  <Fragment key={calc.id}>
                    <TableRow
                      className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors cursor-pointer"
                      onClick={() => handleCalculationClick(calc)}
                      onContextMenu={(e) => handleContextMenu(e, calc)}
                    >
                      <TableCell className="text-left">
                        <div className="flex items-center gap-2">
                          {calc.versions && calc.versions.length > 0 ? (
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleCalc(calc.id) }}
                              className="p-0.5 rounded hover:bg-muted shrink-0"
                            >
                              <ChevronRight className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${expandedCalcs.has(calc.id) ? 'rotate-90' : ''}`} />
                            </button>
                          ) : (
                            <span className="w-5 shrink-0" />
                          )}
                          <span className="font-medium">{calc.name}</span>
                          {calc.versions && calc.versions.length > 0 && (
                            <Badge variant="outline" className="text-xs text-muted-foreground">{calc.versions.length} rev</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-left text-muted-foreground">-</TableCell>
                      <TableCell className="text-left">
                        <Badge variant={calc.status === 'Active' ? 'default' : 'secondary'}>
                          {calc.status === 'Active' ? 'Aktiv' : 'Avslutad'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-left font-medium">{calc.versionAmount}</TableCell>
                      <TableCell className="text-left text-muted-foreground">{calc.customerName || '-'}</TableCell>
                      <TableCell className="text-left text-muted-foreground">{calc.created.split('T')[0]}</TableCell>
                      <TableCell className="text-left text-muted-foreground">{calc.createdByName}</TableCell>
                    </TableRow>
                    {expandedCalcs.has(calc.id) && calc.versions?.map((version, idx) => (
                      <TableRow key={version.id} className="bg-muted/10 hover:bg-muted/20 border-b">
                        <TableCell className="text-left pl-10">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Rev {idx + 1}</span>
                            {version.versionName && (
                              <span className="text-sm text-muted-foreground/70">– {version.versionName}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell />
                        <TableCell className="text-left">
                          <Badge variant="secondary">Avslutad</Badge>
                        </TableCell>
                        <TableCell className="text-left text-sm text-muted-foreground">{version.amount}</TableCell>
                        <TableCell className="text-left text-sm text-muted-foreground">{calc.customerName || '-'}</TableCell>
                        <TableCell className="text-left text-sm text-muted-foreground">{version.created.split('T')[0]}</TableCell>
                        <TableCell className="text-left text-sm text-muted-foreground">{version.createdByName}</TableCell>
                      </TableRow>
                    ))}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <NewCalculationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTemplateSelect={handleTemplateSelect}
      />
      </div>

      {showBudgetOverview && (
        <BudgetOverviewPage onClose={handleCloseBudgetOverview} />
      )}

      {!showBudgetOverview && (
        <AnimatePresence mode="wait">
          {showCalculationView && (
            newCostEstimateId ? (
              <motion.div key="initialized">
                <NewCalculationPage
                  costEstimateId={newCostEstimateId}
                  onClose={handleCloseCalculationView}
                />
              </motion.div>
            ) : copiedCalculationData ? (
              <motion.div key="copied">
                <NewCalculationPage
                  existingCalculation={copiedCalculationData}
                  onClose={handleCloseCalculationView}
                />
              </motion.div>
            ) : selectedTemplate ? (
              <motion.div key="template">
                <NewCalculationPage
                  template={getTemplateById(String(selectedTemplate))}
                  onClose={handleCloseCalculationView}
                  initialCalculationName={selectedCalculation?.name}
                />
              </motion.div>
            ) : selectedCalculation ? (
              <motion.div key="calculation">
                <NewCalculationPage
                  costEstimateId={costEstimateId}
                  existingCalculation={existingCalculationData}
                  existingCalculationLoading={isLoadingCalculation}
                  existingCalculationError={existingCalculationError}
                  onClose={handleCloseCalculationView}
                  initialCalculationName={selectedCalculation.name}
                  defaultProject={
                    selectedCalculation.projectId && selectedCalculation.projectName
                      ? { id: selectedCalculation.projectId, name: selectedCalculation.projectName }
                      : null
                  }
                />
              </motion.div>
            ) : null
          )}
        </AnimatePresence>
      )}

      {contextMenu.open && (
        <div
          ref={contextMenuRef}
          className="fixed z-50 min-w-[12rem] rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleCreateTemplate}
            className="relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
          >
            <FileText className="h-4 w-4 text-muted-foreground" />
            Skapa mall från denna kalkyl
          </button>
          <button
            onClick={handleConfirmDeleteOpen}
            className="relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-red-500 outline-none transition-colors hover:bg-accent hover:text-red-600 focus:bg-accent focus:text-red-600"
          >
            <Trash className="h-4 w-4 text-muted-foreground" />
            Ta bort kalkyl
          </button>
        </div>
      )}

      <Dialog
        open={showDeleteConfirm}
        onOpenChange={(open) => {
          setShowDeleteConfirm(open)
          if (!open) setDeleteTarget(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bekräfta borttagning</DialogTitle>
            <DialogDescription>
              Är du säker på att du vill ta bort kalkylen? Denna åtgärd går inte att ångra i efterhand.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Avbryt
            </Button>
            <Button variant="destructive" onClick={handleDeleteCostEstimate}>
              Ok
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
