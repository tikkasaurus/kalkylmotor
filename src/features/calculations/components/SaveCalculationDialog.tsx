import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
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
import { useCreateCalculation } from '../api/queries'

const saveCalculationSchema = z.object({
  calculationName: z.string().min(1, 'Kalkylnamn är obligatoriskt'),
  projectName: z.string().min(1, 'Projektnamn är obligatoriskt'),
})

type SaveCalculationFormData = z.infer<typeof saveCalculationSchema>

interface SaveCalculationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bidAmount: number
  formatCurrency: (amount: number) => string
  onSuccess?: () => void
  hasSections?: boolean
  calculationName: string
  projectName: string
}

export function SaveCalculationDialog({
  open,
  onOpenChange,
  bidAmount,
  formatCurrency,
  onSuccess,
  hasSections = true,
  calculationName: initialCalculationName,
  projectName: initialProjectName,
}: SaveCalculationDialogProps) {
  const createCalculation = useCreateCalculation()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<SaveCalculationFormData>({
    resolver: zodResolver(saveCalculationSchema),
    defaultValues: {
      calculationName: initialCalculationName,
      projectName: initialProjectName,
    },
  })

  const calculationNameValue = watch('calculationName')
  const projectNameValue = watch('projectName')

  useEffect(() => {
    if (open) {
      setError(null)
      reset({
        calculationName: initialCalculationName,
        projectName: initialProjectName,
      })
    }
  }, [open, initialCalculationName, initialProjectName, reset])

  const onSubmit = async (data: SaveCalculationFormData) => {
    try {
      setError(null)
      
      // Validate that there's calculation data
      if (!hasSections) {
        setError('Kalkylen måste innehålla minst ett avsnitt med data för att kunna sparas.')
        return
      }
      
      if (bidAmount <= 0) {
        setError('Kalkylsumman måste vara större än 0 för att kunna sparas.')
        return
      }
      
      const calculationData = {
        name: data.calculationName.trim(),
        project: data.projectName.trim(),
        status: 'Aktiv' as const,
        amount: formatCurrency(bidAmount),
        created: new Date().toISOString().split('T')[0],
        createdBy: 'Gustaf',
        revision: '1',
      }

      await createCalculation.mutateAsync(calculationData)
      
      reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      console.error('Error saving calculation:', err)
      setError(
        err instanceof Error
          ? err.message
          : 'Ett fel uppstod vid sparande av kalkylen'
      )
    }
  }

  const handleSave = handleSubmit(onSubmit)

  const handleClose = () => {
    if (!isSubmitting) {
      setError(null)
      reset()
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Spara kalkyl</DialogTitle>
          <DialogDescription>
            Fyll i informationen nedan för att spara kalkylen. Totalsumma:{' '}
            <span className="font-semibold">{formatCurrency(bidAmount)}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="calculationName">
              Kalkylnamn <span className="text-destructive">*</span>
            </Label>
            <Input
              id="calculationName"
              {...register('calculationName')}
              placeholder="T.ex. Tosito, Nässjö: Centrallager Trafikverket"
              aria-invalid={errors.calculationName ? 'true' : 'false'}
            />
            {errors.calculationName && (
              <p className="text-sm text-destructive">{errors.calculationName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="projectName">
              Projektnamn <span className="text-destructive">*</span>
            </Label>
            <Input
              id="projectName"
              {...register('projectName')}
              placeholder="T.ex. Marcus Test"
              aria-invalid={errors.projectName ? 'true' : 'false'}
            />
            {errors.projectName && (
              <p className="text-sm text-destructive">{errors.projectName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Totalsumma</p>
            <p className="text-base font-semibold">{formatCurrency(bidAmount)}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Skapad av</p>
            <p className="text-base">Gustaf</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Revision</p>
            <p className="text-base">1</p>
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Avbryt
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sparar...' : 'Spara'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

