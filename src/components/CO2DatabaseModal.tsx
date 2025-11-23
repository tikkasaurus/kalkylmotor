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
import { Search, X } from 'lucide-react'

interface CO2Item {
  id: number
  artikelnamn: string
  kategori: string
  co2Varde: number
  enhet: string
}

interface CO2DatabaseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect?: (item: CO2Item) => void
}

const co2Items: CO2Item[] = [
  { id: 1, artikelnamn: 'Betong C30/37', kategori: 'Betong', co2Varde: 125, enhet: 'kg CO2/m³' },
  { id: 2, artikelnamn: 'Betong C25/30', kategori: 'Betong', co2Varde: 110, enhet: 'kg CO2/m³' },
  { id: 3, artikelnamn: 'Armering B500B', kategori: 'Stål', co2Varde: 1850, enhet: 'kg CO2/ton' },
  { id: 4, artikelnamn: 'Konstruktionsstål S355', kategori: 'Stål', co2Varde: 1920, enhet: 'kg CO2/ton' },
  { id: 5, artikelnamn: 'Träreglar 45x145', kategori: 'Trä', co2Varde: 12, enhet: 'kg CO2/m³' },
  { id: 6, artikelnamn: 'Limträ GL30c', kategori: 'Trä', co2Varde: 45, enhet: 'kg CO2/m³' },
  { id: 7, artikelnamn: 'Gips 13mm', kategori: 'Gips', co2Varde: 6.5, enhet: 'kg CO2/m³' },
  { id: 8, artikelnamn: 'Mineralull 195mm', kategori: 'Isolering', co2Varde: 8.2, enhet: 'kg CO2/m³' },
  { id: 9, artikelnamn: 'Tegel röd', kategori: 'Tegel', co2Varde: 180, enhet: 'kg CO2/1000 st' },
  { id: 10, artikelnamn: 'Betongpannor', kategori: 'Tak', co2Varde: 15, enhet: 'kg CO2/m³' },
]

export function CO2DatabaseModal({ open, onOpenChange, onSelect }: CO2DatabaseModalProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredItems = co2Items.filter(
    (item) =>
      item.artikelnamn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.kategori.toLowerCase().includes(searchQuery.toLowerCase())
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
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
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
              {filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.artikelnamn}</TableCell>
                  <TableCell>{item.kategori}</TableCell>
                  <TableCell className="text-right">{item.co2Varde}</TableCell>
                  <TableCell>{item.enhet}</TableCell>
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

