import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ArvodeSectionProps {
  arvode: number
  area: number
  co2Budget: number
  onChangeArvode: (value: number) => void
  onChangeArea: (value: number) => void
  onChangeCo2Budget: (value: number) => void
}

export function ArvodeSection({
  arvode,
  area,
  co2Budget,
  onChangeArvode,
  onChangeArea,
  onChangeCo2Budget,
}: ArvodeSectionProps) {
  return (
    <div className="bg-card border rounded-lg p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Arvode</h2>
      <div className="grid grid-cols-3 gap-6 mb-4">
        <div>
          <Label htmlFor="arvode">Arvode (%)</Label>
          <div className="flex items-center gap-2 mt-2">
            <Input
              id="arvode"
              type="number"
              value={arvode}
              onChange={(e) => onChangeArvode(Number(e.target.value))}
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
      <p className="text-sm text-muted-foreground">
        Procentuellt arvode på totalkostnaden
      </p>
    </div>
  )
}

