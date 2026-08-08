import { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
}

export function Badge({ children, variant = 'default' }: BadgeProps) {
  const variants = {
    default:
      'bg-gray-200/50 backdrop-blur-sm text-gray-700 border border-gray-300/30 shadow-sm',
    success:
      'bg-green-100/50 backdrop-blur-sm text-green-700 border border-green-300/30 shadow-sm',
    warning:
      'bg-orange-100/50 backdrop-blur-sm text-orange-700 border border-orange-300/30 shadow-sm',
    danger: 'bg-red-100/50 backdrop-blur-sm text-red-700 border border-red-300/30 shadow-sm',
    info: 'bg-blue-100/50 backdrop-blur-sm text-blue-700 border border-blue-300/30 shadow-sm',
  }

  return (
    <span
      className={`inline-block px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${variants[variant]}`}
    >
      {children}
    </span>
  )
}
