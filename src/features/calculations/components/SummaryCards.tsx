interface SummaryCardsProps {
  budgetExclRate: number
  fixedRate: number
  bidAmount: number
  rate: number
  formatCurrency: (amount: number) => string
}

export function SummaryCards({
  budgetExclRate,
  fixedRate,
  bidAmount,
  rate,
  formatCurrency,
}: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-6 text-left">
      <div className="bg-card border rounded-lg p-4">
        <p className="text-sm text-muted-foreground mb-1">Budget exkl. arvode</p>
        <p className="text-2xl font-semibold">{formatCurrency(budgetExclRate)}</p>
      </div>
      <div className="bg-card border rounded-lg p-4">
        <p className="text-sm text-muted-foreground mb-1">Fastarvode {rate}%</p>
        <p className="text-2xl font-semibold">{formatCurrency(fixedRate)}</p>
      </div>
      <div className="bg-card border rounded-lg p-4">
        <p className="text-sm text-blue-600 mb-1">Anbudssumma</p>
        <p className="text-2xl font-semibold text-blue-600">
          {formatCurrency(bidAmount)}
        </p>
      </div>
    </div>
  )
}

