import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Search } from 'lucide-react'
import { useGetCO2Database } from '@/features/calculations/api/queries'

interface CO2Item {
  id: number
  name: string
  category: string
  co2Value: number
  unit: string
}

interface CO2DatabaseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect?: (item: CO2Item) => void
}

export function CO2DatabaseModal({ open, onOpenChange, onSelect }: CO2DatabaseModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const { data: co2Items } = useGetCO2Database();

  const filteredItems = co2Items?.filter(
    (item: CO2Item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelect = (item: CO2Item) => {
    onSelect?.(item)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">CO2-databas</DialogTitle>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Sök och välj en artikel för att hämta CO2-värde
          </p>
        </DialogHeader>

        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Sök på artikelnamn eller kategori..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex-1 overflow-auto mt-4 border rounded-lg">
          <Table>
            <TableHeader className="sticky top-0 bg-background">
              <TableRow>
                <TableHead>ARTIKELNAMN</TableHead>
                <TableHead>KATEGORI</TableHead>
                <TableHead className="text-right">CO2-VÄRDE</TableHead>
                <TableHead>ENHET</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems?.map((item: CO2Item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell className="text-right">{item.co2Value}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      onClick={() => handleSelect(item)}
                      className="w-full"
                    >
                      Välj
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  )
}

