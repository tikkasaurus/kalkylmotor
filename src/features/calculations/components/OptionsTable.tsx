import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Calculator, Plus, X } from 'lucide-react'
import type { OptionRow } from '@/features/calculations/api/types'
import { Button } from '@/components/ui/button'

interface OptionsTableProps {
  options: OptionRow[]
  formatCurrency: (amount: number) => string
  addNewOption: () => void
  updateOptionField: (optionId: number, field: keyof OptionRow, value: string | number) => void
  deleteOption: (optionId: number) => void
}

export function OptionsTable({
  options,
  formatCurrency,
  addNewOption,
  updateOptionField,
  deleteOption,
}: OptionsTableProps) {
  return (
    <div className="bg-card border p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Option</h2>
        </div>
      </div>

      <Table className="border border-border">
        <TableHeader>
          <TableRow className="border-b border-border">
            <TableHead className="text-gray-600 w-[300px] border-r border-border bg-muted/50 font-semibold">BENÄMNING</TableHead>
            <TableHead className="text-gray-600 w-[150px] text-right border-r border-border bg-muted/50 font-semibold">ANTAL</TableHead>
            <TableHead className="text-gray-600 w-[150px] border-r border-border bg-muted/50 font-semibold">ENHET</TableHead>
            <TableHead className="text-gray-600 w-[150px] text-right border-r border-border bg-muted/50 font-semibold">PRIS/ENHET</TableHead>
            <TableHead className="text-gray-600 w-[150px] text-right border-r border-border bg-muted/50 font-semibold">SUMMA</TableHead>
            <TableHead className="w-[50px] bg-muted/50 font-semibold"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {options.map((option) => (
            <TableRow key={option.id} className="hover:bg-muted/30 border-b border-border">
              <TableCell className="border-r border-border p-0 h-10 align-middle">
                <Input 
                  type="text" 
                  value={option.description} 
                  onChange={(e) => updateOptionField(option.id, 'description', e.target.value)}
                  className="!h-10 w-full border-0 rounded-none px-2 !py-0 focus:bg-accent focus:outline-none"
                  placeholder="Lägg till option..."
                />
              </TableCell>
              <TableCell className="text-right border-r border-border p-0 h-10 align-middle">
                <Input 
                  type="number" 
                  value={option.quantity} 
                  onChange={(e) => updateOptionField(option.id, 'quantity', Number(e.target.value))}
                  className="!h-10 w-full text-right border-0 rounded-none px-2 !py-0 focus:bg-accent focus:outline-none"
                />
              </TableCell>
              <TableCell className="border-r border-border p-0 h-10 align-middle">
                <select 
                  value={option.unit}
                  onChange={(e) => updateOptionField(option.id, 'unit', e.target.value)}
                  className="h-10 w-full border-0 rounded-none bg-background px-2 py-0 text-sm focus:bg-accent focus:outline-none"
                >
                  <option value="st">st</option>
                  <option value="m2">m2</option>
                  <option value="m3">m3</option>
                  <option value="tim">tim</option>
                  <option value="liter">liter</option>
                  <option value="kg">kg</option>
                  <option value="ton">ton</option>
                  <option value="m">m</option>
                  <option value="löpm">löpm</option>
                  <option value="kr">kr</option>
                </select>
              </TableCell>
              <TableCell className="text-right border-r border-border p-0 h-10 align-middle">
                <Input 
                  type="number" 
                  value={option.pricePerUnit} 
                  onChange={(e) => updateOptionField(option.id, 'pricePerUnit', Number(e.target.value))}
                  className="!h-10 w-full text-right border-0 rounded-none px-2 !py-0 focus:bg-accent focus:outline-none"
                />
              </TableCell>
              <TableCell className="text-right font-semibold border-r border-border h-10 px-2 align-middle">
                {formatCurrency(option.quantity * option.pricePerUnit)}
              </TableCell>
              <TableCell className="p-0 h-10 align-middle">
                <button
                  onClick={() => deleteOption(option.id)}
                  className="h-full w-full flex items-center justify-center hover:bg-destructive/10 hover:text-destructive transition-colors"
                  title="Ta bort option"
                >
                  <X className="w-4 h-4" />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <div className="mt-4">
        <Button 
          onClick={addNewOption}
          variant="outline"
          className="flex items-center gap-2 text-sm hover:text-foreground"
        >
          <Plus className="w-4 h-4" />
          Lägg till option
        </Button>
      </div>
    </div>
  )
}

