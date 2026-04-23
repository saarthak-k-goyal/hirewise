import { ArrowRight, TrendingUp } from 'lucide-react'

export default function BulletCard({ original, improved, index }) {
  return (
    <div className="card p-0 overflow-hidden animate-slide-up"
         style={{ animationDelay: `${index * 0.1}s` }}>
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-dark-700 bg-dark-700/30">
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-brand-400" />
          <span className="text-xs font-semibold text-dark-300 uppercase tracking-wider">
            Bullet Point {index + 1}
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-dark-700">
        {/* Original */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
            <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">
              Original
            </span>
          </div>
          <p className="text-sm text-dark-300 leading-relaxed font-mono">{original}</p>
        </div>

        {/* Improved */}
        <div className="p-4 bg-green-500/[0.03]">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
            <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">
              Improved
            </span>
          </div>
          <p className="text-sm text-dark-100 leading-relaxed font-mono">{improved}</p>
        </div>
      </div>

      {/* Arrow indicator for mobile */}
      <div className="md:hidden flex justify-center py-2 border-t border-dark-700">
        <ArrowRight size={16} className="text-dark-500 rotate-90" />
      </div>
    </div>
  )
}