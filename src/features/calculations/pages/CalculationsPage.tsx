import { useState } from 'react'
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
import { NewCalculationPage } from './NewCalculationPage'
import { NewCalculationModal } from '../components/NewCalculationModal'
import { sampleCalculations } from '../api/queries'
import { getTemplateById } from '@/lib/calculationTemplates'

export function CalculationsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showCalculationView, setShowCalculationView] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

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
              <TextAnimate
                as="h1"
                className="text-3xl font-bold mb-2"
              >
                Kalkyler
              </TextAnimate>
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
                borderRadius="10px" 
                onClick={() => setIsModalOpen(true)}
                className="h-9"
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
              {sampleCalculations.map((calc) => (
                <TableRow key={calc.id}>
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
              ))}
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

