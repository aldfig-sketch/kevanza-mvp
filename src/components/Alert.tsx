import { ReactNode } from 'react'
import { AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react'

interface AlertProps {
  children: ReactNode
  type?: 'success' | 'error' | 'warning' | 'info'
  onClose?: () => void
  className?: string
}

export function Alert({ children, type = 'info', onClose, className = '' }: AlertProps) {
  const config = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: CheckCircle,
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: AlertCircle,
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: AlertTriangle,
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: Info,
    },
  }

  const c = config[type]
  const Icon = c.icon

  return (
    <div className={`flex gap-3 p-4 rounded-lg border ${c.bg} ${c.border} ${c.text} ${className}`}>
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm">{children}</p>
      </div>
      {onClose && (
        <button onClick={onClose} className="text-lg leading-none hover:opacity-70">
          ×
        </button>
      )}
    </div>
  )
}
