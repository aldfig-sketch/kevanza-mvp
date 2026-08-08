import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  variant?: 'default' | 'elevated' | 'outlined'
}

export function Card({ children, className = '', onClick, variant = 'default' }: CardProps) {
  const baseStyles =
    'rounded-lg transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2'

  const variantClasses = {
    default:
      'bg-white border border-gray-200/50 shadow-sm hover:shadow-md hover:border-gray-300/70',
    elevated:
      'bg-white border border-gray-200/50 shadow-md hover:shadow-lg hover:border-gray-300/70',
    outlined:
      'bg-transparent border-2 border-gray-200 hover:border-teal-400/50 hover:bg-teal-50/30',
  }

  return (
    <div
      onClick={onClick}
      className={`${baseStyles} ${variantClasses[variant]} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
