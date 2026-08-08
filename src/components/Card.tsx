import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  variant?: 'default' | 'elevated' | 'outlined'
}

export function Card({ children, className = '', onClick, variant = 'default' }: CardProps) {
  const variantClasses = {
    default: 'bg-white rounded-xl border border-gray-200/50 shadow-sm hover:shadow-md',
    elevated: 'bg-white rounded-xl border border-gray-200/50 shadow-md hover:shadow-lg',
    outlined: 'bg-transparent rounded-xl border-2 border-gray-200 hover:border-teal-300',
  }

  return (
    <div
      onClick={onClick}
      className={`transition-all duration-200 ${variantClasses[variant]} ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}
