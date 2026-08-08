import { ReactNode } from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles =
    'font-medium inline-flex items-center gap-2 rounded-lg transition-all duration-200 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2'

  const sizeClasses = {
    sm: 'py-1.5 px-3 text-sm',
    md: 'py-2.5 px-4 text-sm',
    lg: 'py-3 px-6 text-base',
  }

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 hover:shadow-lg text-white shadow-md disabled:from-gray-400 disabled:to-gray-400 disabled:shadow-none focus-visible:outline-teal-500',
    secondary:
      'bg-gray-200 hover:bg-gray-300 text-gray-900 hover:shadow-md disabled:bg-gray-300 disabled:text-gray-400 focus-visible:outline-gray-500',
    danger:
      'bg-red-600 hover:bg-red-700 hover:shadow-lg text-white shadow-md disabled:bg-gray-400 disabled:shadow-none focus-visible:outline-red-500',
    ghost:
      'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:text-gray-400 focus-visible:outline-gray-500',
  }

  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          Procesando...
        </>
      ) : (
        children
      )}
    </button>
  )
}
