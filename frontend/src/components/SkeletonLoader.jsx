function SkeletonBlock({ className = '' }) {
  return <div className={`skeleton rounded-lg ${className}`} />
}

export function AnalysisSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
      {/* Header skeleton */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="skeleton w-40 h-40 rounded-full" />
          <div className="flex-1 space-y-3 w-full">
            <SkeletonBlock className="h-6 w-3/4" />
            <SkeletonBlock className="h-4 w-full" />
            <SkeletonBlock className="h-4 w-2/3" />
          </div>
        </div>
      </div>

      {/* Skills skeleton */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-6 space-y-3">
          <SkeletonBlock className="h-5 w-32" />
          <div className="flex flex-wrap gap-2">
            {[80, 110, 65, 95, 75].map((w, i) => (
              <SkeletonBlock key={i} className="h-7 rounded-full" style={{ width: w }} />
            ))}
          </div>
        </div>
        <div className="card p-6 space-y-3">
          <SkeletonBlock className="h-5 w-32" />
          <div className="flex flex-wrap gap-2">
            {[90, 70, 120, 80].map((w, i) => (
              <SkeletonBlock key={i} className="h-7 rounded-full" style={{ width: w }} />
            ))}
          </div>
        </div>
      </div>

      {/* Bullets skeleton */}
      <div className="card p-6 space-y-4">
        <SkeletonBlock className="h-5 w-48" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="card p-4 space-y-2">
            <SkeletonBlock className="h-4 w-full" />
            <SkeletonBlock className="h-4 w-5/6" />
          </div>
        ))}
      </div>

      {/* Cover letter skeleton */}
      <div className="card p-6 space-y-3">
        <SkeletonBlock className="h-5 w-36" />
        {[1, 2, 3, 4, 5].map((i) => (
          <SkeletonBlock key={i} className={`h-4 ${i % 3 === 0 ? 'w-3/4' : 'w-full'}`} />
        ))}
      </div>
    </div>
  )
}

export function HistorySkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="card p-5">
          <div className="flex items-center gap-4">
            <SkeletonBlock className="w-12 h-12 rounded-xl" />
            <div className="flex-1 space-y-2">
              <SkeletonBlock className="h-4 w-3/4" />
              <SkeletonBlock className="h-3 w-1/3" />
            </div>
            <SkeletonBlock className="w-16 h-8 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}