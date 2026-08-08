import { ReactNode, useState } from 'react'
import { HelpCircle } from 'lucide-react'

interface TooltipProps {
  text: string
  children?: ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export function Tooltip({ text, children, position = 'top' }: TooltipProps) {
  const [visible, setVisible] = useState(false)

  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2',
  }

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className="cursor-help"
      >
        {children || <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600" />}
      </div>

      {visible && (
        <div
          className={`absolute ${positionClasses[position]} left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap pointer-events-none`}
        >
          {text}
          <div
            className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
              position === 'top' ? '-bottom-1 left-1/2 -translate-x-1/2' : ''
            } ${position === 'bottom' ? '-top-1 left-1/2 -translate-x-1/2' : ''}`}
          />
        </div>
      )}
    </div>
  )
}
