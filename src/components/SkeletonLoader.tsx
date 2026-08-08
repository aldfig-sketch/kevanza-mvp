export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200/50 p-6 animate-pulse">
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-8 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  )
}

export function SkeletonChart() {
  return (
    <div className="bg-white rounded-xl border border-gray-200/50 p-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded"></div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonTable() {
  return (
    <div className="bg-white rounded-xl border border-gray-200/50 overflow-hidden animate-pulse">
      <div className="p-6 border-b border-gray-200 flex gap-4">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>
      {[...Array(3)].map((_, i) => (
        <div key={i} className="p-6 border-b border-gray-200 flex gap-4">
          <div className="h-4 bg-gray-100 rounded w-1/4"></div>
          <div className="h-4 bg-gray-100 rounded w-1/4"></div>
          <div className="h-4 bg-gray-100 rounded w-1/4"></div>
        </div>
      ))}
    </div>
  )
}
