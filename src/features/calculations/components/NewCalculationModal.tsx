import { useState, useEffect, useRef } from 'react'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FileText, ChevronRight, Trash } from 'lucide-react'
import { emptyTemplate } from '@/lib/calculationTemplates'
import { useGetTemplates, useDeleteCostEstimate } from '../api/queries'
import { toast } from '@/components/ui/toast'

interface NewCalculationModalProps {
  isOpen: boolean
  onClose: () => void
  onTemplateSelect: (templateId: number | string) => void
}

export function NewCalculationModal({
  isOpen,
  onClose,
  onTemplateSelect,
}: NewCalculationModalProps) {
  const { data: remoteTemplates = [], refetch } = useGetTemplates()
  const { mutate: deleteCostEstimate } = useDeleteCostEstimate()
  const templates = [emptyTemplate, ...remoteTemplates]
  const [contextMenu, setContextMenu] = useState<{
    open: boolean
    x: number
    y: number
    templateId: number | null
  }>({
    open: false,
    x: 0,
    y: 0,
    templateId: null,
  })
  const contextMenuRef = useRef<HTMLDivElement>(null)
  const deleteInProgressRef = useRef(false)

  const handleContextMenu = (e: React.MouseEvent, templateId: number | string) => {
    // Only show context menu for remote templates (numeric IDs), not for emptyTemplate
    if (typeof templateId === 'string') return
    
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({
      open: true,
      x: e.clientX,
      y: e.clientY,
      templateId: templateId,
    })
  }

  const handleDeleteTemplate = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const templateId = contextMenu.templateId
    if (templateId === null) return
    
    deleteInProgressRef.current = true
    setContextMenu({ open: false, x: 0, y: 0, templateId: null })
    
    deleteCostEstimate(templateId, {
      onSuccess: () => {
        toast.success('Mall borttagen')
        refetch()
        setTimeout(() => {
          deleteInProgressRef.current = false
        }, 200)
      },
      onError: (err) => {
        console.error('Error deleting template:', err)
        deleteInProgressRef.current = false
      },
    })
  }

  // Close context menu when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setContextMenu({ open: false, x: 0, y: 0, templateId: null })
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setContextMenu({ open: false, x: 0, y: 0, templateId: null })
      }
    }

    if (contextMenu.open) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [contextMenu.open])
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Skapa ny kalkyl</DialogTitle>
        </DialogHeader>
        <ScrollArea className="mt-4 max-h-[60vh]">
          <div className="flex flex-col gap-3 pr-4">
            {templates.map((template) => (
              <div
                key={template.id}
                onContextMenu={(e) => handleContextMenu(e, template.id)}
                className="rounded-lg border border-border hover:bg-accent hover:border-accent-foreground/20 transition-all group"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    if (deleteInProgressRef.current || contextMenu.open) {
                      e.preventDefault()
                      e.stopPropagation()
                      return
                    }
                    onTemplateSelect(template.id)
                  }}
                  className="flex items-start gap-4 p-4 w-full text-left"
                >
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-10 h-10 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-base">{template.title}</h3>
                      {template.popular && (
                        <Badge variant="secondary" className="text-xs">
                          Populär
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {template.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0 mt-1">
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>

      {/* Context Menu */}
      {contextMenu.open && (
        <div
          ref={contextMenuRef}
          className="fixed z-[100] min-w-[12rem] rounded-md border bg-popover p-1 text-popover-foreground shadow-md pointer-events-auto"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.preventDefault()}
        >
          <button
            type="button"
            onClick={handleDeleteTemplate}
            onMouseDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            className="relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-red-500 outline-none transition-colors hover:bg-accent hover:text-red-600 focus:bg-accent focus:text-red-600"
          >
            <Trash className="h-4 w-4 text-muted-foreground" />
            Ta bort mall
          </button>
        </div>
      )}
    </Dialog>
  )
}

