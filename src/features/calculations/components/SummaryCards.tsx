interface SummaryCardsProps {
  budgetExclRate: number
  fixedRate: number
  bidAmount: number
  rate: number
  totalCO2: number
  co2Budget: number
  area: number
  formatCurrency: (amount: number) => string
}

export function SummaryCards({
  budgetExclRate,
  fixedRate,
  bidAmount,
  rate,
  totalCO2,
  co2Budget,
  area,
  formatCurrency,
}: SummaryCardsProps) {
  const co2BudgetTotal = co2Budget * area

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('sv-SE', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num)
  }

  return (
    <div className="grid grid-cols-4 gap-4 mb-6 text-left">
      <div className="bg-card border p-4">
        <p className="text-sm text-muted-foreground mb-1">Budget exkl. arvode</p>
        <p className="text-2xl font-semibold">{formatCurrency(budgetExclRate)}</p>
      </div>
      <div className="bg-card border p-4">
        <p className="text-sm text-muted-foreground mb-1">Fastarvode {rate}%</p>
        <p className="text-2xl font-semibold">{formatCurrency(fixedRate)}</p>
      </div>
      <div className="bg-card border rounded-md p-4">
        <p className="text-sm text-muted-foreground mb-1">CO2-budget</p>
        {co2BudgetTotal > 0 ? (
          <p className="text-2xl font-semibold">
            {formatNumber(totalCO2)} / {formatNumber(co2BudgetTotal)} kg
          </p>
        ) : (
          <p className="text-2xl font-semibold">
            {formatNumber(totalCO2)} kg
          </p>
        )}
      </div>
      <div className="bg-card border p-4">
        <p className="text-sm text-blue-600 mb-1">Anbudssumma</p>
        <p className="text-2xl font-semibold text-blue-600">
          {formatCurrency(bidAmount)}
        </p>
      </div>
    </div>
  )
}

