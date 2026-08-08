interface ProgressBarProps {
  label: string
  value: number
  max?: number
  color?: 'teal' | 'blue' | 'green' | 'purple' | 'orange'
  showPercentage?: boolean
}

export function ProgressBar({
  label,
  value,
  max = 100,
  color = 'teal',
  showPercentage = true,
}: ProgressBarProps) {
  const percentage = (value / max) * 100

  const colorClasses = {
    teal: 'bg-teal-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {showPercentage && (
          <span className="text-sm font-semibold text-gray-900">{Math.round(percentage)}%</span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${colorClasses[color]}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  )
}
