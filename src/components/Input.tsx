import { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helpText?: string
  icon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helpText, icon, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-900 mb-1.5">
            {label}
          </label>
        )}

        <div className="relative">
          {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}

          <input
            ref={ref}
            className={`w-full px-4 py-2.5 border-2 rounded-lg transition-all duration-200 ${
              icon ? 'pl-10' : ''
            } ${
              error
                ? 'border-red-300 bg-red-50/30 text-red-900 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200'
                : 'border-gray-200 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100'
            } placeholder:text-gray-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed ${className}`}
            {...props}
          />
        </div>

        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        {helpText && !error && <p className="text-xs text-gray-500 mt-1">{helpText}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
