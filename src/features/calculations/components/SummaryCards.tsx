interface SummaryCardsProps {
  budgetExclArvode: number
  fastArvode: number
  anbudssumma: number
  arvode: number
  formatCurrency: (amount: number) => string
}

export function SummaryCards({
  budgetExclArvode,
  fastArvode,
  anbudssumma,
  arvode,
  formatCurrency,
}: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="bg-card border rounded-lg p-4">
        <p className="text-sm text-muted-foreground mb-1">Budget exkl. arvode</p>
        <p className="text-2xl font-semibold">{formatCurrency(budgetExclArvode)}</p>
      </div>
      <div className="bg-card border rounded-lg p-4">
        <p className="text-sm text-muted-foreground mb-1">Fastarvode {arvode}%</p>
        <p className="text-2xl font-semibold">{formatCurrency(fastArvode)}</p>
      </div>
      <div className="bg-card border rounded-lg p-4">
        <p className="text-sm text-blue-600 mb-1">Anbudssumma</p>
        <p className="text-2xl font-semibold text-blue-600">
          {formatCurrency(anbudssumma)}
        </p>
      </div>
    </div>
  )
}

