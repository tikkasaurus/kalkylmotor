import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Toast {
  id: number
  message: string
  type: 'success' | 'error'
}

let toastId = 0
let toastListeners: Array<(toasts: Toast[]) => void> = []
const toasts: Toast[] = []

const notifyListeners = () => {
  toastListeners.forEach((listener) => listener([...toasts]))
}

export const toast = {
  success: (message: string) => {
    const id = ++toastId
    toasts.push({ id, message, type: 'success' })
    notifyListeners()
    setTimeout(() => {
      const index = toasts.findIndex((t) => t.id === id)
      if (index > -1) {
        toasts.splice(index, 1)
        notifyListeners()
      }
    }, 3000)
  },
  error: (message: string) => {
    const id = ++toastId
    toasts.push({ id, message, type: 'error' })
    notifyListeners()
    setTimeout(() => {
      const index = toasts.findIndex((t) => t.id === id)
      if (index > -1) {
        toasts.splice(index, 1)
        notifyListeners()
      }
    }, 3000)
  },
}

function ToastItem({ toast: toastItem }: { toast: Toast }) {
  const removeToast = useCallback(() => {
    const index = toasts.findIndex((t) => t.id === toastItem.id)
    if (index > -1) {
      toasts.splice(index, 1)
      notifyListeners()
    }
  }, [toastItem.id])

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-md shadow-lg border min-w-[300px]',
        toastItem.type === 'success' 
          ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-900 dark:text-green-100'
          : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100'
      )}
    >
      {toastItem.type === 'success' ? (
        <Check className="w-5 h-5 flex-shrink-0" />
      ) : (
        <X className="w-5 h-5 flex-shrink-0" />
      )}
      <span className="font-medium flex-1">{toastItem.message}</span>
      <button
        onClick={removeToast}
        className="ml-2 hover:opacity-70 transition-opacity flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  )
}

export function ToastContainer() {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>([])

  useEffect(() => {
    const listener = (newToasts: Toast[]) => {
      setCurrentToasts(newToasts)
    }
    toastListeners.push(listener)
    listener([...toasts])
    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener)
    }
  }, [])

  return (
    <div className="fixed top-4 right-4 z-[100] pointer-events-none">
      <AnimatePresence>
        {currentToasts.map((toastItem, index) => (
          <div key={toastItem.id} style={{ marginTop: index > 0 ? '0.5rem' : 0 }} className="pointer-events-auto">
            <ToastItem toast={toastItem} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}
