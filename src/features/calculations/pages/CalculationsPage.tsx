import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
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
import { NewCalculationPage } from './NewCalculationPage'
import { NewCalculationModal } from '../components/NewCalculationModal'
import { useCalculationsQuery } from '../api/queries'
import { getTemplateById } from '@/lib/calculationTemplates'

export function CalculationsPage() {
  const { data: calculations = [], isLoading, error } = useCalculationsQuery()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showCalculationView, setShowCalculationView] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [animationKey, setAnimationKey] = useState(0)

  // Debug logging
  useEffect(() => {
    if (error) {
      console.error('Error fetching calculations:', error)
    }
    if (calculations) {
      console.log('Calculations data:', calculations)
    }
  }, [error, calculations])

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
    setIsModalOpen(false)
    setShowCalculationView(true)
  }

  const handleCloseCalculationView = () => {
    setShowCalculationView(false)
    setSelectedTemplate(null)
  }

  if (showCalculationView && selectedTemplate) {
    const template = getTemplateById(selectedTemplate)
    return (
      <NewCalculationPage
        template={template}
        onClose={handleCloseCalculationView}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="text-left">
              <h1 className="text-3xl font-bold mb-2">
                <Highlighter action="underline" color="#0099FF">
                  Kalkyler
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
              <ShimmerButton 
                onClick={() => setIsModalOpen(true)}
              >
                <span className="mr-2">+</span> Starta ny kalkyl
              </ShimmerButton>
              <Button variant="outline">Importera kalkyl till budget</Button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left">Kalkyl</TableHead>
                <TableHead className="text-left">Projekt</TableHead>
                <TableHead className="text-left">Status</TableHead>
                <TableHead className="text-left">Kalkylsumma</TableHead>
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
                      <p className="text-xs text-muted-foreground mt-2">
                        Kontrollera att backend-servern körs på http://localhost:3000
                      </p>
                    </div>
                  </TableCell>
                </motion.tr>
              ) : calculations.length === 0 ? (
                <motion.tr>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Inga kalkyler hittades
                  </TableCell>
                </motion.tr>
              ) : (
                calculations.map((calc) => (
                <TableRow
                  key={calc.id}
                  className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors"
                >
                  <TableCell className="text-left">
                    <div className="font-medium">{calc.name}</div>
                    {calc.revision && (
                      <div className="text-sm text-muted-foreground">
                        {calc.revision}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-left">{calc.project}</TableCell>
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
  )
}

