import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertTriangle } from 'lucide-react'

interface RateSectionProps {
  rate: number
  area: number
  co2Budget: number
  totalCO2: number
  onChangeRate: (value: number) => void
  onChangeArea: (value: number) => void
  onChangeCo2Budget: (value: number) => void
}

export function RateSection({
  rate,
  area,
  co2Budget,
  totalCO2,
  onChangeRate,
  onChangeArea,
  onChangeCo2Budget,
}: RateSectionProps) {
  const co2BudgetTotal = co2Budget * area
  const exceedsBudget = totalCO2 > co2BudgetTotal && co2BudgetTotal > 0

  return (
    <div className="bg-card border p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4 text-left">Arvode</h2>
      <div className="grid grid-cols-3 gap-6 mb-4">
        <div>
          <Label htmlFor="arvode">Arvode (%)</Label>
          <div className="flex items-center gap-2 mt-2">
            <Input
              id="arvode"
              type="number"
              value={rate}
              onChange={(e) => onChangeRate(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-muted-foreground">%</span>
          </div>
        </div>
        <div>
          <Label htmlFor="area">Area (kvm)</Label>
          <div className="flex items-center gap-2 mt-2">
            <Input
              id="area"
              type="number"
              value={area}
              onChange={(e) => onChangeArea(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-muted-foreground">kvm</span>
          </div>
        </div>
        <div>
          <Label htmlFor="co2">CO2 Budget</Label>
          <div className="flex items-center gap-2 mt-2">
            <Input
              id="co2"
              type="number"
              value={co2Budget}
              onChange={(e) => onChangeCo2Budget(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-muted-foreground">kg/kvm</span>
          </div>
        </div>
      </div>
      {exceedsBudget && (
        <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-md flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-destructive mb-1">
              CO2-budgeten överskriden
            </p>
            <p className="text-sm text-destructive/90">
              Den totala CO2-mängden ({totalCO2.toFixed(0)} kg) överskrider budgeten ({co2BudgetTotal.toFixed(0)} kg) med {(totalCO2 - co2BudgetTotal).toFixed(0)} kg.
            </p>
          </div>
        </div>
      )}
      <p className="text-sm text-muted-foreground text-left">
        Procentuellt arvode på totalkostnaden
      </p>
    </div>
  )
}

