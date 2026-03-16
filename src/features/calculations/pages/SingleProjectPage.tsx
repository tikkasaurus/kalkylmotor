import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
import { FileText, Trash, ArrowLeft } from 'lucide-react'
import { toast } from '@/components/ui/toast'

export function SingleProjectPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { data: projectCalculations = [], isLoading, error } = useCostEstimatesQuery(projectId)
  const { mutate: createTemplate } = useCreateTemplate()
  const { mutate: initializeCostEstimate } = useInitializeCostEstimate()
  const { mutate: copyCostEstimate } = useCopyCostEstimate()
  const { mutate: deleteCostEstimate } = useDeleteCostEstimate()
  const { data: tenantIcon, isLoading: isLoadingTenantIcon } = useGetTenantIcon()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showCalculationView, setShowCalculationView] = useState(false)
  const [showBudgetOverview, setShowBudgetOverview] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null)
  const [selectedCalculation, setSelectedCalculation] = useState<{ id: number; name: string } | null>(null)
  const [newCostEstimateId, setNewCostEstimateId] = useState<string | null>(null)
  const [copiedCalculationData, setCopiedCalculationData] = useState<GetCalculationsReponse | null>(null)
  const [animationKey, setAnimationKey] = useState(0)
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
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

  const projectName = projectCalculations.length > 0
    ? projectCalculations[0].projectName || 'Utan projekt'
    : 'Projekt'

  const currentProject = projectId
    ? { id: Number(projectId), name: projectName }
    : null

  // Re-trigger animation while loading
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setAnimationKey((prev) => prev + 1)
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [isLoading])

  const handleTemplateSelect = (templateId: number | string) => {
    const templateIdStr = String(templateId)
    setIsModalOpen(false)

    if (templateIdStr === 'empty') {
      initializeCostEstimate(
        projectId ? { projectId: Number(projectId) } : undefined,
        {
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
        },
      )
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

  const handleCalculationClick = (calc: { id: number; name: string }) => {
    setSelectedTemplate(null)
    setSelectedCalculation({ id: calc.id, name: calc.name })
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
      <div className="bg-background p-8">
      <div className="max-w-[2000px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="text-left">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="mb-4 -ml-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Tillbaka till projekt
              </Button>
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
                      {projectName}
                    </Highlighter>
                  </h1>
                  <TextAnimate
                    as="p"
                    className="text-muted-foreground"
                    delay={0.2}
                  >
                    {`${projectCalculations.length} kalkyl${projectCalculations.length !== 1 ? 'er' : ''}`}
                  </TextAnimate>
                </>
              )}
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

        {/* Table */}
        <div className="bg-card border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left">Kalkyl</TableHead>
                <TableHead className="text-left">Status</TableHead>
                <TableHead className="text-left">Kalkylsumma</TableHead>
                <TableHead className="text-left">Kund</TableHead>
                <TableHead className="text-left">Skapad</TableHead>
                <TableHead className="text-left">Skapad av</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <motion.tr>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
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
                  </TableCell>
                </motion.tr>
              ) : error ? (
                <motion.tr>
                  <TableCell colSpan={6} className="text-center text-destructive py-8">
                    <div>
                      <p className="font-medium">Fel vid hämtning av kalkyler</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {error instanceof Error ? error.message : 'Okänt fel'}
                      </p>
                    </div>
                  </TableCell>
                </motion.tr>
              ) : projectCalculations.length === 0 ? (
                <motion.tr>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Inga kalkyler för detta projekt
                  </TableCell>
                </motion.tr>
              ) : (
                projectCalculations.map((calc) => (
                <TableRow
                  key={calc.id}
                  className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors cursor-pointer"
                  onClick={() => handleCalculationClick(calc)}
                  onContextMenu={(e) => handleContextMenu(e, calc)}
                >
                  <TableCell className="text-left">
                    <div className="font-medium">{calc.name}</div>
                  </TableCell>
                  <TableCell className="text-left">
                    <Badge
                      variant={
                        calc.status === 'Active' ? 'default' : 'secondary'
                      }
                    >
                      {calc.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-left font-medium">{calc.versionAmount}</TableCell>
                  <TableCell className="text-left text-muted-foreground">
                    {calc.customerName || '-'}
                  </TableCell>
                  <TableCell className="text-left text-muted-foreground">
                    {calc.created.split('T')[0]}
                  </TableCell>
                  <TableCell className="text-left text-muted-foreground">
                    {calc.createdByName}
                  </TableCell>
                </TableRow>
                ))
              )}
            </TableBody>
          </Table>
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
                  defaultProject={currentProject}
                />
              </motion.div>
            ) : copiedCalculationData ? (
              <motion.div key="copied">
                <NewCalculationPage
                  existingCalculation={copiedCalculationData}
                  onClose={handleCloseCalculationView}
                  defaultProject={currentProject}
                />
              </motion.div>
            ) : selectedTemplate ? (
              <motion.div key="template">
                <NewCalculationPage
                  template={getTemplateById(String(selectedTemplate))}
                  onClose={handleCloseCalculationView}
                  initialCalculationName={selectedCalculation?.name}
                  defaultProject={currentProject}
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
                  defaultProject={currentProject}
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
