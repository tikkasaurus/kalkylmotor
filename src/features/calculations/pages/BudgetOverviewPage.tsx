import { Button } from '@/components/ui/button'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import { Play, Plus, ArrowLeft } from 'lucide-react'

interface BudgetOverviewPageProps {
  onClose: () => void
}

export function BudgetOverviewPage({ onClose }: BudgetOverviewPageProps) {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-accent rounded transition-colors"
              title="Tillbaka"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-3xl font-bold">Budgetöversikt</h1>
          </div>
          <ShimmerButton>
            <Plus className="w-4 h-4 mr-2" />
            Lägg till budgetrad
          </ShimmerButton>
        </div>

        {/* Demo Mode Section */}
        <div className="border bg-card p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold mb-1">Demo-läge (60 sekunder)</h2>
              <p className="text-sm text-muted-foreground">
                Automatisk genomgång av importprocessen
              </p>
            </div>
            <Button variant="default">
              <Play className="w-4 h-4 mr-2" />
              Starta demo
            </Button>
          </div>
        </div>

        {/* Empty State */}
        <div className="border bg-card p-12 text-center">
          <p className="text-muted-foreground">
            Budgetvy kommer här. Klicka på "Lägg till budgetrad" för att importera från Kalkyl.
          </p>
        </div>
      </div>
    </div>
  )
}

