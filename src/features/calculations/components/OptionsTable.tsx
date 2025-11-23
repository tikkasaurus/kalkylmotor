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
    <div className="bg-card border rounded-lg p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Option</h2>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">BENÄMNING</TableHead>
            <TableHead className="w-[150px] text-right">ANTAL</TableHead>
            <TableHead className="w-[150px]">ENHET</TableHead>
            <TableHead className="w-[150px] text-right">PRIS/ENHET</TableHead>
            <TableHead className="w-[150px] text-right">SUMMA</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {options.map((option) => (
            <TableRow key={option.id} className="hover:bg-card">
              <TableCell>
                <Input 
                  type="text" 
                  value={option.description} 
                  onChange={(e) => updateOptionField(option.id, 'description', e.target.value)}
                  className="h-8"
                  placeholder="Lägg till option..."
                />
              </TableCell>
              <TableCell className="text-right">
                <Input 
                  type="number" 
                  value={option.quantity} 
                  onChange={(e) => updateOptionField(option.id, 'quantity', Number(e.target.value))}
                  className="h-8 text-right"
                />
              </TableCell>
              <TableCell>
                <select 
                  value={option.unit}
                  onChange={(e) => updateOptionField(option.id, 'unit', e.target.value)}
                  className="h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                >
                  <option value="m2">m2</option>
                  <option value="m3">m3</option>
                  <option value="m">m</option>
                  <option value="st">st</option>
                </select>
              </TableCell>
              <TableCell className="text-right">
                <Input 
                  type="number" 
                  value={option.pricePerUnit} 
                  onChange={(e) => updateOptionField(option.id, 'pricePerUnit', Number(e.target.value))}
                  className="h-8 text-right"
                />
              </TableCell>
              <TableCell className="text-right font-semibold">
                {formatCurrency(option.quantity * option.pricePerUnit)}
              </TableCell>
              <TableCell>
                <button
                  onClick={() => deleteOption(option.id)}
                  className="h-8 w-8 flex items-center justify-center hover:bg-destructive/10 hover:text-destructive rounded transition-colors"
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
        <button 
          onClick={addNewOption}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Plus className="w-4 h-4" />
          Lägg till option
        </button>
      </div>
    </div>
  )
}

