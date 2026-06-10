import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface NewVersionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  suggestedName?: string
  onSubmit: (name: string) => Promise<void>
}

export function NewVersionDialog({
  open,
  onOpenChange,
  suggestedName = '',
  onSubmit,
}: NewVersionDialogProps) {
  const [name, setName] = useState(suggestedName)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setName(suggestedName)
      setError(null)
    }
  }, [open, suggestedName])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Versionsnamn är obligatoriskt')
      return
    }
    try {
      setIsSubmitting(true)
      setError(null)
      await onSubmit(trimmed)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunde inte skapa version')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !isSubmitting && onOpenChange(o)}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Spara som ny version</DialogTitle>
          <DialogDescription>
            Skapar en kopia av nuvarande version som du kan fortsätta arbeta i. Den befintliga versionen sparas som tidigare revision.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="versionName">
              Versionsnamn <span className="text-destructive">*</span>
            </Label>
            <Input
              id="versionName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="T.ex. Reviderad efter kundmöte"
              autoFocus
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Avbryt
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Skapar...' : 'Skapa version'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
