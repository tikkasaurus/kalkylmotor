import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FileText, ChevronRight } from 'lucide-react'

interface Template {
  id: string
  title: string
  description: string
  popular: boolean
}

interface NewCalculationModalProps {
  isOpen: boolean
  onClose: () => void
  onTemplateSelect: (templateId: string) => void
}

const calculationTemplates: Template[] = [
  {
    id: 'empty',
    title: 'Tom kalkyl',
    description: 'Starta från en tom kalkyl och bygg upp ditt projekt från grunden',
    popular: false,
  },
  {
    id: 'industrial',
    title: 'Industribyggnad',
    description: 'Mall för industribyggnader med kompletta sektioner och standardvärden',
    popular: true,
  },
  {
    id: 'residential',
    title: 'Bostäder flerfamiljshus',
    description: 'Optimerad för bostadsprojekt med standardrum och installationer',
    popular: true,
  },
  {
    id: 'office',
    title: 'Kontorsbyggnad',
    description: 'Mall för kontorsprojekt med fokus på inredning och tekniska system',
    popular: false,
  },
  {
    id: 'renovation',
    title: 'Renovering & ombyggnad',
    description: 'Anpassad för renoveringsprojekt med rivning och befintliga konstruktioner',
    popular: false,
  },
]

export function NewCalculationModal({
  isOpen,
  onClose,
  onTemplateSelect,
}: NewCalculationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Skapa ny kalkyl</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-4">
          {calculationTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => onTemplateSelect(template.id)}
              className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-accent hover:border-accent-foreground/20 transition-all text-left group"
            >
              <div className="flex-shrink-0 mt-1">
                <div className="w-10 h-10 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-base">{template.title}</h3>
                  {template.popular && (
                    <Badge variant="secondary" className="text-xs">
                      Populär
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {template.description}
                </p>
              </div>
              <div className="flex-shrink-0 mt-1">
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

