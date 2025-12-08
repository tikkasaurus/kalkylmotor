import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import confetti from 'canvas-confetti'
import { Button } from '@/components/ui/button'
import { ShimmerButton } from '@/components/ui/shimmer-button'
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
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler'
import { NewCalculationPage } from './NewCalculationPage'
import { BudgetOverviewPage } from './BudgetOverviewPage'
import { NewCalculationModal } from '../components/NewCalculationModal'
import { useCalculationsQuery } from '../api/queries'
import { getTemplateById } from '@/lib/calculationTemplates'
import { FileText } from 'lucide-react'

export function CalculationsPage() {
  const { data: calculations = [], isLoading, error } = useCalculationsQuery()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showCalculationView, setShowCalculationView] = useState(false)
  const [showBudgetOverview, setShowBudgetOverview] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [selectedCalculation, setSelectedCalculation] = useState<{ name: string } | null>(null)
  const [animationKey, setAnimationKey] = useState(0)
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

  // Re-trigger animation while loading
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setAnimationKey((prev) => prev + 1)
      }, 2000) // Re-animate every 2 seconds
      return () => clearInterval(interval)
    }
  }, [isLoading])

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
    setSelectedCalculation(null)
    setIsModalOpen(false)
    setShowCalculationView(true)
  }

  const handleCloseCalculationView = () => {
    setShowCalculationView(false)
    setSelectedTemplate(null)
    setSelectedCalculation(null)
  }

  const handleCloseBudgetOverview = () => {
    setShowBudgetOverview(false)
  }

  const handleCalculationClick = (calc: { id: number; name: string }) => {
    setSelectedTemplate(null)
    setSelectedCalculation({ name: calc.name })
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

  const handleCreateTemplate = () => {
    if (contextMenu.calculation) {
      console.log('Creating template from calculation:', contextMenu.calculation.id);
      setContextMenu({ open: false, x: 0, y: 0, calculation: null })
    }
  }

  // Close context menu when clicking outside or pressing Escape
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

  const handleSaveSuccess = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.5, y: 0 },
      gravity: 1.5,
      colors: ['#0099FF', '#00FF99', '#FF9900', '#FF0099', '#9900FF'],
    })
  }

  // Show budget overview if active
  if (showBudgetOverview) {
    return <BudgetOverviewPage onClose={handleCloseBudgetOverview} />
  }

  return (
    <>
      <div className="min-h-screen bg-background p-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="text-left">
              <h1 className="text-3xl font-bold mb-2">
                <Highlighter action="underline" color="#0099FF">
                  Kalkylmodul
                </Highlighter>
              </h1>
              <TextAnimate
                as="p"
                className="text-muted-foreground"
                delay={0.2}
              >
                Hantera och skapa projektkalkyler
              </TextAnimate>
            </div>
            <div className="flex gap-3">
              <AnimatedThemeToggler />
              <ShimmerButton 
                onClick={() => setIsModalOpen(true)}
              >
                <span className="mr-2">+</span> Starta ny kalkyl
              </ShimmerButton>
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
                <TableHead className="text-left">Skapad</TableHead>
                <TableHead className="text-left">Skapad av</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <motion.tr>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
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
                  <TableCell colSpan={5} className="text-center text-destructive py-8">
                    <div>
                      <p className="font-medium">Fel vid hämtning av kalkyler</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {error instanceof Error ? error.message : 'Okänt fel'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Kontrollera att backend-servern körs på http://localhost:3000
                      </p>
                    </div>
                  </TableCell>
                </motion.tr>
              ) : calculations.length === 0 ? (
                <motion.tr>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Inga kalkyler hittades
                  </TableCell>
                </motion.tr>
              ) : (
                calculations.map((calc) => (
                <TableRow
                  key={calc.id}
                  className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors cursor-pointer"
                  onClick={() => handleCalculationClick(calc)}
                  onContextMenu={(e) => handleContextMenu(e, calc)}
                >
                  <TableCell className="text-left">
                    <div className="font-medium">{calc.name}</div>
                    {calc.revision && (
                      <div className="text-sm text-muted-foreground">
                        {calc.revision}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-left">
                    <Badge
                      variant={
                        calc.status === 'Aktiv' ? 'default' : 'secondary'
                      }
                    >
                      {calc.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-left font-medium">{calc.amount}</TableCell>
                  <TableCell className="text-left text-muted-foreground">
                    {calc.created}
                  </TableCell>
                  <TableCell className="text-left text-muted-foreground">
                    {calc.createdBy}
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

      {/* Budget Overview Page */}
      {showBudgetOverview && (
        <BudgetOverviewPage onClose={handleCloseBudgetOverview} />
      )}

      {/* NewCalculationPage as modal overlay */}
      {!showBudgetOverview && (
        <AnimatePresence mode="wait">
          {showCalculationView && (
            selectedTemplate ? (
              <NewCalculationPage
                key="template"
                template={getTemplateById(selectedTemplate)}
                onClose={handleCloseCalculationView}
                onSaveSuccess={handleSaveSuccess}
                initialCalculationName={selectedCalculation?.name}
              />
            ) : selectedCalculation ? (
              <NewCalculationPage
                key="calculation"
                onClose={handleCloseCalculationView}
                onSaveSuccess={handleSaveSuccess}
                initialCalculationName={selectedCalculation.name}
              />
            ) : null
          )}
        </AnimatePresence>
      )}

      {/* Context Menu */}
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
        </div>
      )}
    </>
  )
}

