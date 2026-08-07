import { ReactNode } from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  isLoading?: boolean
}

export function Button({
  children,
  variant = 'primary',
  isLoading,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'font-medium py-2 px-4 rounded-lg transition-colors inline-flex items-center gap-2'

  const variants = {
    primary: 'bg-teal-600 hover:bg-teal-700 text-white disabled:bg-gray-400',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 disabled:bg-gray-300',
    danger: 'bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-400',
  }

  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]}`}
    >
      {isLoading ? (
        <>
          <span className="inline-block animate-spin">⟳</span>
          Procesando...
        </>
      ) : (
        children
      )}
    </button>
  )
}
