import { ReactNode } from 'react'

interface StatBadgeProps {
  label: string
  value: string | number
  icon?: ReactNode
  variant?: 'primary' | 'success' | 'warning' | 'info'
}

export function StatBadge({ label, value, icon, variant = 'primary' }: StatBadgeProps) {
  const variantClasses = {
    primary: 'bg-teal-50 text-teal-900',
    success: 'bg-green-50 text-green-900',
    warning: 'bg-orange-50 text-orange-900',
    info: 'bg-blue-50 text-blue-900',
  }

  return (
    <div className={`rounded-lg p-4 ${variantClasses[variant]}`}>
      <div className="flex items-center gap-2 mb-1">
        {icon && <span className="text-lg">{icon}</span>}
        <p className="text-xs font-medium uppercase tracking-wide opacity-75">{label}</p>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}
