import './App.css'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CalculationView } from '@/components/CalculationView'
import { NewCalculationModal } from '@/components/NewCalculationModal'

// Sample data
const calculations = [
  {
    id: 1,
    name: 'Tosito, Nässjö: Centrallager Trafikverket',
    url: '/projekt/tosito/huvudkalkyl',
    project: 'Marcus Test',
    status: 'Aktiv',
    amount: '217 475 390 kr',
    created: '2025-01-05',
    createdBy: 'Gustaf',
  },
  {
    id: 2,
    name: 'Industri Norrköping',
    revision: 'Rev 3',
    url: '/projekt/industri/huvudkalkyl',
    project: 'Industri Norrköping',
    status: 'Aktiv',
    amount: '145 890 000 kr',
    created: '2025-01-10',
    createdBy: 'Maria Johansson',
  },
  {
    id: 3,
    name: 'Villa Lindgren - Huvudkalkyl',
    url: '/projekt/villa-lindgren/kalkyl',
    project: 'Villa Lindgren',
    status: 'Aktiv',
    amount: '8 450 000 kr',
    created: '2025-01-03',
    createdBy: 'Anna Svensson',
  },
  {
    id: 4,
    name: 'Kontorsbyggnad AB - Anbud',
    url: '/projekt/kontorsbyggnad/anbud',
    project: 'Kontorsbyggnad',
    status: 'Aktiv',
    amount: '32 150 000 kr',
    created: '2024-12-20',
    createdBy: 'Erik Andersson',
  },
  {
    id: 5,
    name: 'Ombyggnad radhus',
    url: '/projekt/radhus/ombyggnad',
    project: 'Radhus Malmö',
    status: 'Avslutad',
    amount: '4 225 000 kr',
    created: '2024-11-28',
    createdBy: 'Peter Nilsson',
  },
]

function App() {
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
    return (
      <CalculationView
        templateId={selectedTemplate}
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
              <h1 className="text-3xl font-bold mb-2">Kalkyler</h1>
              <p className="text-muted-foreground">
                Hantera och skapa projektkalkyler
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setIsModalOpen(true)}>
                <span className="mr-2">+</span> Starta ny kalkyl
              </Button>
              <Button variant="outline">Importera kalkyl till budget</Button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kalkyl</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Projekt</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Kalkylsumma</TableHead>
                <TableHead>Skapad</TableHead>
                <TableHead>Skapad av</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {calculations.map((calc) => (
                <TableRow key={calc.id}>
                  <TableCell>
                    <div className="font-medium">{calc.name}</div>
                    {calc.revision && (
                      <div className="text-sm text-muted-foreground">
                        {calc.revision}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {calc.url}
                  </TableCell>
                  <TableCell>{calc.project}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        calc.status === 'Aktiv' ? 'default' : 'secondary'
                      }
                    >
                      {calc.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{calc.amount}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {calc.created}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
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

export default App
