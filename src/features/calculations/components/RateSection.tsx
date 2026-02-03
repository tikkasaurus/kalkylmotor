import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CustomerSearchCombobox } from '@/features/calculations/components/CustomerSearchCombobox'
import type { Customer } from '@/features/calculations/api/types'

interface RateSectionProps {
  rate: number
  area: number
  co2Budget: number
  totalCO2: number
  bidAmount: number
  selectedCustomer?: Customer | null
  onChangeRate: (value: number) => void
  onChangeArea: (value: number) => void
  onChangeCo2Budget: (value: number) => void
  onCustomerChange: (customer: Customer | null) => void
}

export function RateSection({
  rate,
  area,
  co2Budget,
  totalCO2,
  bidAmount,
  selectedCustomer,
  onChangeRate,
  onChangeArea,
  onChangeCo2Budget,
  onCustomerChange,
}: RateSectionProps) {
  const co2BudgetTotal = co2Budget * area
  const exceedsBudget = totalCO2 > co2BudgetTotal && co2BudgetTotal > 0
  const costPerKvm = area > 0 ? bidAmount / area : 0

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('sv-SE', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num)
  }

  return (
    <div className="bg-card border p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4 text-left">Arvode</h2>
      <div className="grid grid-cols-4 gap-6 mb-4">
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
          <p className="text-sm text-muted-foreground text-left mt-2">
            Procentuellt arvode på totalkostnaden
          </p>
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
          {area > 0 && (
            <p className="text-sm font-semibold ml-1 mt-2 text-left text-blue-600">
              {formatNumber(costPerKvm)} kr per kvm
            </p>
          )}
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
        <div>
          <Label htmlFor="customer">Kund (frivillig)</Label>
          <div className="mt-2">
            <CustomerSearchCombobox
              value={selectedCustomer}
              onChange={onCustomerChange}
            />
          </div>
        </div>
      </div>
      {exceedsBudget && (
        <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-md flex items-start gap-3">
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
    </div>
  )
}

