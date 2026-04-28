import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface MarkupConfirmDialogProps {
  open: boolean
  title: string
  requireInput: boolean
  initialPercent?: number | ''
  onCancel: () => void
  onConfirm: (percent: number) => void
}

export function MarkupConfirmDialog({
  open,
  title,
  requireInput,
  initialPercent = '',
  onCancel,
  onConfirm,
}: MarkupConfirmDialogProps) {
  const [percent, setPercent] = useState<number | ''>(initialPercent)

  useEffect(() => {
    if (open) setPercent(initialPercent)
  }, [open, initialPercent])

  const canConfirm = !requireInput || percent !== ''

  const handleConfirm = () => {
    if (!canConfirm) return
    onConfirm(Number(percent))
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onCancel() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {requireInput && (
          <div className="flex items-center gap-2 py-2">
            <Label htmlFor="markupPercentDialog" className="text-sm whitespace-nowrap">Påslag (%):</Label>
            <Input
              id="markupPercentDialog"
              type="number"
              value={percent}
              onChange={(e) => {
                const v = e.target.value
                setPercent(v === '' ? '' : Number(v))
              }}
              className="w-24 h-8"
              autoFocus
            />
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Avbryt</Button>
          <Button onClick={handleConfirm} disabled={!canConfirm}>Bekräfta</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
